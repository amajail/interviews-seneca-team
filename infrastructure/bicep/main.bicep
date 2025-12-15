// Main Bicep Orchestration File
// Deploys all infrastructure components for the Interview Tracking Application

targetScope = 'resourceGroup'

// Parameters
@description('The environment to deploy (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string

@description('The primary Azure region for resources')
param location string = resourceGroup().location

@description('Application name prefix')
param appName string = 'intseneca'

@description('Resource instance number')
param instance string = '001'

@description('Storage Account SKU')
param storageAccountSku string

@description('App Service Plan SKU for Function App')
param functionAppSku string

@description('Static Web App SKU')
param staticWebAppSku string

@description('Application Insights retention in days')
param appInsightsRetentionDays int

@description('Enable Key Vault purge protection')
param keyVaultPurgeProtection bool = false

@description('Common tags for all resources')
param tags object = {
  application: 'interview-tracking'
  managedBy: 'bicep'
}

// Variables
var resourceNameSuffix = '${environment}-${location}-${instance}'
var storageAccountName = 'st${appName}${environment}${instance}' // No hyphens, max 24 chars
var functionAppName = 'func-${appName}-${resourceNameSuffix}'
var appInsightsName = 'appi-${appName}-${resourceNameSuffix}'
var keyVaultName = 'kv-${appName}-${environment}-${instance}' // Max 24 chars
var staticWebAppName = 'swa-${appName}-${resourceNameSuffix}'

// Module 1: Application Insights (needed first for Function App)
module appInsights './modules/app-insights.bicep' = {
  name: 'deploy-appinsights'
  params: {
    appInsightsName: appInsightsName
    location: location
    environment: environment
    retentionInDays: appInsightsRetentionDays
    tags: tags
  }
}

// Module 2: Storage Account (for Table Storage and Function App storage)
module storageAccount './modules/storage-account.bicep' = {
  name: 'deploy-storage'
  params: {
    storageAccountName: storageAccountName
    location: location
    environment: environment
    sku: storageAccountSku
    tags: tags
  }
}

// Module 3: Function App (backend API)
module functionApp './modules/function-app.bicep' = {
  name: 'deploy-functionapp'
  params: {
    functionAppName: functionAppName
    location: location
    environment: environment
    appServicePlanSku: functionAppSku
    storageAccountName: storageAccount.outputs.storageAccountName
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    appInsightsConnectionString: appInsights.outputs.connectionString
    tags: tags
  }
  dependsOn: [
    storageAccount
    appInsights
  ]
}

// Module 4: Key Vault (for storing secrets)
module keyVault './modules/key-vault.bicep' = {
  name: 'deploy-keyvault'
  params: {
    keyVaultName: keyVaultName
    location: location
    environment: environment
    functionAppPrincipalId: functionApp.outputs.principalId
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: keyVaultPurgeProtection
    tags: tags
  }
  dependsOn: [
    functionApp
  ]
}

// Module 5: Static Web App (frontend)
module staticWebApp './modules/static-web-app.bicep' = {
  name: 'deploy-staticwebapp'
  params: {
    staticWebAppName: staticWebAppName
    location: 'eastus2' // Static Web Apps have limited regions
    environment: environment
    sku: staticWebAppSku
    repositoryUrl: 'https://github.com/amajail/interviews-seneca-team'
    repositoryBranch: 'main'
    tags: tags
  }
}

// Key Vault Secrets
resource storageConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: '${keyVault.outputs.keyVaultName}/StorageConnectionString'
  properties: {
    value: storageAccount.outputs.connectionString
  }
}

resource appInsightsKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: '${keyVault.outputs.keyVaultName}/AppInsightsInstrumentationKey'
  properties: {
    value: appInsights.outputs.instrumentationKey
  }
}

resource tableNameSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  name: '${keyVault.outputs.keyVaultName}/TableName'
  properties: {
    value: 'candidates'
  }
}

// RBAC Role Assignment: Function App -> Storage Table Data Contributor
resource storageTableDataContributorRole 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  scope: subscription()
  name: '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3' // Storage Table Data Contributor
}

resource functionAppStorageRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storageAccount
  name: guid(storageAccount.outputs.storageAccountId, functionApp.outputs.principalId, storageTableDataContributorRole.id)
  properties: {
    roleDefinitionId: storageTableDataContributorRole.id
    principalId: functionApp.outputs.principalId
    principalType: 'ServicePrincipal'
  }
}

// Outputs
@description('The resource group name where resources are deployed')
output resourceGroupName string = resourceGroup().name

@description('The storage account name')
output storageAccountName string = storageAccount.outputs.storageAccountName

@description('The storage account connection string (sensitive)')
@secure()
output storageConnectionString string = storageAccount.outputs.connectionString

@description('The Function App name')
output functionAppName string = functionApp.outputs.functionAppName

@description('The Function App URL')
output functionAppUrl string = functionApp.outputs.functionAppUrl

@description('The Static Web App name')
output staticWebAppName string = staticWebApp.outputs.staticWebAppName

@description('The Static Web App URL')
output staticWebAppUrl string = staticWebApp.outputs.url

@description('The Key Vault name')
output keyVaultName string = keyVault.outputs.keyVaultName

@description('The Application Insights name')
output appInsightsName string = appInsights.outputs.appInsightsName

@description('The Application Insights connection string (sensitive)')
@secure()
output appInsightsConnectionString string = appInsights.outputs.connectionString
