// src/lib/mongodb.ts
import { MongoClient, ServerApiVersion } from "mongodb";

const MONGO_HOST = process.env.MONGO_HOST;
const MONGO_DATABASE = process.env.MONGO_DATABASE;
const MONGO_USER = process.env.MONGO_USER;
let MONGO_PASS = process.env.MONGO_PASS;
const MONGO_AUTH_SOURCE = process.env.MONGO_AUTH_SOURCE || "admin";

MONGO_PASS = "$" + MONGO_PASS;

// Debug: แสดงค่าที่อ่านได้
console.log("=== ENV VALUES ===");
console.log("MONGO_HOST:", MONGO_HOST);
console.log("MONGO_DATABASE:", MONGO_DATABASE);
console.log("MONGO_USER:", MONGO_USER ? "***" : "EMPTY");
console.log("MONGO_PASS:", MONGO_PASS ? "***" : "EMPTY");
console.log("==================");

if (!MONGO_HOST || !MONGO_DATABASE) {
  throw new Error("Missing MONGO_HOST or MONGO_DATABASE");
}

let uri: string;
if (
  MONGO_USER &&
  MONGO_USER.trim() !== "" &&
  MONGO_PASS &&
  MONGO_PASS.trim() !== ""
) {
  const encodedUser = encodeURIComponent(MONGO_USER);
  const encodedPass = encodeURIComponent(MONGO_PASS);
  uri = `mongodb://${encodedUser}:${encodedPass}@${MONGO_HOST}/?authSource=${MONGO_AUTH_SOURCE}`;
  console.log("🔐 Connecting WITH authentication");
} else {
  uri = `mongodb://${MONGO_HOST}`;
  console.log("🔓 Connecting WITHOUT authentication");
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client
      .connect()
      .then((client) => {
        console.log("✅ MongoDB Connected");
        return client;
      })
      .catch((error) => {
        console.error("❌ MongoDB Error:", error.message);
        throw error;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
export { MONGO_DATABASE };
