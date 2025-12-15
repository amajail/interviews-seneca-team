// Bicep Infrastructure Modules

This directory contains all Bicep infrastructure as code (IaC) modules for the Interview Tracking Application.

## Structure

```
bicep/
├── main.bicep                   # Main orchestration template
├── modules/                     # Reusable Bicep modules
│   ├── storage-account.bicep   # Azure Storage Account with Table Storage
│   ├── function-app.bicep      # Azure Functions (backend API)
│   ├── static-web-app.bicep    # Azure Static Web App (frontend)
│   ├── key-vault.bicep         # Azure Key Vault (secrets management)
│   └── app-insights.bicep      # Application Insights (monitoring)
├── parameters/                  # Environment-specific parameters
│   ├── dev.bicepparam          # Development environment
│   ├── staging.bicepparam      # Staging environment
│   └── prod.bicepparam         # Production environment
└── README.md                    # This file
```

## Resources Deployed

| Resource | Purpose | Dev SKU | Prod SKU |
|----------|---------|---------|----------|
| Storage Account | Table Storage for candidates | Standard_LRS | Standard_GRS |
| Function App | Backend API | Consumption (Y1) | Premium (EP1) |
| Static Web App | Frontend hosting | Free | Standard |
| Key Vault | Secrets management | Standard | Standard |
| Application Insights | Monitoring & logging | Standard | Standard |
| Log Analytics | Centralized logging | PerGB2018 | PerGB2018 |

## Prerequisites

1. **Azure CLI** installed and authenticated
   ```bash
   az login
   ```

2. **Bicep CLI** installed (bundled with Azure CLI 2.20.0+)
   ```bash
   az bicep version
   ```

3. **Subscription selected**
   ```bash
   az account set --subscription "46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6"
   ```

## Deployment

### Option 1: Deploy via Script (Recommended)

```bash
# Deploy to dev environment
./scripts/deploy-infrastructure.sh dev

# Deploy to staging
./scripts/deploy-infrastructure.sh staging

# Deploy to production
./scripts/deploy-infrastructure.sh prod
```

### Option 2: Manual Deployment

#### 1. Create Resource Group

```bash
# Development
az group create \
  --name rg-intseneca-dev-eastus \
  --location eastus

# Staging
az group create \
  --name rg-intseneca-staging-eastus \
  --location eastus

# Production
az group create \
  --name rg-intseneca-prod-eastus \
  --location eastus
```

#### 2. Deploy Infrastructure

```bash
# Deploy to dev
az deployment group create \
  --resource-group rg-intseneca-dev-eastus \
  --template-file main.bicep \
  --parameters parameters/dev.bicepparam \
  --confirm-with-what-if

# Deploy to staging
az deployment group create \
  --resource-group rg-intseneca-staging-eastus \
  --template-file main.bicep \
  --parameters parameters/staging.bicepparam \
  --confirm-with-what-if

# Deploy to production
az deployment group create \
  --resource-group rg-intseneca-prod-eastus \
  --template-file main.bicep \
  --parameters parameters/prod.bicepparam \
  --confirm-with-what-if
```

### Option 3: What-If Analysis (Dry Run)

Preview changes before deploying:

```bash
az deployment group what-if \
  --resource-group rg-intseneca-dev-eastus \
  --template-file main.bicep \
  --parameters parameters/dev.bicepparam
```

## Validation

### Lint Bicep Files

```bash
# Lint all modules
az bicep lint --file main.bicep

# Lint specific module
az bicep lint --file modules/storage-account.bicep
```

### Build to ARM Template

```bash
# Build main template
az bicep build --file main.bicep

# Output to specific file
az bicep build --file main.bicep --outfile main.json
```

## Outputs

After successful deployment, the following outputs are available:

```bash
# Get deployment outputs
az deployment group show \
  --resource-group rg-intseneca-dev-eastus \
  --name main \
  --query properties.outputs
```

Key outputs:
- `functionAppUrl`: Backend API endpoint
- `staticWebAppUrl`: Frontend application URL
- `keyVaultName`: Key Vault name for secrets
- `storageAccountName`: Storage account name

## Post-Deployment Configuration

