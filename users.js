import { hash } from "/util/hash.js";

var users = {
  "test": {
    username: "test",
    email: "test@test.com",
    password: hash("test"),
  },
};

export { users };
