# Infrastructure Deployment Plan

## Executive Summary

This document outlines the Infrastructure as Code (IaC) strategy and implementation plan for deploying the Interview Tracking Application infrastructure via automated pipelines.

## Current State Analysis

### Existing Infrastructure
- ✅ **Frontend**: React + TypeScript application (Vite)
- ✅ **Backend**: Azure Functions v4 with TypeScript
- ✅ **Database**: Azure Table Storage (documented, not deployed)
- ⚠️ **CI/CD**: Partial (frontend deployment workflow exists, manual setup required)
- ❌ **Monitoring**: Not configured
- ❌ **IaC**: No infrastructure code exists

### Infrastructure Components Needed

| Component | Purpose | Status |
|-----------|---------|--------|
| Azure Storage Account | Table Storage for candidates data | Documented (INFRA-004) |
| Azure Static Web Apps | Frontend hosting | Documented (DEPLOYMENT.md) |
| Azure Functions App | Backend API hosting | Needs IaC |
| Application Insights | Monitoring and logging | Not configured (INFRA-007) |
| Azure Key Vault | Secrets management | Documented (INFRA-004) |
| Azure Resource Group | Resource organization | Needs IaC |
| Azure Log Analytics | Centralized logging | Not configured |

## Infrastructure as Code Strategy

### Tool Selection: Azure Bicep

**Why Bicep over Terraform or ARM?**

✅ **Bicep Advantages**:
- Native Azure support, first-class citizen
- Simpler syntax than ARM templates
- Built-in validation and IntelliSense
- 100% Azure coverage on day 1
- Compiles to ARM templates (compatibility)
- Better for Azure-only deployments
- Free and open-source

❌ **Terraform Considerations**:
- Multi-cloud (not needed for this project)
- Additional tooling overhead
- State management complexity
- Larger learning curve for Azure-focused teams

**Decision**: Use **Azure Bicep** for IaC

### Repository Structure

```
infrastructure/
├── bicep/
│   ├── main.bicep                    # Main orchestration template
│   ├── modules/
│   │   ├── storage-account.bicep    # Azure Storage Account
│   │   ├── static-web-app.bicep     # Azure Static Web Apps
│   │   ├── function-app.bicep       # Azure Functions
│   │   ├── key-vault.bicep          # Azure Key Vault
│   │   ├── app-insights.bicep       # Application Insights
│   │   └── log-analytics.bicep      # Log Analytics Workspace
│   ├── parameters/
│   │   ├── dev.bicepparam           # Dev environment parameters
│   │   ├── staging.bicepparam       # Staging environment parameters
│   │   └── prod.bicepparam          # Production environment parameters
│   └── scripts/
│       ├── deploy.sh                # Deployment script
│       └── teardown.sh              # Cleanup script
├── .github/
│   └── workflows/
│       ├── infra-deploy-dev.yml     # Deploy to dev
│       ├── infra-deploy-staging.yml # Deploy to staging
│       ├── infra-deploy-prod.yml    # Deploy to prod
│       └── infra-validate.yml       # Validate on PR
└── docs/
    └── infrastructure-deployment-plan.md  # This document
```

## Environment Strategy

### Multi-Environment Setup

| Environment | Purpose | Deployment Trigger | Approval Required |
|-------------|---------|-------------------|-------------------|
| **Dev** | Development testing | Push to `main` or `develop` | No |
| **Staging** | Pre-production validation | Tag `release-*` or manual | Optional |
| **Production** | Live application | Tag `v*.*.*` or manual | Yes (required) |

### Resource Naming Convention

```
{resource-type}-{app-name}-{environment}-{region}-{instance}

Examples:
- st-intseneca-dev-eastus-001      (Storage Account)
- func-intseneca-prod-eastus-001   (Function App)
- kv-intseneca-staging-eastus-001  (Key Vault)
- appi-intseneca-dev-eastus-001    (Application Insights)
```

**Naming Rules**:
- Lowercase only
- No special characters except hyphens
- Max 24 characters for storage accounts (no hyphens)
- Globally unique names for storage accounts, key vaults

### Resource Organization

