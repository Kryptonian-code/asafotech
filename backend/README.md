# Local Backend

This backend is a simple PHP + MySQL API designed for local development with XAMPP or the PHP built-in server.

## Requirements

- PHP 8.1+
- MySQL 8+ or MariaDB
- XAMPP or a standalone PHP/MySQL install

## Database setup

1. Create a database named `asafo_tech`.
2. Import [database/schema.sql](c:/Users/bigjo/Desktop/apps/e-commerce/backend/database/schema.sql).
3. Run any newer migration files from [database/migrations](c:/Users/bigjo/Desktop/apps/e-commerce/backend/database/migrations) when needed.
4. If you want demo data for testing, import [database/dev_seed.sql](c:/Users/bigjo/Desktop/apps/e-commerce/backend/database/dev_seed.sql).


Seeded test users:
- `kwame.buyer@example.com` / `TestUser123!`
- `ama.shopper@example.com` / `Buyer123!`

## Configuration

Copy `.env.example` to `.env` and update the database values if needed.

You can also define local admin login credentials in the main project env file at the project root, for example `.env` or `.env.production`.

Single admin example:

```env
ADMIN_FULL_NAME=Store Owner
ADMIN_EMAIL=owner@example.com
ADMIN_PASSWORD=ChangeMe123!
```

Multiple admin example:

```env
ADMIN_1_FULL_NAME=Store Owner
ADMIN_1_EMAIL=owner@example.com
ADMIN_1_PASSWORD=ChangeMe123!
ADMIN_2_FULL_NAME=Manager
ADMIN_2_EMAIL=manager@example.com
ADMIN_2_PASSWORD=ChangeMe456!
```

When env-based admin credentials are present in the main project env, they can sign in even if the `admin_users` table is empty or you want to bypass the stored database admin account for local development.

## Run with XAMPP

Option 1:
- Place this repo inside `htdocs`, then use `http://localhost/e-commerce/backend/public/api`.

Option 2:
- Create an Apache virtual host or alias that points to `backend/public`.

## Run with PHP built-in server

```sh
php -S 127.0.0.1:8000 -t backend/public
```

The API base URL will then be `http://127.0.0.1:8000/api`.

## Available endpoints

- `GET /api/health`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products?collection=trending`
- `GET /api/products?collection=deals`

The database is intentionally empty by default so you can create your own categories and products.
