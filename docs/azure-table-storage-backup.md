# Azure Table Storage Backup and Disaster Recovery Strategy

This document outlines the backup, recovery, and disaster recovery procedures for Azure Table Storage in the Interview Tracking Application.

## Overview

A comprehensive backup strategy ensures data durability, availability, and recoverability in case of:
- Accidental data deletion
- Data corruption
- Regional outages
- Security incidents
- Compliance requirements

## Backup Strategy

### 1. Azure Storage Redundancy

**Development Environment**:
- **Redundancy**: Locally Redundant Storage (LRS)
- **Copies**: 3 copies within a single datacenter
- **RPO**: Minutes
- **RTO**: Minutes
- **Cost**: Lowest

**Production Environment**:
- **Redundancy**: Geo-Redundant Storage (GRS) or Geo-Zone-Redundant Storage (GZRS)
- **Copies**: 6 copies (3 in primary region, 3 in secondary region)
- **RPO**: ~15 minutes
- **RTO**: < 1 hour (with RA-GRS)
- **Cost**: Higher, but provides geographic redundancy

### Configure Storage Redundancy

```bash
# Update storage account to GRS for production
az storage account update \
  --name <storage-account-name> \
  --resource-group <resource-group> \
  --sku Standard_GRS

# Or use GZRS for zone and geo redundancy
az storage account update \
  --name <storage-account-name> \
  --resource-group <resource-group> \
  --sku Standard_GZRS

# Enable read access to secondary region (RA-GRS)
az storage account update \
  --name <storage-account-name> \
  --resource-group <resource-group> \
  --sku Standard_RAGRS
```

### 2. Point-in-Time Backup

Azure Table Storage doesn't have built-in point-in-time restore. Implement custom backup solution:

#### Automated Daily Backups

Create an Azure Function that runs daily to export table data:

**Schedule**: Daily at 2:00 AM UTC

**Backup Script** (`backup-table-storage.ts`):

```typescript
import { TableClient } from "@azure/data-tables";
import { BlobServiceClient } from "@azure/storage-blob";

export async function backupTableStorage(
  tableConnectionString: string,
  blobConnectionString: string,
  tableName: string,
  backupContainerName: string = "table-backups"
) {
  const tableClient = TableClient.fromConnectionString(tableConnectionString, tableName);
  const blobServiceClient = BlobServiceClient.fromConnectionString(blobConnectionString);
  const containerClient = blobServiceClient.getContainerClient(backupContainerName);

  // Ensure container exists
  await containerClient.createIfNotExists();

  // Generate backup file name with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const blobName = `${tableName}-${timestamp}.json`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Query all entities
  const entities = [];
  for await (const entity of tableClient.listEntities()) {
    entities.push(entity);
  }

  // Upload to blob storage
  const content = JSON.stringify(entities, null, 2);
  await blockBlobClient.upload(content, content.length, {
    blobHTTPHeaders: { blobContentType: "application/json" },
  });

  console.log(`Backup completed: ${entities.length} entities backed up to ${blobName}`);
  return { blobName, entityCount: entities.length };
}
```

**Azure Function Timer Trigger** (`backup-timer-function.ts`):

```typescript
import { app, Timer, InvocationContext } from "@azure/functions";
import { backupTableStorage } from "../utils/backup-table-storage";

app.timer("backupTableStorageDaily", {
  // Run daily at 2 AM UTC
  schedule: "0 0 2 * * *",
  handler: async (timer: Timer, context: InvocationContext) => {
    const tableConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const blobConnectionString = process.env.BACKUP_BLOB_CONNECTION_STRING!;
    const tableName = process.env.TABLE_NAME || "candidates";

    try {
      const result = await backupTableStorage(
        tableConnectionString,
        blobConnectionString,
        tableName
      );
      context.log(`Backup successful: ${result.blobName}, ${result.entityCount} entities`);
    } catch (error) {
      context.error(`Backup failed: ${error}`);
      throw error; // Trigger retry
    }
  },
});
```

#### Backup Retention Policy

**Development**:
- Daily backups: Retain for 7 days
- Weekly backups: Retain for 4 weeks

**Production**:
- Daily backups: Retain for 30 days
- Weekly backups: Retain for 12 weeks
- Monthly backups: Retain for 12 months

**Implement using Azure Blob Lifecycle Management**:

```bash
# Create lifecycle policy JSON
cat > lifecycle-policy.json <<EOF
{
  "rules": [
    {
      "enabled": true,
      "name": "DeleteOldDailyBackups",
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "delete": {
              "daysAfterModificationGreaterThan": 30
            }
          }
        },
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["table-backups/candidates-"]
        }
      }
    },
    {
      "enabled": true,
      "name": "MoveOldBackupsToCool",
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "tierToCool": {
              "daysAfterModificationGreaterThan": 7
            }
          }
        },
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["table-backups/"]
        }
      }
    }
  ]
}
EOF

# Apply lifecycle policy
az storage account management-policy create \
  --account-name <storage-account-name> \
  --resource-group <resource-group> \
  --policy @lifecycle-policy.json
```

### 3. Transaction Logging (Audit Trail)