```
Azure Subscription
└── Resource Groups
    ├── rg-intseneca-dev-eastus
    │   ├── st-intseneca-dev (Storage Account)
    │   ├── func-intseneca-dev (Function App)
    │   ├── appi-intseneca-dev (App Insights)
    │   ├── kv-intseneca-dev (Key Vault)
    │   └── swa-intseneca-dev (Static Web App)
    │
    ├── rg-intseneca-staging-eastus
    │   └── [Same resources as dev]
    │
    └── rg-intseneca-prod-eastus
        └── [Same resources as dev]
```

## Detailed Infrastructure Design

### 1. Azure Storage Account (Table Storage)

**Purpose**: Store candidate data

**Configuration**:
- SKU: `Standard_LRS` (dev), `Standard_GRS` (prod)
- Kind: `StorageV2`
- Access Tier: `Hot`
- HTTPS Only: `true`
- Minimum TLS: `1.2`
- Tables: `candidates`, `auditlogs`

**Bicep Module**: `modules/storage-account.bicep`

### 2. Azure Static Web Apps

**Purpose**: Host React frontend

**Configuration**:
- SKU: `Free` (dev), `Standard` (prod)
- Auto-build: Enabled
- Custom domains: Configured in prod
- CDN: Included
- SSL: Auto-provisioned

**Bicep Module**: `modules/static-web-app.bicep`

### 3. Azure Functions

**Purpose**: Host backend API

**Configuration**:
- Runtime: Node.js 20
- Plan: Consumption (dev), Premium (prod)
- Always On: Enabled (Premium plan)
- App Settings:
  - `AZURE_STORAGE_CONNECTION_STRING` (from Key Vault)
  - `TABLE_NAME`: `candidates`
  - `APPINSIGHTS_INSTRUMENTATIONKEY` (from App Insights)

**Bicep Module**: `modules/function-app.bicep`

### 4. Azure Key Vault

**Purpose**: Secure secrets management

**Configuration**:
- SKU: `Standard`
- Access Policies: Managed Identity for Function App
- Soft Delete: Enabled (90 days)
- Purge Protection: Enabled (prod)
- Secrets:
  - `StorageConnectionString`
  - `AppInsightsInstrumentationKey`

**Bicep Module**: `modules/key-vault.bicep`

### 5. Application Insights

**Purpose**: Monitoring and telemetry

**Configuration**:
- Application Type: `web`
- Retention: 90 days (dev), 365 days (prod)
- Sampling: 100% (dev), 50% (prod)
- Integration: Frontend + Backend

**Bicep Module**: `modules/app-insights.bicep`

### 6. Log Analytics Workspace

**Purpose**: Centralized logging

**Configuration**:
- Retention: 30 days (dev), 90 days (prod)
- Integrations: App Insights, Function Apps

**Bicep Module**: `modules/log-analytics.bicep`

## CI/CD Pipeline Design

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions Workflows                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Infrastructure Validation (on PR)                       │
│     ├─ Bicep linting                                        │
│     ├─ Bicep build (compile to ARM)                         │
│     ├─ Azure resource validation                            │
│     └─ Cost estimation                                      │
│                                                              │
│  2. Infrastructure Deployment - Dev (on push to main)       │
│     ├─ Authenticate to Azure (OIDC)                         │
│     ├─ Create Resource Group                                │
│     ├─ Deploy Bicep templates                               │
│     ├─ Configure secrets in Key Vault                       │
│     ├─ Verify deployment                                    │
│     └─ Run smoke tests                                      │
│                                                              │
│  3. Infrastructure Deployment - Staging (on release tag)    │
│     ├─ Same as Dev                                          │
│     └─ Optional approval gate                               │
│                                                              │
│  4. Infrastructure Deployment - Prod (on v*.*.* tag)        │
│     ├─ Required approval                                    │
│     ├─ Same as Dev                                          │
│     ├─ Enhanced smoke tests                                 │
│     └─ Rollback capability                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### GitHub Actions Workflow: Infrastructure Validation

**Trigger**: Pull Request to `main`
**Purpose**: Validate infrastructure changes before merge

```yaml
name: Validate Infrastructure

on:
  pull_request:
    branches: [main]
    paths:
      - 'infrastructure/**'
      - '.github/workflows/infra-*.yml'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Bicep CLI
      - Lint Bicep files
      - Build Bicep to ARM
      - Validate against Azure subscription (dry-run)
      - Estimate costs (Azure Cost Estimator)
      - Comment results on PR
```

### GitHub Actions Workflow: Deploy to Dev

