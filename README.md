# Welcome to Fluidia!

Fluidia is an interactive physics-learning web application with lessons, simulations,
quests, and account progress tracking.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm
- The Fluidia backend and its SQL database

## Clone the frontend

```bash
git clone https://github.com/ahron-gutierrez/physics-website-frontend.git
cd physics-website-frontend
npm install
```

## Run the frontend

Start the Vite development server:

```bash
npm run dev
```

Open the local address printed by Vite, normally `http://localhost:5173`.

Other useful commands:

```bash
npm run lint
npm run build
```

## Connect to the backend

The frontend expects the backend to be available at `http://localhost:3000` during
development. Vite forwards all `/api` requests to that server automatically; this
proxy is configured in `vite.config.js`.

1. Clone the backend repository:

   ```bash
   git clone https://github.com/WafflesFox/PhysicsWebsite.git
   ```

2. Follow the backend repository's setup instructions to install its dependencies,
   configure its database connection, and start it on port `3000`.
3. Keep the backend running in a separate terminal, then run this frontend with
   `npm run dev`.

The account API is reached through `/api/accounts`; no frontend environment variable
is needed for the local proxy setup.

## SQL table

The frontend reads and saves the account fields below. If your backend does not already
provide a migration, use this MySQL-compatible baseline schema (or adapt it to the
backend's existing database conventions):

```sql
CREATE TABLE accounts (
  ID INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(120) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  Score INT NOT NULL DEFAULT 0,
  Avatar JSON NULL,
  Progress JSON NULL,
  MapVisited JSON NULL,
  CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

`Avatar`, `Progress`, and `MapVisited` store the application state saved for each
account. Passwords must be hashed by the backend before being stored; never save plain
text passwords.
