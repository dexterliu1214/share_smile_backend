import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import register from "./api/register.js";
import login from "./api/login.js";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { hash } from "./util/hash.js";

const router = new Router();

router.post("/register", register);
router.post("/login", login);
router.get("/chat_room", (context) => {
  const db = new DB("sqlite.db");
  const user_id = context.request.url.searchParams.get("user_id");
  const result = db.queryEntries(
    `
    SELECT 
      room_id ,
      content,
      pic,
      created_at,
      title,
      count(1) FILTER(where read_at IS NULL AND sender_id != :user_id) AS unread_count
    FROM (
      SELECT 
        chat_room_message.*,
        (CASE chat_room_message.sender_id=:user_id WHEN 0
          THEN sender.username 
          ELSE receiver.username
        END) AS title
      FROM chat_room_message
      JOIN user sender ON sender.id=chat_room_message.sender_id
      JOIN user receiver ON receiver.id=chat_room_message.receiver_id
      WHERE sender_id=:user_id OR receiver_id=:user_id 
      ORDER BY id DESC
    )
    GROUP BY room_id
    `,
    { user_id },
  );
  db.close();
  context.response.body = result;
});

router.get("/chat_message", (context) => {
  const db = new DB("sqlite.db");
  const room_id = context.request.url.searchParams.get("room_id");
  const result = db.queryEntries(
    `SELECT * FROM chat_room_message WHERE room_id=${room_id}`,
  );
  db.close();
  context.response.body = result;
});

router.get("/test", async (context) => {
  const db = new DB("sqlite.db");

  db.query(`DROP TABLE IF EXISTS person`);
  db.query(`DROP TABLE IF EXISTS user`);
  db.query(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME('now'))
  )
`);

  const users = [
    {
      username: "test1",
      email: "test1@test.com",
      password: hash("test"),
    },
    {
      username: "test2",
      email: "test2@test.com",
      password: hash("test"),
    },
    {
      username: "test3",
      email: "test3@test.com",
      password: hash("test"),
    },
    {
      username: "test4",
      email: "test4@test.com",
      password: hash("test"),
    },
    {
      username: "test5",
      email: "test5@test.com",
      password: hash("test"),
    },
  ];

  for (const user of users) {
    db.query("INSERT INTO user (username, password, email) VALUES (?, ?, ?)", [
      user.username,
      user.password,
      user.email,
    ]);
  }

  db.query(`DROP TABLE IF EXISTS chat_room`);
  db.query(`
  CREATE TABLE IF NOT EXISTS chat_room (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT (DATETIME('now'))
  )
`);

  db.query("INSERT INTO chat_room DEFAULT VALUES");

  db.query(`DROP TABLE IF EXISTS chat_room_message`);
  db.query(`
  CREATE TABLE IF NOT EXISTS chat_room_message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL, 
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT DEFAULT (''),
    pic TEXT,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    read_at TEXT
  )
`);
  const uuid1 = crypto.randomUUID();
  const uuid2 = crypto.randomUUID();
  const uuid3 = crypto.randomUUID();

  const messages = [
    {
      "room_id": uuid1,
      "sender_id": 1,
      "receiver_id": 2,
      "content":
        "this is a test asdf asdf ajsdfk ljas jfkasdjflas fjkasdjf kasdjf lajsdk fajklsdjfkla sdjfk ajlsdjfa ksdjfla ",
      "pic": "https://placeimg.com/640/480/any?t=1",
    },
    {
      "room_id": uuid1,
      "sender_id": 2,
      "receiver_id": 1,
      "content": "this is a test",
      "pic": "https://placeimg.com/640/480/any?t=2",
    },
    {
      "room_id": uuid2,
      "sender_id": 3,
      "receiver_id": 1,
      "content": "send from sender 3",
      "pic": "https://placeimg.com/640/480/any?t=2",
    },
    {
      "room_id": uuid3,
      "sender_id": 4,
      "receiver_id": 5,
      "content": "A talk to B",
      "pic": "https://placeimg.com/640/480/any?t=1",
    },
    {
      "room_id": uuid3,
      "sender_id": 5,
      "receiver_id": 4,
      "content": "B talk to A",
      "pic": "https://placeimg.com/640/480/any?t=2",
    },
  ];

  // Run a simple query
  for (const message of messages) {
    await new Promise((r) => setTimeout(r, 1000));
    db.query(
      "INSERT INTO chat_room_message (room_id, sender_id, receiver_id, content, pic) VALUES (?, ?, ?, ?, ?)",
      [
        message.room_id,
        message.sender_id,
        message.receiver_id,
        message.content,
        message.pic,
      ],
    );
  }

  console.log("inserted");

  // Print out data in table
  for (const [row] of db.query("SELECT * FROM chat_room_message")) {
    console.log(row);
  }

  // Close connection
  db.close();
});

const app = new Application()
  .use(oakCors())
  .use(router.routes())
  .use(router.allowedMethods());

await app.listen({ port: 8000 });
console.log("running");
