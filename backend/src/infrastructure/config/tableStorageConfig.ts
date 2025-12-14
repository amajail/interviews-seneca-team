export interface TableStorageConfig {
  connectionString: string;
  tableName: string;
}

export function getTableStorageConfig(): TableStorageConfig {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const tableName = process.env.TABLE_NAME || 'candidates';

  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is required');
  }

  return {
    connectionString,
    tableName
  };
}
