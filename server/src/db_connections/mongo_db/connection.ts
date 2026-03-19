import { MongoClient, MongoClientOptions } from "mongodb";
import { getServerConfig } from "../../config/serverConfig";
import { getSecrets } from "../../config/secrets";

const MONGO_COLLECTION_NAME = "request_payloads";

let client: MongoClient | null = null;

async function buildMongoConfig(): Promise<{
  uri: string;
  options: MongoClientOptions;
}> {
  const serverConfig = getServerConfig();
  const secrets = await getSecrets();

  return {
    uri: secrets.MONGO_URI,
    options: {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      retryWrites: serverConfig.MONGO_RETRY_WRITES,
    },
  };
}

/**
 * Connects to a MongoDB database using the provided or default configuration.
 * @param uri - Optional override for the MongoDB connection URI.
 * @param options - Optional overrides for the default client options.
 * @returns The connected MongoClient instance.
 */
async function connect(
  uri?: string,
  options: MongoClientOptions = {},
): Promise<MongoClient> {
  if (client) {
    console.warn("Already connected to the MongoDB database.");
    return client;
  }

  const { uri: defaultUri, options: defaultOptions } = await buildMongoConfig();

  client = new MongoClient(uri ?? defaultUri, {
    ...defaultOptions,
    ...options,
  });

  try {
    await client.connect();
    console.log("Successfully connected to the database.");
    return client;
  } catch (error) {
    client = null;
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}

/**
 * Disconnects from the MongoDB database.
 */
async function disconnect(): Promise<void> {
  if (!client) {
    console.warn("No active database connection to disconnect.");
    return;
  }

  try {
    await client.close();
    console.log("Successfully disconnected from the database.");
  } catch (error) {
    console.error("Failed to disconnect from the database:", error);
    throw error;
  } finally {
    client = null;
  }
}

function getMongoDbName(): string {
  return getServerConfig().MONGO_DB_NAME;
}

export default { connect, disconnect, getMongoDbName, MONGO_COLLECTION_NAME };
