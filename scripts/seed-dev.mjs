/**
 * Seeds the local dev database with an admin, a customer, airports and flights.
 *
 * Everything goes through the running app's HTTP API — the only direct database
 * write is promoting the first account to Admin, which the API deliberately
 * offers no route for.
 *
 *   node scripts/dev-db.mjs      # in one terminal
 *   npm run dev                  # in another
 *   node scripts/seed-dev.mjs
 */
import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(here, "..", ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const BASE = process.env.BASE_URL || "http://localhost:3000";

const ADMIN = {
  fullName: "Ops Admin",
  email: "admin@unitedfly.test",
  password: "Passw0rd!",
};
const CUSTOMER = {
  fullName: "Adaeze Okonkwo",
  email: "adaeze@example.test",
  password: "Passw0rd!",
};

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text.slice(0, 200);
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function register(user) {
  try {
    await api("/auths/register", { method: "POST", body: user });
    console.log(`  registered ${user.email}`);
  } catch (e) {
    if (!String(e.message).includes("already exists")) throw e;
    console.log(`  ${user.email} already exists`);
  }
  const { token } = await api("/auths/login", {
    method: "POST",
    body: { email: user.email, password: user.password },
  });
  return token;
}

console.log("Seeding", BASE);

const adminToken = await register(ADMIN);

// Promote to Admin directly — there is no API route that grants this role.
await mongoose.connect(env.MONGO_URI);
await mongoose.connection
  .collection("users")
  .updateOne({ email: ADMIN.email }, { $set: { role: "Admin" } });
console.log("  promoted admin");
await mongoose.disconnect();

// Re-login so the token is checked against the promoted record.
const admin = await api("/auths/login", {
  method: "POST",
  body: { email: ADMIN.email, password: ADMIN.password },
}).then((r) => r.token);

await register(CUSTOMER);

const AIRPORTS = [
  { name: "Murtala Muhammed", code: "LOS", city: "Lagos", country: "Nigeria" },
  { name: "Heathrow", code: "LHR", city: "London", country: "United Kingdom" },
  { name: "John F. Kennedy", code: "JFK", city: "New York", country: "United States" },
  { name: "Dubai International", code: "DXB", city: "Dubai", country: "United Arab Emirates" },
];

const existing = await api("/airports");
const byCode = new Map(existing.map((a) => [a.code, a]));

for (const airport of AIRPORTS) {
  if (byCode.has(airport.code)) continue;
  const created = await api("/airports", {
    method: "POST",
    token: admin,
    body: airport,
  });
  byCode.set(airport.code, created);
  console.log(`  airport ${airport.code}`);
}

const day = (offset, hour) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const FLIGHTS = [
  { from: "LOS", to: "LHR", dep: day(7, 8), arr: day(7, 15), price: 412 },
  { from: "LOS", to: "LHR", dep: day(7, 13), arr: day(7, 23), price: 377 },
  { from: "LOS", to: "LHR", dep: day(7, 22), arr: day(8, 5), price: 498 },
  { from: "LOS", to: "JFK", dep: day(9, 10), arr: day(9, 20), price: 689 },
  { from: "LHR", to: "DXB", dep: day(12, 9), arr: day(12, 18), price: 544 },
];

const flights = await api("/flights");
if (flights.length >= FLIGHTS.length) {
  console.log(`  ${flights.length} flights already present`);
} else {
  for (const f of FLIGHTS) {
    await api("/flights", {
      method: "POST",
      token: admin,
      body: {
        origin: byCode.get(f.from)._id,
        destination: byCode.get(f.to)._id,
        departureTime: f.dep,
        arrivalTime: f.arr,
        price: f.price,
      },
    });
    console.log(`  flight ${f.from} → ${f.to} $${f.price}`);
  }
}

console.log("\nDone.");
console.log(`  admin     ${ADMIN.email} / ${ADMIN.password}`);
console.log(`  customer  ${CUSTOMER.email} / ${CUSTOMER.password}`);
