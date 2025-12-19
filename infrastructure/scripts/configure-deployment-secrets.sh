#!/bin/bash
set -e

# Configure GitHub Secrets for Deployment
# Retrieves deployment tokens and connection strings from Azure and sets them as GitHub secrets

SUBSCRIPTION_ID="46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6"
REPO_NAME="amajail/interviews-seneca-team"
ENVIRONMENT="dev"
RESOURCE_GROUP="rg-intseneca-${ENVIRONMENT}-eastus"

echo "🔐 Configuring deployment secrets for $ENVIRONMENT environment..."
echo "📦 Repository: $REPO_NAME"
echo "📍 Resource Group: $RESOURCE_GROUP"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed."
  echo "Please install it from: https://cli.github.com/"
  exit 1
fi

# Check if logged in to gh
if ! gh auth status &>/dev/null; then
  echo "❌ Not logged in to GitHub CLI. Please run 'gh auth login' first."
  exit 1
fi

# Check if logged in to Azure
if ! az account show &>/dev/null; then
  echo "❌ Not logged in to Azure. Please run 'az login' first."
  exit 1
fi

echo "✓ Prerequisites check passed"
echo ""

# Get Static Web App deployment token
echo "📝 Retrieving Static Web App deployment token..."
SWA_NAME=$(az staticwebapp list \
  --resource-group "$RESOURCE_GROUP" \
  --query "[0].name" \
  -o tsv 2>/dev/null)

if [[ -z "$SWA_NAME" ]]; then
  echo "❌ Static Web App not found in resource group: $RESOURCE_GROUP"
  echo "Please ensure the infrastructure has been deployed first."
  exit 1
fi

echo "Found Static Web App: $SWA_NAME"

DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name "$SWA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.apiKey" \
  -o tsv)

if [[ -z "$DEPLOYMENT_TOKEN" ]]; then
  echo "❌ Failed to retrieve deployment token"
  exit 1
fi

echo "✓ Deployment token retrieved"

# Set GitHub secret
echo ""
echo "📝 Setting GitHub secret: AZURE_STATIC_WEB_APPS_API_TOKEN_DEV..."
echo "$DEPLOYMENT_TOKEN" | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN_DEV \
  --repo "$REPO_NAME" \
  --app actions

echo "✓ Secret set successfully"

echo ""
echo "✅ All deployment secrets configured successfully!"
echo ""
echo "The deploy-dev.yml workflow can now deploy to Azure Static Web Apps."
