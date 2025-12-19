#!/bin/bash
set -e

# Add federated credentials for GitHub Environments
# This allows GitHub Actions workflows using environments to authenticate via OIDC

SUBSCRIPTION_ID="46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6"
TENANT_ID="d121fc0e-46f1-4db7-83df-a97fb17a8b4e"
REPO_NAME="amajail/interviews-seneca-team"
APP_NAME="GitHub Actions - Interview Seneca Team"

echo "🔐 Adding federated credentials for GitHub Environments..."
echo "📦 Repository: $REPO_NAME"
echo ""

# Get the App ID
APP_ID=$(az ad app list \
  --display-name "$APP_NAME" \
  --query "[0].appId" \
  -o tsv)

if [[ -z "$APP_ID" ]]; then
  echo "❌ App Registration not found: $APP_NAME"
  echo "Please run setup-oidc.sh first."
  exit 1
fi

echo "Found App ID: $APP_ID"
echo ""

# Add federated credential for development environment
echo "Adding credential for development environment..."
az ad app federated-credential create \
  --id "$APP_ID" \
  --parameters "{
    \"name\": \"github-oidc-env-development\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${REPO_NAME}:environment:development\",
    \"description\": \"GitHub Actions OIDC for development environment\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }" --output none 2>&1 || echo "  (credential may already exist)"

echo "  ✓ Development environment credential configured"

# Add federated credential for staging environment
echo "Adding credential for staging environment..."
az ad app federated-credential create \
  --id "$APP_ID" \
  --parameters "{
    \"name\": \"github-oidc-env-staging\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${REPO_NAME}:environment:staging\",
    \"description\": \"GitHub Actions OIDC for staging environment\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }" --output none 2>&1 || echo "  (credential may already exist)"

echo "  ✓ Staging environment credential configured"

# Add federated credential for production environment
echo "Adding credential for production environment..."
az ad app federated-credential create \
  --id "$APP_ID" \
  --parameters "{
    \"name\": \"github-oidc-env-production\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:${REPO_NAME}:environment:production\",
    \"description\": \"GitHub Actions OIDC for production environment\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }" --output none 2>&1 || echo "  (credential may already exist)"

echo "  ✓ Production environment credential configured"

echo ""
echo "✅ All environment credentials configured successfully!"
echo ""
echo "GitHub Environments can now authenticate via OIDC:"
echo "  - development"
echo "  - staging"
echo "  - production"
