# Azure OIDC Authentication Setup Guide

This guide provides step-by-step instructions to configure OpenID Connect (OIDC) authentication between GitHub Actions and Azure.

## Overview

OIDC allows GitHub Actions to authenticate to Azure using short-lived tokens without storing any secrets in GitHub. This is the most secure method for CI/CD authentication.

## Your Azure Configuration

```json
{
  "subscriptionId": "46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6",
  "tenantId": "d121fc0e-46f1-4db7-83df-a97fb17a8b4e"
}
```

## Prerequisites

- Azure CLI installed (`az --version` to verify)
- Logged in to Azure (`az login`)
- Appropriate permissions to create App Registrations and Service Principals
- Owner or Contributor role on the subscription

## Step-by-Step Setup

### Step 1: Create Azure AD App Registration

```bash
# Create the App Registration
az ad app create \
  --display-name "GitHub Actions - Interview Seneca Team" \
  --query "{appId: appId, displayName: displayName}" \
  -o json
```

**Save the output!** You'll need the `appId` for subsequent steps.

**Expected output:**
```json
{
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "displayName": "GitHub Actions - Interview Seneca Team"
}
```

### Step 2: Create Service Principal

Replace `<APP_ID>` with the appId from Step 1:

```bash
# Create Service Principal from the App Registration
az ad sp create --id <APP_ID>
```

**Expected output:**
```json
{
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "displayName": "GitHub Actions - Interview Seneca Team",
  "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
  ...
}
```

### Step 3: Assign Contributor Role

Replace `<APP_ID>` with your appId:

```bash
# Assign Contributor role on the subscription
az role assignment create \
  --assignee <APP_ID> \
  --role Contributor \
  --scope /subscriptions/46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6
```

**Expected output:**
```json
{
  "principalId": "...",
  "principalType": "ServicePrincipal",
  "roleDefinitionName": "Contributor",
  "scope": "/subscriptions/46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6"
}
```

### Step 4: Configure OIDC Federated Credentials

This is the key step that establishes trust between GitHub and Azure.

Replace `<APP_ID>` with your appId:

#### For main branch (dev deployments):

```bash
az ad app federated-credential create \
  --id <APP_ID> \
  --parameters '{
    "name": "github-oidc-main-branch",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:amajail/interviews-seneca-team:ref:refs/heads/main",
    "description": "GitHub Actions OIDC for main branch",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

#### For pull requests (validation):

```bash
az ad app federated-credential create \
  --id <APP_ID> \
  --parameters '{
    "name": "github-oidc-pull-requests",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:amajail/interviews-seneca-team:pull_request",
    "description": "GitHub Actions OIDC for pull requests",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

#### For staging/prod deployments (tags):

```bash
az ad app federated-credential create \
  --id <APP_ID> \
  --parameters '{
    "name": "github-oidc-tags",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:amajail/interviews-seneca-team:ref:refs/tags/*",
    "description": "GitHub Actions OIDC for version tags",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

### Step 5: Configure GitHub Secrets

Navigate to your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AZURE_CLIENT_ID` | `<APP_ID from Step 1>` | Application (client) ID |
| `AZURE_TENANT_ID` | `d121fc0e-46f1-4db7-83df-a97fb17a8b4e` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID` | `46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6` | Azure subscription ID |

**Important**: These are NOT secrets in the traditional sense - they're just IDs. The actual authentication happens via OIDC tokens.

### Step 6: Verify the Setup

Create a test workflow to verify authentication:

```yaml
# .github/workflows/test-azure-auth.yml
name: Test Azure Authentication

on:
  workflow_dispatch:

jobs:
  test-auth:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Required for OIDC
      contents: read

    steps:
      - name: Azure Login via OIDC
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Verify Authentication
        run: |
          echo "Testing Azure CLI access..."
          az account show
          az group list --query "[].{name:name, location:location}" -o table
```

Run this workflow manually from the GitHub Actions tab to verify everything works.

## Complete Setup Script

Here's a complete script you can run all at once (save as `setup-oidc.sh`):

```bash
#!/bin/bash
set -e

SUBSCRIPTION_ID="46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6"
TENANT_ID="d121fc0e-46f1-4db7-83df-a97fb17a8b4e"
REPO_NAME="amajail/interviews-seneca-team"

