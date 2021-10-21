import { verify } from "djwt/mod.ts";
import { key } from "/key.js";

const validateToken = async (ctx, next) => {
  const authorization = ctx.request.headers.get("Authorization") ?? "";
  const jwtToken = authorization.split(" ")[1];
  const payload = await verify(jwtToken, key, { isThrowing: false });
  if (!payload) {
    ctx.response.body = { msg: "Unauthorized" };
    ctx.response.status = 401;
    return;
  }
  ctx.user = payload;
  await next();
};

export default validateToken;
