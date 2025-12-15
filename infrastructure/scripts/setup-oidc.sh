#!/bin/bash
set -e

# Azure OIDC Setup Script for GitHub Actions
# This script configures OpenID Connect authentication between GitHub Actions and Azure

SUBSCRIPTION_ID="46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6"
TENANT_ID="d121fc0e-46f1-4db7-83df-a97fb17a8b4e"
REPO_NAME="amajail/interviews-seneca-team"
APP_NAME="GitHub Actions - Interview Seneca Team"

echo "🔐 Setting up OIDC for GitHub Actions..."
echo "📦 Repository: $REPO_NAME"
echo "🔑 Subscription: $SUBSCRIPTION_ID"
echo ""

# Verify Azure CLI is logged in
if ! az account show &>/dev/null; then
  echo "❌ Not logged in to Azure. Please run 'az login' first."
  exit 1
fi

# Step 1: Create App Registration
echo "📝 Step 1/5: Creating App Registration..."
APP_ID=$(az ad app create \
  --display-name "$APP_NAME" \
  --query appId \
  -o tsv)

if [ -z "$APP_ID" ]; then
  echo "❌ Failed to create App Registration"
  exit 1
fi

echo "✅ App created with ID: $APP_ID"

# Step 2: Create Service Principal
echo "👤 Step 2/5: Creating Service Principal..."
az ad sp create --id $APP_ID --output none

echo "✅ Service Principal created"

# Step 3: Assign required roles
echo "🔑 Step 3/5: Assigning required roles..."

# Contributor role (for creating/managing resources)
az role assignment create \
  --assignee $APP_ID \
  --role Contributor \
  --scope /subscriptions/$SUBSCRIPTION_ID \
  --output none

echo "  ✓ Contributor role assigned"

# User Access Administrator role (for creating RBAC role assignments)
az role assignment create \
  --assignee $APP_ID \
  --role "User Access Administrator" \
  --scope /subscriptions/$SUBSCRIPTION_ID \
  --output none

echo "  ✓ User Access Administrator role assigned"
echo "✅ All required roles assigned"

# Step 4: Configure federated credentials
echo "🔗 Step 4/5: Configuring OIDC federated credentials..."

# Main branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters "{
    \"name\": \"github-oidc-main-branch\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${REPO_NAME}:ref:refs/heads/main\",
    \"description\": \"GitHub Actions OIDC for main branch\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }" --output none

echo "  ✓ Main branch credential configured"

# Pull requests
az ad app federated-credential create \
  --id $APP_ID \
  --parameters "{
    \"name\": \"github-oidc-pull-requests\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${REPO_NAME}:pull_request\",
    \"description\": \"GitHub Actions OIDC for pull requests\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }" --output none

echo "  ✓ Pull request credential configured"

# Tags (for releases)
az ad app federated-credential create \
  --id $APP_ID \
  --parameters "{
    \"name\": \"github-oidc-tags\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${REPO_NAME}:ref:refs/tags/*\",
    \"description\": \"GitHub Actions OIDC for version tags\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }" --output none

echo "  ✓ Tag credential configured"
echo "✅ All federated credentials configured"

# Step 5: Summary
echo ""
echo "🎉 OIDC Setup Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 GitHub Secrets Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Add these secrets to your GitHub repository:"
echo "https://github.com/${REPO_NAME}/settings/secrets/actions/new"
echo ""
echo "Secret Name: AZURE_CLIENT_ID"
echo "Value: $APP_ID"
echo ""
echo "Secret Name: AZURE_TENANT_ID"
echo "Value: $TENANT_ID"
echo ""
echo "Secret Name: AZURE_SUBSCRIPTION_ID"
echo "Value: $SUBSCRIPTION_ID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Copy this for easy GitHub secret creation:"
echo ""
echo "AZURE_CLIENT_ID=$APP_ID"
echo "AZURE_TENANT_ID=$TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Next Steps:"
echo "1. Add the three secrets above to GitHub"
echo "2. Run the test workflow to verify: .github/workflows/test-azure-auth.yml"
echo "3. Proceed to INFRA-009: Create Bicep modules"
echo ""
