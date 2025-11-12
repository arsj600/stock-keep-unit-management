
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URL;
const dbName = process.env.DB_NAME || "ecommerce";

let client;
let db;

export async function connectDB() {
  if (db) return db;
  client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  db = client.db(dbName);


  await db.collection("stocks").createIndex({ product: 1, code: 1 }, { unique: true });
  await db.collection("products").createIndex({ name: "text", description: "text", categories: "text" });

  console.log("Connected to MongoDB", dbName);
  return db;
}

export function getDb() {
  if (!db) throw new Error("Database not initialised. Call connectDB() first.");
  return db;
}

export async function closeDB() {
  if (client) await client.close();
  client = null;
  db = null;
}
