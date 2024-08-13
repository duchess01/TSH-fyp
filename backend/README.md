# Running the Server Locally

## Create a .env file and populate

Copy all variables from `.env.example` to new created `.env` file and change the appropriate variables with your values.

## Install dependencies:

```
npm i
```

## Initialising database

1. Install postgres

- If you are using mac, you can install PostgreSQL using the following command:

  ```
  brew install postgresql
  ```

2. Start PostgreSQL:

- If you are using mac, you can run the following command:
  ```
  brew services start postgresql
  ```

3. Initialise the database by running the command:
   ```
   psql -d tsh_fyp -f src/scripts/init_db.sql
   ```

## Running the server

To start the server, from the backend folder, run either

```
node index.js
```

or

```
npm run dev
```
