#!/bin/bash
set -e

# Grant User Access Administrator role to the GitHub Actions service principal
# This is required for the deployment to create RBAC role assignments

SUBSCRIPTION_ID="46c5d4e3-1b2f-4e20-9fe4-6b63f9fb71f6"
SERVICE_PRINCIPAL_ID="12f92676-3226-436d-9946-3f32c9525f83"

echo "Granting User Access Administrator role to service principal..."
az role assignment create \
  --assignee "$SERVICE_PRINCIPAL_ID" \
  --role "User Access Administrator" \
  --scope "/subscriptions/$SUBSCRIPTION_ID" \
  --description "Required for GitHub Actions to create RBAC role assignments during infrastructure deployment"

echo "✓ Role assignment created successfully"
echo ""
echo "The service principal can now create role assignments in the subscription."
