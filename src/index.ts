import "reflect-metadata";
// Keep reflect import first

import dotenv from "dotenv";
dotenv.config();

import { initializeDatabase } from "./db/database";
import { startServer } from "./server";

/**
 * App main()
 */
(async function main() {
  const databaseConnection = await initializeDatabase();
  await startServer(databaseConnection);
})();
