/**
 * Registers every schema with mongoose.
 *
 * `populate` resolves a `ref` by model *name* at query time, so a ref only
 * works if some module has already imported that model — otherwise mongoose
 * throws `MissingSchemaError: Schema hasn't been registered for model "X"`.
 * That made each route responsible for importing models it never mentions
 * (`Booking.populate("seatId")` needs Seat; populating `flightId.origin` needs
 * Flight *and* Airport), and a forgotten import failed only on that one route,
 * only at request time. The `await Flight.find()` warm-up calls this replaces
 * were a workaround for the same thing.
 *
 * dbConnect calls `registerModels()`, so awaiting a connection guarantees every
 * ref resolves. New models belong in the map below.
 */
import Airport from "./airport";
import Booking from "./booking";
import Conversation from "./conversation";
import Flight from "./flight";
import GuestUser from "./guestUser";
import Image from "./image";
import Message from "./message";
import Payment from "./payment";
import Seat from "./seat";
import Setting from "./setting";
import Token from "./token";
import User from "./user";

const models = {
  Airport,
  Booking,
  Conversation,
  Flight,
  GuestUser,
  Image,
  Message,
  Payment,
  Seat,
  Setting,
  Token,
  User,
};

/**
 * Returns the models keyed by the name `ref` uses. Importing this module is
 * what actually registers them — the call exists so the import is a used
 * binding rather than a bare side-effect import a bundler could elide.
 */
export function registerModels() {
  return models;
}

export {
  Airport,
  Booking,
  Conversation,
  Flight,
  GuestUser,
  Image,
  Message,
  Payment,
  Seat,
  Setting,
  Token,
  User,
};
