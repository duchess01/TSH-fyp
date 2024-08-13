import pkg from "pg";
import config from "./config.js";

const { Pool } = pkg;

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  //   user: config.db.user,
  //   password: config.db.password,
  database: config.db.database,
});

pool.on("connect", () => {
  console.log("Connected to the PostgreSQL database");
});

export default {
  query: (text, params) => pool.query(text, params),
};
