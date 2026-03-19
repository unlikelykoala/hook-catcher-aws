import { Client, ClientConfig } from "pg";
import { getServerConfig } from "../../config/serverConfig";
import { getSecrets } from "../../config/secrets";

let client: Client | null = null;

async function buildDefaultConfig(): Promise<ClientConfig> {
  const serverConfig = getServerConfig();
  const secrets = await getSecrets();

  return {
    host: serverConfig.DB_HOST,
    port: serverConfig.DB_PORT,
    database: serverConfig.DB_NAME,
    user: secrets.DB_USER,
    password: secrets.DB_PASSWORD,
    connectionTimeoutMillis: 5000,
    ssl: serverConfig.DB_SSL ? { rejectUnauthorized: false } : false,
  };
}

/**
 * Connects to a PostgreSQL database using the provided or default configuration.
 * @param config - Optional overrides for the default connection configuration.
 * @returns The connected Client instance.
 */
async function connect(config: ClientConfig = {}): Promise<Client> {
  if (client) {
    console.warn("Already connected to the PostgreSQL database.");
    return client;
  }

  const defaultConfig = await buildDefaultConfig();

  client = new Client({ ...defaultConfig, ...config });

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
 * Disconnects from the PostgreSQL database.
 */
async function disconnect(): Promise<void> {
  if (!client) {
    console.warn("No active database connection to disconnect.");
    return;
  }

  try {
    await client.end();
    console.log("Successfully disconnected from the database.");
  } catch (error) {
    console.error("Failed to disconnect from the database:", error);
    throw error;
  } finally {
    client = null;
  }
}

export default { connect, disconnect };
