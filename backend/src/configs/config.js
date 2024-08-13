import dotenv from "dotenv";

dotenv.config();

export default {
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10), // Convert string to number
    database: process.env.DB_NAME,
  },
  port: process.env.PORT || 3000,
};
