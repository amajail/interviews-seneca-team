// Development Environment Parameters

using '../main.bicep'

param environment = 'dev'
param location = 'eastus'
param appName = 'intseneca'
param instance = '001'

// Cost-optimized SKUs for development
param storageAccountSku = 'Standard_LRS'
param functionAppSku = 'B1' // Basic plan (~$13/month) - Consumption (Y1) requires quota
param staticWebAppSku = 'Standard' // Standard plan (~$9/month) - Free SKU not available

// Shorter retention for dev
param appInsightsRetentionDays = 30

// No purge protection for dev (allows quick cleanup)
param keyVaultPurgeProtection = false

// Tags
param tags = {
  application: 'interview-tracking'
  environment: 'development'
  managedBy: 'bicep'
  costCenter: 'engineering'
  owner: 'devops-team'
}