echo "🔐 Setting up OIDC for GitHub Actions..."

# Step 1: Create App Registration
echo "📝 Creating App Registration..."
APP_ID=$(az ad app create \
  --display-name "GitHub Actions - Interview Seneca Team" \
  --query appId \
  -o tsv)

echo "✅ App created with ID: $APP_ID"

# Step 2: Create Service Principal
echo "👤 Creating Service Principal..."
az ad sp create --id $APP_ID

# Step 3: Assign Contributor role
echo "🔑 Assigning Contributor role..."
az role assignment create \
  --assignee $APP_ID \
  --role Contributor \
  --scope /subscriptions/$SUBSCRIPTION_ID

# Step 4: Configure federated credentials
echo "🔗 Configuring OIDC federated credentials..."

# Main branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters "{
    \"name\": \"github-oidc-main-branch\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${REPO_NAME}:ref:refs/heads/main\",
    \"description\": \"GitHub Actions OIDC for main branch\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }"

# Pull requests
az ad app federated-credential create \
  --id $APP_ID \
  --parameters "{
    \"name\": \"github-oidc-pull-requests\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${REPO_NAME}:pull_request\",
    \"description\": \"GitHub Actions OIDC for pull requests\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }"

# Tags (for releases)
az ad app federated-credential create \
  --id $APP_ID \
  --parameters "{
    \"name\": \"github-oidc-tags\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${REPO_NAME}:ref:refs/tags/*\",
    \"description\": \"GitHub Actions OIDC for version tags\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }"

echo ""
echo "✅ OIDC Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Add these secrets to GitHub repository settings:"
echo "   AZURE_CLIENT_ID: $APP_ID"
echo "   AZURE_TENANT_ID: $TENANT_ID"
echo "   AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo ""
echo "2. Navigate to: https://github.com/${REPO_NAME}/settings/secrets/actions"
echo "3. Create the three secrets listed above"
echo ""
echo "🧪 Test the setup with: .github/workflows/test-azure-auth.yml"
```

Make it executable and run:
```bash
chmod +x setup-oidc.sh
./setup-oidc.sh
```

## Verification Checklist

After setup, verify:

- [ ] App Registration created in Azure AD
- [ ] Service Principal created
- [ ] Contributor role assigned on subscription
- [ ] Three federated credentials configured (main, PR, tags)
- [ ] GitHub secrets configured (AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID)
- [ ] Test workflow runs successfully
- [ ] Azure CLI commands work in workflow

## Troubleshooting

### Issue: "No subscription found"
**Solution**: Verify the AZURE_SUBSCRIPTION_ID secret matches your subscription ID.

### Issue: "AADSTS70021: No matching federated identity"
**Solution**: Check that:
- The `subject` in federated credential matches your repository name
- You're running from the correct branch/PR/tag
- The repository name is correct (case-sensitive)

### Issue: "Insufficient privileges"
**Solution**: Verify:
- The Service Principal has Contributor role
- The role is assigned at subscription level
- Wait a few minutes for Azure AD propagation

### Issue: "The principal does not have permission"
**Solution**: Role assignment may take a few minutes to propagate. Wait 2-3 minutes and retry.

## Security Benefits

✅ **No secrets stored** - Only IDs in GitHub secrets
✅ **Short-lived tokens** - Tokens valid for 1 hour only
✅ **Automatic rotation** - New token every workflow run
✅ **Audit trail** - All authentications logged in Azure AD
✅ **Least privilege** - Can scope to resource group instead of subscription

## Cost

**Free** - No additional cost for OIDC authentication

## References

- [GitHub OIDC with Azure](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure)
- [Azure Workload Identity Federation](https://docs.microsoft.com/en-us/azure/active-directory/develop/workload-identity-federation)
- [azure/login GitHub Action](https://github.com/Azure/login)

## Next Steps

After completing this setup:
1. ✅ Test authentication with test workflow
2. 🏗️ Proceed to INFRA-009: Create Bicep Infrastructure Modules
3. 🚀 Deploy dev environment with INFRA-010

---

**Setup Date**: 2025-01-14
**Status**: Ready for implementation
**Story**: INFRA-008
