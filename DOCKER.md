# Docker Microservices

This project runs as **7 domain microservices** behind an nginx API gateway, plus PostgreSQL and the Alpine.js frontend.

## Architecture

```
Browser → gateway:8080
            ├── /           → static frontend (index.html, js/)
            └── /api/*      → routed to domain services
                  ├── /api/recipes*     → menu-service
                  ├── /api/orders*      → order-service
                  ├── /api/tables*      → table-service
                  ├── /api/chefs*       → kitchen-service
                  ├── /api/stations*    → kitchen-service
                  ├── /api/settings*    → settings-service
                  ├── /api/inventory*   → inventory-service
                  ├── /api/suppliers*   → inventory-service
                  ├── /api/purchases*   → inventory-service
                  ├── /api/waste*       → inventory-service
                  └── /api/reports*     → reporting-service
```

Each service is the same Laravel codebase (`restaurant-api/`) with a different `SERVICE_DOMAIN` and its own PostgreSQL database.

| Service | Domain env | Database |
|---------|------------|----------|
| menu-service | `menu` | `menu_db` |
| order-service | `order` | `order_db` |
| table-service | `table` | `table_db` |
| kitchen-service | `kitchen` | `kitchen_db` |
| settings-service | `settings` | `settings_db` |
| inventory-service | `inventory` | `inventory_db` |
| reporting-service | `reporting` | `reporting_db` |

Cross-service calls (e.g. order → menu for recipes, order → inventory for stock) go through the gateway via `InterServiceClient`.

## Quick start

**Prerequisites:** Docker Desktop (or Docker Engine + Compose v2)

```bash
# From repo root
docker compose up --build -d

# Watch startup (migrations + seeders run on first boot)
docker compose logs -f gateway
```

Open **http://localhost:8080** for the UI. API is at **http://localhost:8080/api/**.

## Common commands

```bash
# Stop everything
docker compose down

# Stop and remove volumes (fresh databases)
docker compose down -v

# Rebuild after code changes
docker compose up --build -d

# Run Laravel tests inside a service container
docker compose run --rm menu-service php artisan test

# Shell into a service
docker compose exec order-service sh
```

## Local development (monolith mode)

You can still run the original single-app setup without Docker:

```bash
cd restaurant-api && composer install && cp .env.example .env
php artisan key:generate && php artisan migrate --seed && php artisan serve

# Frontend (repo root, different port)
php -S localhost:8000
```

Leave `SERVICE_DOMAIN` unset (defaults to `monolith`) to load all routes and use SQLite.

## Configuration

- **Compose file:** `docker-compose.yml`
- **Gateway routes:** `docker/nginx/gateway.conf`
- **PHP image:** `docker/php/Dockerfile`
- **Service manifest:** `restaurant-api/config/microservice.php`
- **Per-domain routes:** `restaurant-api/routes/services/*.php`

Environment variables for each API container are set in `docker-compose.yml`. The gateway URL used for inter-service HTTP calls is `GATEWAY_URL=http://gateway`.

## Adding a new service

1. Add a domain block in `restaurant-api/config/microservice.php` (routes, migrations, seeders).
2. Create `restaurant-api/routes/services/<domain>.php`.
3. Add a database in `docker/postgres/init-databases.sql`.
4. Add a service + upstream block in `docker-compose.yml` and `docker/nginx/gateway.conf`.

See `.cursor/skills/add-api-resource/SKILL.md` for full CRUD workflow.
