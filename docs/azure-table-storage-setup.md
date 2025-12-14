# Azure Table Storage Setup Guide

This guide covers the setup and configuration of Azure Table Storage for the Interview Tracking Application.

## Overview

Azure Table Storage is used as the primary data store for candidate information. It provides:
- NoSQL key-value storage
- High availability and durability
- Cost-effective storage solution
- Integration with Azure Functions
- Table structure optimized for candidate data

## Prerequisites

- Azure subscription
- Azure CLI installed (`az --version` to verify)
- Appropriate permissions to create resources
- Resource group for the project

## 1. Create Azure Storage Account

### Using Azure CLI

```bash
# Set variables
RESOURCE_GROUP="rg-interviews-seneca"
LOCATION="eastus"
STORAGE_ACCOUNT_NAME="stintseneca" # Must be globally unique, 3-24 lowercase letters and numbers
ENVIRONMENT="dev" # or "prod"

# Create resource group (if not exists)
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create storage account
az storage account create \
  --name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot \
  --https-only true \
  --min-tls-version TLS1_2 \
  --allow-blob-public-access false
```

### Storage Account Configuration

- **SKU**: `Standard_LRS` (Locally Redundant Storage) for dev, `Standard_GRS` (Geo-Redundant Storage) for production
- **Kind**: `StorageV2` (General-purpose v2)
- **Access Tier**: `Hot` (for frequently accessed data)
- **HTTPS Only**: Enabled for security
- **Minimum TLS Version**: 1.2
- **Public Blob Access**: Disabled

### Using Azure Portal

1. Navigate to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" > "Storage account"
3. Fill in the details:
   - **Subscription**: Your subscription
   - **Resource group**: Create new or select existing
   - **Storage account name**: Globally unique name (e.g., `stintsenecadev`)
   - **Region**: Same as your application
   - **Performance**: Standard
   - **Redundancy**: LRS (dev) or GRS (prod)
4. Advanced tab:
   - Enable "Require secure transfer for REST API operations"
   - Set minimum TLS version to 1.2
   - Disable "Allow Blob public access"
5. Review and create

## 2. Create Tables

### Create the Candidates Table

```bash
# Get storage account connection string
CONNECTION_STRING=$(az storage account show-connection-string \
  --name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
  --resource-group $RESOURCE_GROUP \
  --query connectionString \
  --output tsv)

# Create the candidates table
az storage table create \
  --name candidates \
  --connection-string "$CONNECTION_STRING"
```

### Table Schema

The `candidates` table uses Azure Table Storage's schema-less design with the following structure:

**Partition Key**: `CANDIDATE` (all candidates in same partition for simplicity in MVP)
**Row Key**: UUID (unique identifier for each candidate)

**Properties**:
- `firstName`: string
- `lastName`: string
- `email`: string (unique)
- `phone`: string
- `position`: string
- `status`: string (enum: Applied, Screening, Interview, Offer, Rejected, Hired)
- `interviewStage`: string (enum: Phone, Technical, Manager, Final)
- `applicationDate`: DateTime
- `notes`: string
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `createdBy`: string
- `updatedBy`: string

### Additional Tables (Future)

For production, consider partitioning strategy:
- Use position or date-based partitions for better query performance
- Create separate tables for audit logs, attachments, etc.

## 3. Configure Connection Strings

### Retrieve Connection String

```bash
# Primary connection string
az storage account show-connection-string \
  --name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
  --resource-group $RESOURCE_GROUP \
  --query connectionString \
  --output tsv

# Get individual keys
az storage account keys list \
  --account-name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
  --resource-group $RESOURCE_GROUP \
  --query '[0].value' \
  --output tsv
```

### Connection String Format

```
DefaultEndpointsProtocol=https;AccountName=<account-name>;AccountKey=<account-key>;EndpointSuffix=core.windows.net
```

### Configure Application Settings

**Backend (Azure Functions)**:

Update `backend/local.settings.json` for local development:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_STORAGE_CONNECTION_STRING": "<your-connection-string>",
    "TABLE_NAME": "candidates"
  }
}
```

**For Azure deployment**, configure in Function App settings:
```bash
az functionapp config appsettings set \
  --name <function-app-name> \
  --resource-group $RESOURCE_GROUP \
  --settings \
    AZURE_STORAGE_CONNECTION_STRING="<connection-string>" \
    TABLE_NAME="candidates"
