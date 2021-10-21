import { createHash } from "hash/mod.ts";

export function hash(data) {
  const hash = createHash("md5");
  hash.update(data);
  return hash.toString();
}
