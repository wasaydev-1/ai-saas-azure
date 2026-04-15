import { CosmosClient } from "@azure/cosmos";

export type CosmosConfig = {
  endpoint: string;
  key: string;
  databaseId: string;
  containerId: string;
};

export function getCosmosConfigFromEnv(): CosmosConfig | null {
  const endpoint = process.env.COSMOS_DB_ENDPOINT?.trim();
  const key = process.env.COSMOS_DB_KEY?.trim();
  const databaseId = process.env.COSMOS_DB_DATABASE?.trim();
  const containerId = process.env.COSMOS_DB_CONTAINER?.trim();

  if (!endpoint || !key || !databaseId || !containerId) return null;
  return { endpoint, key, databaseId, containerId };
}

export function getCosmosClient(config: CosmosConfig): CosmosClient {
  return new CosmosClient({
    endpoint: config.endpoint,
    key: config.key,
  });
}

