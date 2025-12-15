// Azure Static Web Apps Module
// Creates a Static Web App for hosting the React frontend

@description('The name of the Static Web App')
param staticWebAppName string

@description('The location/region for the Static Web App')
param location string = 'eastus2' // Static Web Apps have limited regions

@description('The environment (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string

@description('Static Web App SKU')
@allowed([
  'Free'
  'Standard'
])
param sku string = 'Free'

@description('GitHub repository URL')
param repositoryUrl string = 'https://github.com/amajail/interviews-seneca-team'

@description('GitHub repository branch')
param repositoryBranch string = 'main'

@description('Tags to apply to the resource')
param tags object = {}

// Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  tags: union(tags, {
    environment: environment
  })
  sku: {
    name: sku
    tier: sku
  }
  // System-assigned Managed Identity
  // Note: Not currently used by frontend (static files only)
  // Added for future flexibility and security best practices
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: repositoryBranch
    buildProperties: {
      appLocation: 'frontend'
      apiLocation: ''
      outputLocation: 'dist'
    }
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    provider: 'GitHub'
  }
}

// Outputs
@description('The resource ID of the Static Web App')
output staticWebAppId string = staticWebApp.id

@description('The name of the Static Web App')
output staticWebAppName string = staticWebApp.name

@description('The default hostname of the Static Web App')
output defaultHostname string = staticWebApp.properties.defaultHostname

@description('The URL of the Static Web App')
output url string = 'https://${staticWebApp.properties.defaultHostname}'

@description('The deployment token (secret)')
@secure()
output deploymentToken string = staticWebApp.listSecrets().properties.apiKey

@description('The principal ID of the Static Web App managed identity')
output principalId string = staticWebApp.identity.principalId
