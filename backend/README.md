# Running the Server Locally

## Install dependencies:

```
npm i
```

## Initialising database

1. Install postgres

- If you are using mac, you can install PostgreSQL using the following commands:

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

To start the server, run either

```
node index.js
```

or

```
npm run dev
```
