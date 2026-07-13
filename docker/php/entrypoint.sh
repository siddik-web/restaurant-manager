#!/bin/sh
set -e

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.docker .env
fi

# Ensure container environment overrides .env defaults
for var in APP_NAME APP_ENV APP_DEBUG DB_CONNECTION DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD SERVICE_DOMAIN GATEWAY_URL; do
    eval "value=\$$var"
    if [ -n "$value" ]; then
        if grep -q "^${var}=" .env; then
            sed -i "s|^${var}=.*|${var}=${value}|" .env
        else
            echo "${var}=${value}" >> .env
        fi
    fi
done

if [ -z "$APP_KEY" ] || ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force --no-interaction
fi

echo "Waiting for PostgreSQL..."
until php -r "
    try {
        new PDO(
            'pgsql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: '5432') . ';dbname=' . getenv('DB_DATABASE'),
            getenv('DB_USERNAME'),
            getenv('DB_PASSWORD')
        );
        exit(0);
    } catch (Throwable \$e) {
        exit(1);
    }
" 2>/dev/null; do
    sleep 2
done

php artisan config:clear --no-interaction
php artisan microservice:migrate --no-interaction

DOMAIN="${SERVICE_DOMAIN:-monolith}"
if [ "$DOMAIN" != "monolith" ]; then
    php artisan db:seed --force --no-interaction --class="Database\\Seeders\\MicroserviceSeeder" || true
fi

exec "$@"
