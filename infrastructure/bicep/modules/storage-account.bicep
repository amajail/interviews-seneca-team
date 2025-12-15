// Azure Storage Account Module
// Creates a storage account with Table Storage for candidate data

@description('The name of the storage account')
param storageAccountName string

@description('The location/region for the storage account')
param location string = resourceGroup().location

@description('The environment (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string

@description('Storage account SKU')
@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_RAGRS'
  'Standard_ZRS'
  'Standard_GZRS'
  'Standard_RAGZRS'
])
param sku string = 'Standard_LRS'

@description('Tags to apply to the storage account')
param tags object = {}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: sku
  }
  kind: 'StorageV2'
  tags: union(tags, {
    environment: environment
  })
  // System-assigned Managed Identity
  // Enables customer-managed encryption keys and Azure AD authentication
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    publicNetworkAccess: 'Enabled'
    encryption: {
      services: {
        table: {
          enabled: true
          keyType: 'Account'
        }
        blob: {
          enabled: true
          keyType: 'Account'
        }
      }
      keySource: 'Microsoft.Storage'
      // Note: Can be upgraded to 'Microsoft.Keyvault' for customer-managed keys
      // requiring Storage Account's Managed Identity to access Key Vault
    }
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// Table Service
resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

// Candidates Table
resource candidatesTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-01-01' = {
  parent: tableService
  name: 'candidates'
}

// Audit Logs Table
resource auditLogsTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-01-01' = {
  parent: tableService
  name: 'auditlogs'
}

// Outputs
@description('The resource ID of the storage account')
output storageAccountId string = storageAccount.id

@description('The name of the storage account')
output storageAccountName string = storageAccount.name

@description('The primary endpoint for table storage')
output tableEndpoint string = storageAccount.properties.primaryEndpoints.table

@description('The connection string for the storage account')
@secure()
output connectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${az.environment().suffixes.storage}'

@description('The primary access key')
@secure()
output primaryKey string = storageAccount.listKeys().keys[0].value

@description('The principal ID of the Storage Account managed identity')
output principalId string = storageAccount.identity.principalId
