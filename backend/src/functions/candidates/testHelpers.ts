import { InvocationContext } from '@azure/functions';

/**
 * Creates a mock InvocationContext for testing Azure Functions
 */
export function createMockContext(): InvocationContext {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    log: jest.fn(),
    error: jest.fn(),
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Creates a mock async iterator for Azure Table Storage listEntities
 * @param entities - Array of entities to yield
 */
export function createMockAsyncIterator<T>(entities: T[] = []): {
  [Symbol.asyncIterator]: () => AsyncGenerator<T, void, unknown>;
} {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await
    async *[Symbol.asyncIterator](): AsyncGenerator<T, void, unknown> {
      for (const entity of entities) {
        yield entity;
      }
    },
  };
}

/**
 * Gets the mocked table client from the mocked config
 * Note: This uses require() to access the mocked module at runtime
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMockTableClient(): any {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
  return require('../../infrastructure/config/tableStorageConfig').tableClient;
}

/**
 * Sets up the standard table storage mock
 * Call this before importing any functions that use tableClient
 */
export function setupTableStorageMock(): void {
  jest.mock('../../infrastructure/config/tableStorageConfig', () => ({
    tableClient: {
      listEntities: jest.fn(),
      createEntity: jest.fn(),
      updateEntity: jest.fn(),
      deleteEntity: jest.fn(),
    },
  }));
}