Implement audit logging for all data modifications:

**Create Audit Log Table**:
```bash
az storage table create \
  --name auditlogs \
  --connection-string "$CONNECTION_STRING"
```

**Audit Log Entry Structure**:
- PartitionKey: `AUDIT_{YYYY-MM-DD}`
- RowKey: `{TIMESTAMP}_{UUID}`
- Properties:
  - `tableName`: string
  - `operation`: string (INSERT, UPDATE, DELETE)
  - `entityKey`: string (PartitionKey:RowKey)
  - `userId`: string
  - `timestamp`: DateTime
  - `beforeData`: JSON (for UPDATE/DELETE)
  - `afterData`: JSON (for INSERT/UPDATE)

**Retention**: 7 years for compliance

### 4. Export/Import Capabilities

Provide manual export/import functionality for:
- Data migration
- Disaster recovery
- Compliance reporting

**Export CLI Script**:

```bash
#!/bin/bash
# export-table.sh

STORAGE_CONNECTION_STRING="$1"
TABLE_NAME="$2"
OUTPUT_FILE="${3:-${TABLE_NAME}-export-$(date +%Y%m%d-%H%M%S).json}"

az storage entity query \
  --table-name "$TABLE_NAME" \
  --connection-string "$STORAGE_CONNECTION_STRING" \
  > "$OUTPUT_FILE"

echo "Export completed: $OUTPUT_FILE"
```

**Import CLI Script**:

```bash
#!/bin/bash
# import-table.sh

STORAGE_CONNECTION_STRING="$1"
TABLE_NAME="$2"
INPUT_FILE="$3"

# Note: Implement proper import logic using Azure SDK
# This is a simplified example
echo "Import from $INPUT_FILE to $TABLE_NAME"
# Add actual import implementation
```

## Disaster Recovery Plan

### Recovery Point Objective (RPO)

- **Development**: 24 hours
- **Production**: 15 minutes (using GRS)

### Recovery Time Objective (RTO)

- **Development**: 4 hours
- **Production**: 1 hour

### Disaster Scenarios

#### Scenario 1: Accidental Data Deletion

**Detection**:
- User reports missing data
- Monitoring alerts on unusual delete operations

**Recovery Steps**:
1. Identify the time of deletion from audit logs
2. Retrieve the most recent backup before deletion
3. Extract deleted entities from backup
4. Restore entities to production table
5. Verify data integrity
6. Notify affected users

**Recovery Script**:
```bash
# Restore from backup
./restore-from-backup.sh \
  --backup-blob "candidates-2025-01-13T02-00-00.json" \
  --table "candidates" \
  --filter "PartitionKey eq 'CANDIDATE' and RowKey eq '<deleted-id>'"
```

#### Scenario 2: Data Corruption

**Detection**:
- Data validation errors
- User reports incorrect data
- Monitoring alerts

**Recovery Steps**:
1. Identify scope of corruption
2. Isolate affected data (create backup)
3. Restore from last known good backup
4. Validate restored data
5. Re-apply any valid changes since backup
6. Update application to prevent recurrence

#### Scenario 3: Regional Outage

**Detection**:
- Azure Service Health alerts
- Application monitoring failures
- Health check endpoint failures

**Recovery Steps** (for RA-GRS):
1. Verify primary region outage via Azure Portal
2. Update application configuration to use secondary region endpoint
3. Change connection string to secondary region:
   ```
   DefaultEndpointsProtocol=https;AccountName=<account-name>;AccountKey=<account-key>;TableEndpoint=https://<account-name>-secondary.table.core.windows.net/
   ```
4. Deploy application update
5. Monitor secondary region performance
6. Plan failback when primary region recovers

**Automated Failover** (using Traffic Manager or Front Door):
- Configure health probes
- Automatic routing to healthy region
- RTO: < 5 minutes

#### Scenario 4: Security Incident

**Detection**:
- Unauthorized access alerts
- Unusual data access patterns
- Security scanning results

**Recovery Steps**:
1. **Immediately**: Rotate all access keys
   ```bash
   az storage account keys renew \
     --account-name <storage-account-name> \
     --resource-group <resource-group> \
     --key key1

   az storage account keys renew \
     --account-name <storage-account-name> \
     --resource-group <resource-group> \
     --key key2
   ```
2. Review audit logs for breach timeline
3. Identify compromised data
4. Restore from backup before incident
5. Update security policies
6. Notify affected parties
7. Conduct security review

### Disaster Recovery Testing

**Schedule**: Quarterly DR drills

**Test Scenarios**:
1. **Monthly**: Restore single entity from backup
2. **Quarterly**: Full table restore to test environment
3. **Bi-annually**: Regional failover test
4. **Annually**: Complete disaster recovery simulation

**Test Checklist**:
- [ ] Backup restoration successful
- [ ] Data integrity verified
- [ ] Application functions correctly with restored data
- [ ] Recovery time meets RTO
- [ ] Recovery point meets RPO
- [ ] Team members know their roles
- [ ] Documentation is up-to-date

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Storage Availability**: > 99.9%
2. **Request Success Rate**: > 99.5%
3. **Request Latency**: < 100ms (p95)
4. **Backup Success Rate**: 100%
5. **Backup Size Trend**: Monitor growth

