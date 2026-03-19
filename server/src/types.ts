import { IncomingHttpHeaders } from "http";
import { ObjectId } from "mongodb";

export interface Bin {
  id: string;
  created_at: Date;
  expires_at: Date;
}

export interface BinResponse {
  bin: Bin;
  sendUrl: string;
  inspectUrl: string;
}

export interface RequestRecord {
  id: number;
  bin_id: string;
  mongo_id: string;
  method: string;
  path: string;
  received_at: Date;
}

export interface RequestPayload {
  method: string;
  path: string;
  headers: IncomingHttpHeaders;
  body: any;
  bin_id: string;
  received_at: Date;
}

export interface MongoRequestDocument extends RequestPayload {
  _id: ObjectId;
}

export interface RequestDocument extends RequestPayload {
  _id: string;
}

export interface BinWithRequestDocuments {
  bin: Bin;
  requests: RequestDocument[];
}

export interface BroadcastRequest {
  type: "new_request";
  payload: RequestDocument;
}

export function serializeRequestDocument(
  document: MongoRequestDocument,
): RequestDocument {
  return {
    ...document,
    _id: document._id.toHexString(),
  };
}
