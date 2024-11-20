import dotenv from "dotenv";

dotenv.config();

const isDocker = process.env.DOCKER_ENV === "true";
const isProd = process.env.ENVIRONMENT === "production";

const config = {
  db: {
    host: isDocker ? process.env.DB_HOST_DOCKER : process.env.DB_HOST_LOCAL,
    port: parseInt(
      isDocker ? process.env.DB_PORT_DOCKER : process.env.DB_PORT_LOCAL,
      10
    ),
    database: isDocker ? process.env.DB_NAME_DOCKER : process.env.DB_NAME_LOCAL,
    user: isDocker ? process.env.DB_USER_DOCKER : process.env.DB_USER_LOCAL,
    password: isDocker
      ? process.env.DB_PASSWORD_DOCKER
      : process.env.DB_PASSWORD_LOCAL,

    ssl: isProd
      ? {
          rejectedUnauthorized: false,
          require: true,
        }
      : false,
  },
  port: process.env.PORT || 3000,
};

console.log("this is config: ", config);

export default config;
