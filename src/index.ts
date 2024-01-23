import dotenv from "dotenv";
dotenv.config();

import { startServer } from "./server";

/**
 * App main()
 */
(async function main() {
  await startServer();
})();
