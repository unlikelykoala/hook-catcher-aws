import dbConnection from "./postgres/connection";
import mongoConnection from "./mongo_db/connection";
import { RequestDocument, RequestRecord } from "../types";

// Inserting request to Postgres DB
export async function createRequestRecord(
  binId: string,
  mongoId: string,
  method: string,
  path: string,
  received_at: Date,
): Promise<RequestRecord> {
  const client = await dbConnection.connect();

  const insertQuery = `INSERT INTO requests (bin_id, mongo_id, method, path, received_at) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
  const result = await client.query(insertQuery, [
    binId,
    mongoId,
    method,
    path,
    received_at,
  ]);

  return result.rows[0] as RequestRecord;
}

// Inserting request payload to MongoDB
export async function createRequestDocument(
  document: RequestDocument,
): Promise<string> {
  const client = await mongoConnection.connect();
  const collection = client
    .db(mongoConnection.getMongoDbName())
    .collection(mongoConnection.MONGO_COLLECTION_NAME);

  const result = await collection.insertOne(document);

  return result.insertedId.toHexString();
}
