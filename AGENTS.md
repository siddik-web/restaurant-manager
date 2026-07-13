# Agent Guide — Restaurant Manager

## What this is

Restaurant POS + KDS + recipes/tables/chefs + inventory, with an Alpine.js frontend and Laravel 12 API (`restaurant-api/`).

**Docker:** The project also runs as microservices via `docker compose` — see [DOCKER.md](./DOCKER.md).

## Where to edit

| Goal | Primary files |
|------|----------------|
| Live UI behavior | `index.html`, `js/*.js` (compose in `js/app.js`) |
| Legacy monolith | root `app.js` (not loaded) |
| HTTP client | `js/api.js` |
| API endpoints (monolith) | `restaurant-api/routes/api.php` + controllers |
| API endpoints (microservice) | `restaurant-api/routes/services/*.php` + `config/microservice.php` |
| Cross-service HTTP | `restaurant-api/app/Services/InterServiceClient.php` |
| Schema | `restaurant-api/database/migrations/` |
| Sample data | `restaurant-api/database/seeders/` |
| Docker / gateway | `docker-compose.yml`, `docker/nginx/gateway.conf` |

## Before coding

1. Read `.cursor/rules/` — especially project gotchas (API routing, dual frontend).
2. Match existing JSON envelope: `{ success, data, message? }`.
3. For inventory/stock changes, always write a `StockTransaction`.
4. In Alpine modules, use `this` for state — never close over a separate `state` object.
5. In microservice mode (`SERVICE_DOMAIN` set), avoid cross-domain DB joins — use `InterServiceClient`.

## Do not

- Call `fetch` from feature modules — use `ApiClient`.
- Edit `restaurant-api/vendor/` or commit `.env`.
- Add features to root `app.js` (legacy).

## Verify

```bash
# Monolith
cd restaurant-api && php artisan test

# Microservices (Docker)
docker compose up --build -d
# Open http://localhost:8080
```