**Trigger**: Push to `main`, manual dispatch
**Purpose**: Deploy infrastructure to dev environment

```yaml
name: Deploy Infrastructure - Dev

on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/**'
  workflow_dispatch:

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    environment: development
    steps:
      - Checkout code
      - Azure login (OIDC)
      - Create resource group (idempotent)
      - Deploy main.bicep with dev parameters
      - Configure Key Vault secrets
      - Verify deployment
      - Run smoke tests
      - Notify on Slack/Teams
```

### GitHub Actions Workflow: Deploy to Production

**Trigger**: Git tag `v*.*.*`, manual dispatch
**Purpose**: Deploy infrastructure to production with approval

```yaml
name: Deploy Infrastructure - Production

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:

jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.interviews-seneca.com
    steps:
      - Checkout code
      - Wait for approval (GitHub Environment Protection)
      - Azure login (OIDC)
      - Create resource group (idempotent)
      - Deploy main.bicep with prod parameters
      - Configure Key Vault secrets
      - Verify deployment
      - Run comprehensive smoke tests
      - Create deployment record
      - Notify stakeholders
```

## Security Implementation

### 1. Managed Identities

**System-assigned Managed Identity for Function App**:
- Automatically created with Function App
- No credentials to manage
- Access to Storage Account and Key Vault

**Bicep Implementation**:
```bicep
identity: {
  type: 'SystemAssigned'
}
```

### 2. Azure Key Vault Integration

**Secrets Management**:
- All secrets stored in Key Vault
- Function App retrieves via Managed Identity
- No secrets in application settings
- Automatic rotation support

**Access Policy**:
```bicep
accessPolicies: [
  {
    tenantId: subscription().tenantId
    objectId: functionApp.identity.principalId
    permissions: {
      secrets: ['get', 'list']
    }
  }
]
```

### 3. Network Security

**Development**:
- Open access (for development convenience)
- IP restrictions on Key Vault

**Production**:
- VNet integration for Function App
- Private endpoints for Storage Account
- Firewall rules for Storage Account
- Service endpoints for Key Vault

### 4. RBAC (Role-Based Access Control)

**Role Assignments**:
- Function App → Storage Table Data Contributor
- Function App → Key Vault Secrets User
- DevOps Team → Contributor (resource group)
- Developers → Reader (resource group)

## Authentication to Azure

### OpenID Connect (OIDC) - Recommended

**Benefits**:
- No secrets/credentials to manage
- Short-lived tokens
- Better security posture
- GitHub handles rotation

**Setup**:
1. Create Azure AD App Registration
2. Configure federated credentials for GitHub
3. Assign appropriate roles
4. Configure GitHub secrets:
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_SUBSCRIPTION_ID`

**Workflow Usage**:
```yaml
- uses: azure/login@v1
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

### Alternative: Service Principal (with secrets)

**Setup** (if OIDC not available):
```bash
az ad sp create-for-rbac \
  --name "sp-intseneca-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/rg-intseneca-dev-eastus \
  --sdk-auth
```

## Cost Optimization

### Development Environment

| Resource | SKU | Estimated Monthly Cost |
|----------|-----|------------------------|
| Storage Account (LRS) | Standard_LRS | $0.50 |
| Azure Functions | Consumption | $5.00 |
| Static Web App | Free | $0.00 |
| Application Insights | Standard | $2.00 |
| Key Vault | Standard | $0.03 |
| **Total** | | **~$7.50/month** |

### Production Environment

| Resource | SKU | Estimated Monthly Cost |
|----------|-----|------------------------|
| Storage Account (GRS) | Standard_GRS | $1.50 |
| Azure Functions | Premium EP1 | $150.00 |
| Static Web App | Standard | $9.00 |
| Application Insights | Standard | $15.00 |
| Key Vault | Standard | $0.03 |
| **Total** | | **~$175.00/month** |

**Cost Optimization Strategies**:
1. Use consumption plan for dev/staging
2. Enable auto-shutdown for non-production
3. Use Azure Reservations for production (save 30-50%)
4. Implement lifecycle policies for blob storage
5. Configure Application Insights sampling

## Monitoring and Observability

### Key Metrics

**Infrastructure Health**:
- Resource availability (uptime)
- Deployment success rate
- Deployment duration
- Cost trends

