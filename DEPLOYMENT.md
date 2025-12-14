# Azure Static Web Apps Deployment Setup

This document describes the CI/CD setup for deploying the frontend to Azure Static Web Apps.

## Overview

The deployment workflow automatically triggers when code is merged to the `main` branch. It builds the frontend application and deploys it to Azure Static Web Apps (Dev environment).

## Prerequisites

1. **Azure Static Web Apps Resource**: You need an Azure Static Web Apps resource created in your Azure subscription
2. **GitHub Secrets**: Required secrets must be configured in your GitHub repository

## Setup Instructions

### 1. Create Azure Static Web Apps Resource

If you haven't already created an Azure Static Web Apps resource:

```bash
# Login to Azure
az login

# Create a resource group (if you don't have one)
az group create --name <resource-group-name> --location eastus

# Create the Static Web App
az staticwebapp create \
  --name <app-name>-dev \
  --resource-group <resource-group-name> \
  --location eastus \
  --sku Free
```

### 2. Get the Deployment Token

Retrieve the deployment token from your Azure Static Web App:

```bash
az staticwebapp secrets list \
  --name <app-name>-dev \
  --resource-group <resource-group-name> \
  --query "properties.apiKey" \
  --output tsv
```

### 3. Configure GitHub Secrets

Add the following secret to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add the following secret:

   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV`
   - **Value**: The deployment token from step 2

## Workflow Details

- **Workflow File**: `.github/workflows/deploy-dev.yml`
- **Trigger**: Automatically runs on push to `main` branch
- **Build**: Uses Node.js 20, runs `npm ci` and `npm run build` in the `frontend` directory
- **Deploy**: Deploys the built assets (from `frontend/dist`) to Azure Static Web Apps

## Deployment URL

After deployment, your app will be available at:
```
https://<app-name>-dev.azurestaticapps.net
```

You can also configure a custom domain in the Azure Portal.

## Monitoring

- **GitHub Actions**: View workflow runs in the "Actions" tab of your GitHub repository
- **Azure Portal**: Monitor your Static Web App in the Azure Portal
- **Deployment History**: Available in both GitHub Actions and Azure Portal

## Troubleshooting

### Build Failures

If the build fails, check:
- Frontend dependencies are correctly listed in `package.json`
- Build command (`npm run build`) works locally
- Node.js version compatibility (workflow uses Node 20)

### Deployment Failures

If deployment fails, verify:
- `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV` secret is correctly set
- Azure Static Web Apps resource exists and is accessible
- Output location (`dist`) matches your Vite build output

### Environment Variables

If you need environment variables for your frontend build:
1. Add them to the workflow file under `env:` in the "Build frontend" step
2. Prefix them with `VITE_` to make them available to Vite
3. Add corresponding secrets to GitHub if they're sensitive

Example:
```yaml
- name: Build frontend
  run: |
    cd frontend
    npm run build
  env:
    NODE_ENV: production
    VITE_API_URL: ${{ secrets.DEV_API_URL }}
```
