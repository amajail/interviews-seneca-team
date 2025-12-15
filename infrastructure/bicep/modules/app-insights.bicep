// Application Insights Module
// Creates Application Insights for monitoring and logging

@description('The name of the Application Insights resource')
param appInsightsName string

@description('The location/region for Application Insights')
param location string = resourceGroup().location

@description('The environment (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string

@description('Data retention in days')
@minValue(30)
@maxValue(730)
param retentionInDays int = 90

@description('Tags to apply to the resource')
param tags object = {}

// Log Analytics Workspace (required for Application Insights)
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'law-${appInsightsName}'
  location: location
  tags: union(tags, {
    environment: environment
  })
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: retentionInDays
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  tags: union(tags, {
    environment: environment
  })
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    RetentionInDays: retentionInDays
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Outputs
@description('The resource ID of Application Insights')
output appInsightsId string = appInsights.id

@description('The instrumentation key')
output instrumentationKey string = appInsights.properties.InstrumentationKey

@description('The connection string')
output connectionString string = appInsights.properties.ConnectionString

@description('The Log Analytics workspace ID')
output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id

@description('The name of the Application Insights resource')
output appInsightsName string = appInsights.name
