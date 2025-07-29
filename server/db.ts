import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool: NodePool } = pkg;
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if we're using local PostgreSQL or Neon
const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.LOCAL_AUTH === 'true';

let db: any;

if (isLocal) {
  // Use standard node-postgres for local development
  const pool = new NodePool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: false // Disable SSL for local development
  });
  db = drizzleNode(pool, { schema });
} else {
  // Use Neon serverless for production
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { db };