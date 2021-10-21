import { createHash } from "https://deno.land/std/hash/mod.ts";

export function hash(data) {
  const hash = createHash("md5");
  hash.update(data);
  return hash.toString();
}
