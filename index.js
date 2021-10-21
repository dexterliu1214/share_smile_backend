import { Application, Router } from "oak/mod.ts";
import { oakCors } from "cors/mod.ts";
import validateToken from "/middleware/validateToken.js";
import register from "/api/register.js";
import login from "/api/login.js";

const router = new Router();

router.post("/register", register);
router.post("/login", login);

const app = new Application()
  .use(oakCors())
  .use(router.routes())
  .use(router.allowedMethods());

await app.listen({ port: 8000 });
console.log("running");