**Application Performance**:
- API response time (p50, p95, p99)
- Error rate
- Request throughput
- Storage latency

### Alerting Strategy

**Critical Alerts** (PagerDuty/on-call):
- Service unavailable (5xx errors > 5%)
- Deployment failed in production
- Storage account unreachable
- Key Vault access denied

**Warning Alerts** (Email/Slack):
- High response latency (p95 > 1s)
- Increased error rate (> 1%)
- Cost anomaly detection
- SSL certificate expiring (< 30 days)

### Dashboard

**Azure Monitor Dashboard**:
- Infrastructure overview
- Deployment history
- Cost analysis
- Resource health
- Application Insights integration

## Disaster Recovery

### Backup Strategy

**Infrastructure**:
- Bicep code in Git (source of truth)
- Daily Azure Resource Manager exports
- Configuration stored in Key Vault

**Data**:
- See azure-table-storage-backup.md

### Recovery Procedures

**Scenario 1: Accidental Resource Deletion**
1. Review Git history for infrastructure code
2. Redeploy infrastructure via pipeline
3. Restore data from backups
4. Verify application functionality

**Scenario 2: Region Outage**
1. Failover to secondary region (GRS storage)
2. Deploy infrastructure to secondary region
3. Update DNS/Traffic Manager
4. Verify application in secondary region

**RTO/RPO**:
- Infrastructure RTO: 30 minutes
- Infrastructure RPO: 0 (code in Git)
- Data RTO/RPO: See backup strategy

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [x] Create infrastructure repository structure
- [ ] Develop Bicep modules for core resources
- [ ] Implement dev environment deployment
- [ ] Configure GitHub secrets/OIDC
- [ ] Create validation pipeline
- [ ] Document deployment process

### Phase 2: Automation (Week 2)
- [ ] Implement staging environment
- [ ] Create production deployment workflow
- [ ] Configure approval gates
- [ ] Implement monitoring and alerts
- [ ] Set up Application Insights
- [ ] Create deployment dashboard

### Phase 3: Enhancement (Week 3)
- [ ] Implement network security (VNet, private endpoints)
- [ ] Configure advanced monitoring
- [ ] Implement cost optimization
- [ ] Create disaster recovery runbooks
- [ ] Conduct DR testing
- [ ] Team training on deployment process

### Phase 4: Production Readiness (Week 4)
- [ ] Security audit
- [ ] Performance testing
- [ ] Compliance verification
- [ ] Production deployment dry-run
- [ ] Go-live preparation
- [ ] Post-deployment validation

## Success Criteria

### Technical
- ✅ 100% infrastructure defined as code
- ✅ Fully automated deployment (no manual steps)
- ✅ All environments deployed successfully
- ✅ Monitoring and alerting configured
- ✅ Security best practices implemented
- ✅ Deployment time < 10 minutes
- ✅ Zero-downtime deployments

### Operational
- ✅ Team trained on deployment process
- ✅ Runbooks documented
- ✅ DR tested and validated
- ✅ Cost within budget
- ✅ Compliance requirements met
- ✅ On-call rotation established

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Azure region outage | High | Low | Multi-region deployment, GRS |
| Deployment failure | Medium | Medium | Automated rollback, blue-green deployment |
| Cost overrun | Medium | Medium | Cost alerts, budget caps, regular reviews |
| Security breach | High | Low | Managed identities, Key Vault, regular audits |
| Knowledge loss | Medium | Medium | Documentation, training, pair programming |

## Next Steps

1. **Immediate** (This week):
   - Review and approve this plan
   - Create infrastructure repository structure
   - Develop first Bicep module (storage account)
   - Configure Azure OIDC for GitHub Actions

2. **Short-term** (Next 2 weeks):
   - Implement all Bicep modules
   - Create deployment workflows
   - Deploy to dev environment
   - Configure monitoring

3. **Medium-term** (Next month):
   - Deploy to staging and production
   - Implement advanced security
   - Conduct DR testing
   - Team training

## Appendices

### A. Azure CLI Commands Reference
### B. Bicep Module Templates
### C. GitHub Actions Workflow Templates
### D. Troubleshooting Guide
### E. Cost Calculator Spreadsheet

---

**Document Version**: 1.0
**Last Updated**: 2025-01-14
**Owner**: DevOps Team
**Reviewers**: Development Team, Security Team, Management
