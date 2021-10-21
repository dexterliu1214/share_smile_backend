import { create } from "djwt/mod.ts";

import { key } from "/key.js";
import { hash } from "/util/hash.js";
import { users } from "/users.js";

export default async (context) => {
  const value = await context.request.body().value;
  value.password = hash(value.password);
  console.log(value);
  users[value.email] = value;
  console.log(users);
  const jwt = await create({ alg: "HS512", typ: "JWT" }, value, key);
  context.response.body = { ...value, jwt };
};
