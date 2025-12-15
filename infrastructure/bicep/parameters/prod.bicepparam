// Production Environment Parameters

using '../main.bicep'

param environment = 'prod'
param location = 'eastus'
param appName = 'intseneca'
param instance = '001'

// Production-grade SKUs
param storageAccountSku = 'Standard_GRS' // Geo-redundant for production
param functionAppSku = 'EP1' // Elastic Premium for always-on
param staticWebAppSku = 'Standard' // Standard tier for custom domains

// Extended retention for production
param appInsightsRetentionDays = 365

// Enable purge protection for production (prevents accidental deletion)
param keyVaultPurgeProtection = true

// Tags
param tags = {
  application: 'interview-tracking'
  environment: 'production'
  managedBy: 'bicep'
  costCenter: 'operations'
  owner: 'platform-team'
  criticality: 'high'
}
