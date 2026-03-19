import dbConnection from "./postgres/connection";
import mongoConnection from "./mongo_db/connection";
import { Bin, RequestDocument } from "../types";

export async function createBin(id: string): Promise<Bin> {
  const client = await dbConnection.connect();

  const queryString = `INSERT INTO bins (id) VALUES ($1) RETURNING id, created_at, expires_at`;

  const result = await client.query(queryString, [id]);

  return result.rows[0] as Bin;
}

export async function findBinById(id: string): Promise<Bin | null> {
  const client = await dbConnection.connect();

  const queryString = "SELECT * FROM bins WHERE id = ($1)";
  const result = await client.query(queryString, [id]);

  return (result.rows[0] as Bin) ?? null;
}

export async function findRequestDocumentsByBinId(
  id: string,
): Promise<RequestDocument[]> {
  const client = await mongoConnection.connect();
  const collection = client
    .db(mongoConnection.getMongoDbName())
    .collection<RequestDocument>(mongoConnection.MONGO_COLLECTION_NAME);

  const result = await collection.find({ bin_id: id }).toArray();

  return result;
}

export async function findExpiredBins(): Promise<Bin[]> {
  const client = await dbConnection.connect();

  const queryString = "SELECT * FROM bins WHERE expires_at < NOW()";
  const result = await client.query(queryString);

  return result.rows;
}

export async function getAllBins(): Promise<Bin[]> {
  const client = await dbConnection.connect();

  const queryString = "SELECT * FROM bins";
  const result = await client.query(queryString);

  return result.rows;
}

export async function deleteBin(id: string): Promise<void> {
  const client = await dbConnection.connect();

  const queryString = "DELETE FROM bins WHERE id = $1";
  await client.query(queryString, [id]);
}

export async function deleteAllRequestDocumentsWithBinId(
  id: string,
): Promise<void> {
  const client = await mongoConnection.connect();
  const collection = client
    .db(mongoConnection.getMongoDbName())
    .collection<RequestDocument>(mongoConnection.MONGO_COLLECTION_NAME);

  await collection.deleteMany({ bin_id: id });
}
