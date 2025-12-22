// Development Environment Parameters

using '../main.bicep'

param environment = 'dev'
param location = 'westus2'  // Changed from eastus to avoid quota limitations
param appName = 'intseneca'
param instance = '002'  // Changed from 001 to avoid storage account name conflict

// Cost-optimized SKUs for development
param storageAccountSku = 'Standard_LRS'
param functionAppSku = 'Y1' // Consumption plan (trying West US 2 region)
param staticWebAppSku = 'Free' // Attempting Free tier in West US 2 region

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
