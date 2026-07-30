/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { registerModels } from "@/model";
declare global {
  /* eslint no-var: 0 */
  var mongoose: any; // This must be a `var` and not a `let / const`
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Every schema, not just the ones the calling route imports — `populate`
  // needs the model behind each `ref` to be registered. See model/index.ts.
  registerModels();

  const MONGO_URI = process.env.MONGO_URI!;

  if (!MONGO_URI) {
    throw new Error(
      "Please define the MONGO_URI environment variable inside .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