```

**Frontend**:

Frontend does not directly access Table Storage. All data access goes through the backend API.

## 4. Security Best Practices

### Access Keys Management

1. **Never commit connection strings to git**
   - Use `.env` files (add to `.gitignore`)
   - Use `.env.example` as template
   - Document required environment variables

2. **Use Azure Key Vault for production**
   ```bash
   # Create Key Vault
   az keyvault create \
     --name kv-int-seneca-${ENVIRONMENT} \
     --resource-group $RESOURCE_GROUP \
     --location $LOCATION

   # Store connection string
   az keyvault secret set \
     --vault-name kv-int-seneca-${ENVIRONMENT} \
     --name "StorageConnectionString" \
     --value "$CONNECTION_STRING"
   ```

3. **Rotate access keys regularly**
   - Azure Storage provides two keys
   - Rotate keys every 90 days
   - Use key rotation without downtime:
     ```bash
     # Regenerate key2 while key1 is in use
     az storage account keys renew \
       --account-name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
       --resource-group $RESOURCE_GROUP \
       --key key2

     # Update application to use key2
     # Then regenerate key1
     az storage account keys renew \
       --account-name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
       --resource-group $RESOURCE_GROUP \
       --key key1
     ```

4. **Use Managed Identity (recommended for production)**
   ```bash
   # Enable system-assigned managed identity for Function App
   az functionapp identity assign \
     --name <function-app-name> \
     --resource-group $RESOURCE_GROUP

   # Grant access to storage account
   az role assignment create \
     --role "Storage Table Data Contributor" \
     --assignee <function-app-principal-id> \
     --scope /subscriptions/<subscription-id>/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}
   ```

### Network Security

1. **Enable firewall rules** (production):
   ```bash
   # Restrict access to specific IPs or VNets
   az storage account network-rule add \
     --account-name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
     --resource-group $RESOURCE_GROUP \
     --ip-address <your-ip>
   ```

2. **Disable public access** (already configured above)

3. **Use private endpoints** (optional, for enhanced security):
   - Create VNet and subnet
   - Configure private endpoint for storage account
   - Update DNS resolution

### Monitoring and Alerts

```bash
# Enable diagnostic logging
az monitor diagnostic-settings create \
  --name "StorageLogging" \
  --resource "/subscriptions/<subscription-id>/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
  --logs '[{"category":"StorageRead","enabled":true},{"category":"StorageWrite","enabled":true}]' \
  --metrics '[{"category":"Transaction","enabled":true}]' \
  --workspace <log-analytics-workspace-id>
```

## 5. Local Development with Azurite

For local development, use Azurite (Azure Storage Emulator):

### Install Azurite

```bash
npm install -g azurite
```

### Start Azurite

```bash
# Start all services
azurite --silent --location ./azurite --debug ./azurite/debug.log

# Or start only Table service
azurite-table --silent --location ./azurite
```

### Local Connection String

```
DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;
```

Or simply use:
```
UseDevelopmentStorage=true
```

### Create Local Tables

```bash
# Using Azure Storage Explorer or CLI with local connection string
az storage table create \
  --name candidates \
  --connection-string "UseDevelopmentStorage=true"
```

## 6. Testing the Setup

### Verify Storage Account

```bash
# Check storage account exists
az storage account show \
  --name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
  --resource-group $RESOURCE_GROUP

# List tables
az storage table list \
  --connection-string "$CONNECTION_STRING" \
  --output table
```

### Test Data Operations

```bash
# Insert a test entity
az storage entity insert \
  --table-name candidates \
  --connection-string "$CONNECTION_STRING" \
  --entity PartitionKey=TEST RowKey=test-001 firstName=John lastName=Doe email=john@example.com

# Query the entity
az storage entity show \
  --table-name candidates \
  --connection-string "$CONNECTION_STRING" \
  --partition-key TEST \
  --row-key test-001

# Delete test entity
az storage entity delete \
  --table-name candidates \
  --connection-string "$CONNECTION_STRING" \
  --partition-key TEST \
  --row-key test-001
```

## 7. Backup Strategy

See [azure-table-storage-backup.md](./azure-table-storage-backup.md) for detailed backup and disaster recovery procedures.

## 8. Cost Optimization

### Pricing Considerations

- **Storage**: ~$0.045 per GB/month
- **Transactions**: $0.0004 per 10,000 transactions
- **Data Transfer**: Varies by region

### Optimization Tips

1. **Use LRS for dev/test** (Standard_LRS)
2. **Monitor and analyze usage** with Azure Monitor
3. **Delete old/unnecessary data** regularly
4. **Use lifecycle management** for archival (if applicable)
5. **Consider reserved capacity** for production (cost savings)

## 9. Troubleshooting

### Common Issues

**Issue**: Connection timeout
```bash
# Check firewall rules
az storage account show \
  --name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
  --resource-group $RESOURCE_GROUP \
  --query networkRuleSet
```

**Issue**: Authentication failed
```bash
# Verify connection string
az storage account show-connection-string \
  --name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
  --resource-group $RESOURCE_GROUP

# Regenerate keys if needed
az storage account keys renew \
  --account-name "${STORAGE_ACCOUNT_NAME}${ENVIRONMENT}" \
  --resource-group $RESOURCE_GROUP \
  --key key1
```

**Issue**: Table not found
```bash
# List all tables
az storage table list \
  --connection-string "$CONNECTION_STRING"

# Create table if missing
az storage table create \
  --name candidates \
  --connection-string "$CONNECTION_STRING"
```

## 10. Next Steps

After completing this setup:

1. ✅ Update backend `local.settings.json` with connection string
2. ✅ Configure GitHub secrets for CI/CD
3. ✅ Test backend API endpoints with real Azure Table Storage
4. ✅ Set up monitoring and alerts
5. ✅ Document connection string in team wiki
6. ✅ Schedule access key rotation

## References

- [Azure Table Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/tables/)
- [Azure Storage Security Guide](https://docs.microsoft.com/en-us/azure/storage/common/storage-security-guide)
- [Azurite Emulator](https://docs.microsoft.com/en-us/azure/storage/common/storage-use-azurite)
- [@azure/data-tables SDK](https://www.npmjs.com/package/@azure/data-tables)