### 1. Configure Function App Settings

The Function App needs these settings (stored in Key Vault):

```bash
AZURE_STORAGE_CONNECTION_STRING=@Microsoft.KeyVault(SecretUri=https://<keyvault-name>.vault.azure.net/secrets/StorageConnectionString/)
TABLE_NAME=candidates
APPINSIGHTS_INSTRUMENTATIONKEY=@Microsoft.KeyVault(SecretUri=https://<keyvault-name>.vault.azure.net/secrets/AppInsightsInstrumentationKey/)
```

### 2. Configure Static Web App

Add backend API URL to Static Web App configuration:

```bash
az staticwebapp appsettings set \
  --name swa-intseneca-dev-eastus-001 \
  --setting-names "API_URL=https://func-intseneca-dev-eastus-001.azurewebsites.net"
```

### 3. Verify RBAC Assignments

Check that Function App has access to Storage Account:

```bash
az role assignment list \
  --scope /subscriptions/46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6/resourceGroups/rg-intseneca-dev-eastus/providers/Microsoft.Storage/storageAccounts/stintsenecadev001 \
  --query "[?principalType=='ServicePrincipal'].{Role:roleDefinitionName, Principal:principalName}" \
  --output table
```

## Updating Infrastructure

### Update Parameters Only

Modify the appropriate `.bicepparam` file and redeploy:

```bash
az deployment group create \
  --resource-group rg-intseneca-dev-eastus \
  --template-file main.bicep \
  --parameters parameters/dev.bicepparam
```

### Update Modules

Modify the module file and redeploy. Bicep will detect changes and update only affected resources.

## Cleanup

### Delete Specific Environment

```bash
# Delete dev environment
az group delete --name rg-intseneca-dev-eastus --yes --no-wait

# Delete staging
az group delete --name rg-intseneca-staging-eastus --yes --no-wait

# Delete production (use with caution!)
az group delete --name rg-intseneca-prod-eastus --yes
```

### Soft-Deleted Resources

Key Vaults with purge protection or soft-delete enabled need manual cleanup:

```bash
# List soft-deleted Key Vaults
az keyvault list-deleted

# Purge soft-deleted Key Vault
az keyvault purge --name kv-intseneca-dev-001 --location eastus
```

## Cost Estimation

### Development Environment
- Storage Account (LRS): ~$0.50/month
- Function App (Consumption): ~$5/month
- Static Web App (Free): $0/month
- Application Insights: ~$2/month
- Key Vault: ~$0.03/month
- **Total: ~$7.50/month**

### Production Environment
- Storage Account (GRS): ~$1.50/month
- Function App (Premium EP1): ~$150/month
- Static Web App (Standard): ~$9/month
- Application Insights: ~$15/month
- Key Vault: ~$0.03/month
- **Total: ~$175/month**

## Troubleshooting

### Issue: Deployment Fails with "Name Already Exists"

**Cause**: Resource names must be globally unique (Storage Account, Key Vault)

**Solution**: Update `instance` parameter in bicepparam file

### Issue: "Authorization Failed"

**Cause**: Insufficient permissions

**Solution**: Ensure you have Contributor role on subscription

### Issue: "Soft-Deleted Resource Exists"

**Cause**: Previously deleted Key Vault still in soft-delete state

**Solution**:
```bash
az keyvault purge --name <vault-name> --location <location>
```

### Issue: "Bicep Version Mismatch"

**Cause**: Outdated Bicep CLI

**Solution**:
```bash
az bicep upgrade
```

## CI/CD Integration

These Bicep templates are designed to work with GitHub Actions. See `.github/workflows/infra-deploy-*.yml` for automated deployment workflows.

## Security Best Practices

✅ All secrets stored in Key Vault
✅ Managed Identity for Function App (no connection strings in settings)
✅ HTTPS-only enforced on all resources
✅ Minimum TLS 1.2
✅ Soft delete enabled on Key Vault
✅ RBAC for least privilege access
✅ Network security (firewall rules for production)

## References

- [Azure Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Table Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/tables/)

---

**Last Updated**: 2025-01-14
**Maintained By**: DevOps Team
**Story**: INFRA-009
