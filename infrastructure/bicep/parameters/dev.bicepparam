// Development Environment Parameters

using '../main.bicep'

param environment = 'dev'
param location = 'eastus'
param appName = 'intseneca'
param instance = '001'

// Cost-optimized SKUs for development
param storageAccountSku = 'Standard_LRS'
param functionAppSku = 'Y1' // Consumption plan
param staticWebAppSku = 'Free'

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
