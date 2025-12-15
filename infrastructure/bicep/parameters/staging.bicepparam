// Staging Environment Parameters

using '../main.bicep'

param environment = 'staging'
param location = 'eastus'
param appName = 'intseneca'
param instance = '001'

// Same as dev for staging (cost-optimized)
param storageAccountSku = 'Standard_LRS'
param functionAppSku = 'Y1' // Consumption plan
param staticWebAppSku = 'Free'

// Standard retention for staging
param appInsightsRetentionDays = 90

// No purge protection for staging
param keyVaultPurgeProtection = false

// Tags
param tags = {
  application: 'interview-tracking'
  environment: 'staging'
  managedBy: 'bicep'
  costCenter: 'engineering'
  owner: 'devops-team'
}
