# Infrastructure Setup

This directory contains Infrastructure as Code (IaC) for the Interview Tracking Application using Azure Bicep.

## Prerequisites

- Azure CLI (`az`) installed and configured
- Azure subscription with appropriate permissions
- GitHub repository with Actions enabled

## Setup Steps

### 1. Configure OIDC Authentication

Run the OIDC setup script to configure passwordless authentication between GitHub Actions and Azure:

```bash
./scripts/setup-oidc.sh
```

This script will:
- Create an Azure AD App Registration
- Create a Service Principal
- Assign required roles:
  - **Contributor**: For creating and managing Azure resources
  - **User Access Administrator**: For creating RBAC role assignments
- Configure federated credentials for GitHub Actions

### 2. Configure GitHub Secrets

After running the setup script, add the following secrets to your GitHub repository:
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

## Required Azure Permissions

The GitHub Actions service principal requires two roles:

1. **Contributor** (or higher)
   - Allows creating and managing Azure resources
   - Required for deploying all infrastructure components

2. **User Access Administrator** (or Owner)
   - Allows creating RBAC role assignments
   - Required for granting the Function App access to Storage Account

If you encounter authorization errors during deployment, run:

```bash
./scripts/grant-rbac-permissions.sh
```

## Deployment

### Automatic Deployment (Recommended)

Infrastructure is automatically deployed via GitHub Actions:

- **Validation**: On every pull request
- **Deployment**: When changes are merged to `main` branch

### Manual Deployment

```bash
cd bicep

# Validate templates
az bicep build --file main.bicep

# Deploy to dev environment
az deployment sub create \
  --name "infra-dev-$(date +%Y%m%d-%H%M%S)" \
  --location eastus \
  --template-file main.bicep \
  --parameters parameters/dev.bicepparam
```

## Infrastructure Components

- **Storage Account**: Table Storage for candidate data
- **Function App**: Backend API with Node.js runtime
- **Static Web App**: React frontend hosting
- **Key Vault**: Secure storage for secrets and connection strings
- **Application Insights**: Monitoring and logging

## Security Features

- Managed Identity for all resources (passwordless authentication)
- OIDC authentication (no static secrets)
- HTTPS-only communication
- TLS 1.2 minimum
- Key Vault for secret management
- RBAC for least-privilege access

## Cost Estimates

- **Dev Environment**: ~$7.50/month
- **Production Environment**: ~$175/month (with premium SKUs and geo-redundancy)

See `bicep/parameters/` for environment-specific configurations.