### Azure Monitor Alerts

```bash
# Create alert for failed backup
az monitor metrics alert create \
  --name "BackupFailed" \
  --resource-group <resource-group> \
  --scopes <function-app-resource-id> \
  --condition "count failedExecutionCount > 0" \
  --window-size 5m \
  --evaluation-frequency 5m \
  --action <action-group-id>

# Create alert for high latency
az monitor metrics alert create \
  --name "HighStorageLatency" \
  --resource-group <resource-group> \
  --scopes <storage-account-resource-id> \
  --condition "avg SuccessE2ELatency > 1000" \
  --window-size 15m \
  --evaluation-frequency 5m \
  --action <action-group-id>
```

## Data Recovery Procedures

### Restore Single Entity

```bash
# 1. Find backup file containing the entity
az storage blob list \
  --container-name table-backups \
  --connection-string "$BACKUP_CONNECTION_STRING" \
  --prefix "candidates-2025-01"

# 2. Download backup file
az storage blob download \
  --container-name table-backups \
  --name "candidates-2025-01-13T02-00-00.json" \
  --file ./backup.json \
  --connection-string "$BACKUP_CONNECTION_STRING"

# 3. Extract entity and restore (using custom script)
./restore-entity.sh \
  --backup-file ./backup.json \
  --row-key "<entity-id>" \
  --connection-string "$STORAGE_CONNECTION_STRING"
```

### Restore Entire Table

```bash
# 1. Create backup of current table (safety measure)
./backup-table.sh candidates "pre-restore-backup"

# 2. Clear current table (optional, based on scenario)
# Use with caution!

# 3. Download backup
az storage blob download \
  --container-name table-backups \
  --name "candidates-2025-01-13T02-00-00.json" \
  --file ./restore-backup.json \
  --connection-string "$BACKUP_CONNECTION_STRING"

# 4. Restore all entities
./restore-table.sh \
  --backup-file ./restore-backup.json \
  --table candidates \
  --connection-string "$STORAGE_CONNECTION_STRING"

# 5. Verify restoration
./verify-restore.sh candidates
```

## Compliance and Governance

### Data Retention

- **Candidate Data**: Retain for 7 years (compliance requirement)
- **Audit Logs**: Retain for 7 years
- **Backups**: Follow retention policy above
- **Deleted Data**: Soft delete with 30-day retention (implement at application level)

### Data Privacy

- **GDPR Compliance**: Implement data deletion upon request
- **Data Encryption**: At rest (automatic) and in transit (HTTPS)
- **Access Control**: Role-based access, principle of least privilege
- **Data Residency**: Store in appropriate region per regulations

## Cost Estimation

### Backup Storage Costs

**Assumptions**:
- Table size: 1 GB
- Daily backup: 1 GB/day
- Retention: 30 days
- Hot tier: 7 days, Cool tier: 23 days

**Monthly Cost**:
- Hot storage (7 GB): 7 × $0.0184 = $0.13
- Cool storage (23 GB): 23 × $0.01 = $0.23
- **Total**: ~$0.36/month

**Production with GRS**:
- Storage cost: 2× (primary + secondary)
- **Estimated**: ~$0.72/month for backups

### Optimization

- Use Cool tier for backups older than 7 days
- Compress backup files (JSON → gzip)
- Use incremental backups (future enhancement)

## Backup Verification

### Automated Verification

**Daily Backup Validation**:
1. Download latest backup
2. Verify JSON structure
3. Check entity count matches source
4. Validate critical fields
5. Send notification with results

**Verification Script**:
```typescript
export async function verifyBackup(backupBlobName: string) {
  // Download backup
  // Parse JSON
  // Validate structure
  // Compare entity count
  // Return validation results
}
```

## Runbook Summary

| Scenario | RTO | RPO | Recovery Steps |
|----------|-----|-----|----------------|
| Single entity deletion | 30 min | 24 hrs | Restore from daily backup |
| Table corruption | 1 hr | 24 hrs | Full table restore from backup |
| Regional outage | 15 min | 15 min | Failover to secondary region (GRS) |
| Security breach | 2 hrs | Varies | Rotate keys, restore clean backup |
| Accidental table deletion | 2 hrs | 24 hrs | Recreate table, restore from backup |

## Next Steps

1. ✅ Implement backup Azure Function
2. ✅ Configure lifecycle policies
3. ✅ Set up monitoring and alerts
4. ✅ Document runbooks for each scenario
5. ✅ Schedule quarterly DR tests
6. ✅ Train team on recovery procedures
7. ✅ Review and update strategy annually

## References

- [Azure Storage Redundancy](https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy)
- [Azure Table Storage Best Practices](https://docs.microsoft.com/en-us/azure/storage/tables/table-storage-design-guide)
- [Disaster Recovery Planning](https://docs.microsoft.com/en-us/azure/architecture/framework/resiliency/backup-and-recovery)
- [Azure Storage Lifecycle Management](https://docs.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-overview)
