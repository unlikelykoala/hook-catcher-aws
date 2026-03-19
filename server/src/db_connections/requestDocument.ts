import mongoConnection from "./mongo_db/connection";
import {
  MongoRequestDocument,
  RequestDocument,
  RequestPayload,
  serializeRequestDocument,
} from "../types";

export async function createRequestDocument(
  payload: RequestPayload,
): Promise<RequestDocument> {
  const client = await mongoConnection.connect();
  const collection = client
    .db(mongoConnection.getMongoDbName())
    .collection<RequestPayload>(mongoConnection.MONGO_COLLECTION_NAME);

  const result = await collection.insertOne(payload);

  return {
    ...payload,
    _id: result.insertedId.toHexString(),
  };
}

export async function findRequestDocumentsByBinId(
  id: string,
): Promise<RequestDocument[]> {
  const client = await mongoConnection.connect();
  const collection = client
    .db(mongoConnection.getMongoDbName())
    .collection<MongoRequestDocument>(mongoConnection.MONGO_COLLECTION_NAME);

  const result = await collection.find({ bin_id: id }).toArray();

  return result.map(serializeRequestDocument);
}

export async function deleteAllRequestDocumentsWithBinId(
  id: string,
): Promise<void> {
  const client = await mongoConnection.connect();
  const collection = client
    .db(mongoConnection.getMongoDbName())
    .collection<MongoRequestDocument>(mongoConnection.MONGO_COLLECTION_NAME);

  await collection.deleteMany({ bin_id: id });
}
