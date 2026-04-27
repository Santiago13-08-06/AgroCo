FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git curl libpq-dev zip unzip libzip-dev libsodium-dev \
    && docker-php-ext-install pdo pdo_pgsql zip bcmath \
    && docker-php-ext-enable sodium

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-gd

RUN php artisan config:clear && php artisan cache:clear && php artisan route:clear

EXPOSE 8000

CMD php artisan config:clear && php artisan cache:clear && php artisan serve --host=0.0.0.0 --port=$PORT