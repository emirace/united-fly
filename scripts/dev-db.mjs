/**
 * Local MongoDB for development.
 *
 * Runs a single-node *replica set* rather than a standalone mongod, because
 * `POST /api/payments` wraps seat/booking/payment creation in a transaction and
 * transactions are unavailable on a standalone server.
 *
 * Pinned to port 27018 with an on-disk dbPath so `.env.local` can hold a stable
 * MONGO_URI and data survives restarts.
 *
 * The data directory deliberately lives OUTSIDE the repo: mongod writes to it
 * continuously, and anything under the project root is watched by Turbopack —
 * which would trigger a Fast Refresh (wiping React state) every few seconds.
 *
 *   node scripts/dev-db.mjs
 *   MONGO_URI=mongodb://127.0.0.1:27018/unitedfly?replicaSet=unitedfly-dev
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const PORT = 27018;
const REPL_SET = "unitedfly-dev";
const DB_NAME = "unitedfly";

const dbPath = process.env.DEV_DB_PATH || resolve(tmpdir(), "unitedfly-dev-db");
mkdirSync(dbPath, { recursive: true });

const replSet = await MongoMemoryReplSet.create({
  replSet: { name: REPL_SET, count: 1, storageEngine: "wiredTiger" },
  instanceOpts: [{ port: PORT, dbPath, storageEngine: "wiredTiger" }],
});

console.log(`\n  MongoDB ready — data in ${dbPath}`);
console.log(
  `  MONGO_URI=mongodb://127.0.0.1:${PORT}/${DB_NAME}?replicaSet=${REPL_SET}\n`
);
console.log("  Ctrl-C to stop.\n");

const stop = async () => {
  await replSet.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
