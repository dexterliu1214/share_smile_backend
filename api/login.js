import { create } from "https://deno.land/x/djwt/mod.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";

import { key } from "../key.js";
import { hash } from "../util/hash.js";
import { users } from "../users.js";

export default async (context) => {
  const value = await context.request.body().value;
  const user = users[value.email];
  if (!user) {
    context.response.status = Status.NotFound;
    return;
  }
  if (user?.password == hash(value.password)) {
    const jwt = await create({ alg: "HS512", typ: "JWT" }, user, key);
    context.response.body = { ...value, jwt };
  } else {
    context.response.status = Status.Unauthorized;
  }
};
