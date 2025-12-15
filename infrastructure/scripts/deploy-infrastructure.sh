#!/bin/bash
set -e

# Infrastructure Deployment Script
# Deploys Bicep templates to Azure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SUBSCRIPTION_ID="46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6"
LOCATION="eastus"
APP_NAME="intseneca"

# Check if environment parameter is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Environment parameter required${NC}"
  echo "Usage: $0 <environment>"
  echo "Environments: dev, staging, prod"
  exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
  echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'${NC}"
  echo "Valid environments: dev, staging, prod"
  exit 1
fi

echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Azure Infrastructure Deployment               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Location: ${YELLOW}$LOCATION${NC}"
echo -e "Subscription: ${YELLOW}$SUBSCRIPTION_ID${NC}"
echo ""

# Verify Azure CLI is logged in
echo "Verifying Azure CLI authentication..."
if ! az account show &>/dev/null; then
  echo -e "${RED}Error: Not logged in to Azure. Please run 'az login'${NC}"
  exit 1
fi

# Set subscription
echo "Setting subscription..."
az account set --subscription "$SUBSCRIPTION_ID"

# Verify Bicep is installed
echo "Verifying Bicep CLI..."
if ! az bicep version &>/dev/null; then
  echo -e "${YELLOW}Bicep CLI not found. Installing...${NC}"
  az bicep install
fi

BICEP_VERSION=$(az bicep version | grep -oP 'v\K[0-9.]+')
echo -e "Bicep version: ${GREEN}$BICEP_VERSION${NC}"
echo ""

# Resource Group name
RESOURCE_GROUP="rg-${APP_NAME}-${ENVIRONMENT}-${LOCATION}"

# Check if resource group exists
echo "Checking resource group: $RESOURCE_GROUP"
if ! az group exists --name "$RESOURCE_GROUP" | grep -q "true"; then
  echo -e "${YELLOW}Resource group does not exist. Creating...${NC}"
  az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --tags environment="$ENVIRONMENT" application="interview-tracking" managedBy="bicep"
  echo -e "${GREEN}✓${NC} Resource group created"
else
  echo -e "${GREEN}✓${NC} Resource group exists"
fi

echo ""

# Navigate to bicep directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BICEP_DIR="$(dirname "$SCRIPT_DIR")/bicep"

cd "$BICEP_DIR"

# Validate Bicep template
echo "Validating Bicep template..."
if az bicep lint --file main.bicep --diagnostics-format short 2>&1 | grep -q "Error"; then
  echo -e "${RED}✗ Bicep validation failed${NC}"
  az bicep lint --file main.bicep
  exit 1
fi
echo -e "${GREEN}✓${NC} Bicep template is valid"
echo ""

# What-If analysis
echo -e "${YELLOW}Running What-If analysis...${NC}"
echo "This shows what changes will be made without actually deploying."
echo ""

az deployment group what-if \
  --resource-group "$RESOURCE_GROUP" \
  --template-file main.bicep \
  --parameters "parameters/${ENVIRONMENT}.bicepparam" \
  --no-pretty-print

echo ""
echo -e "${YELLOW}────────────────────────────────────────────────${NC}"
read -p "Do you want to proceed with deployment? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo -e "${YELLOW}Deployment cancelled${NC}"
  exit 0
fi

# Deploy infrastructure
echo ""
echo -e "${GREEN}Deploying infrastructure to $ENVIRONMENT...${NC}"
echo ""

DEPLOYMENT_NAME="deploy-$(date +%Y%m%d-%H%M%S)"

az deployment group create \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --template-file main.bicep \
  --parameters "parameters/${ENVIRONMENT}.bicepparam" \
  --verbose

DEPLOYMENT_STATUS=$?

if [ $DEPLOYMENT_STATUS -eq 0 ]; then
  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  Deployment Successful! 🎉                     ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
  echo ""

  # Get deployment outputs
  echo "Deployment Outputs:"
  echo "──────────────────────────────────────────────"

  az deployment group show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DEPLOYMENT_NAME" \
    --query properties.outputs \
    --output table

  echo ""
  echo "Next Steps:"
  echo "1. Configure Static Web App with backend API URL"
  echo "2. Deploy backend code to Function App"
  echo "3. Deploy frontend code to Static Web App"
  echo "4. Verify Key Vault secrets are accessible"
  echo "5. Test the application"
  echo ""
  echo "View deployment in Azure Portal:"
  echo "https://portal.azure.com/#@d121fc0e-46f1-4db7-83df-a97fb17a8b4e/resource/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/overview"
  echo ""

else
  echo ""
  echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  Deployment Failed! ✗                          ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Check the deployment logs for details."
  exit 1
fi
