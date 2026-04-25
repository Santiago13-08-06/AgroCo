FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git curl libpq-dev zip unzip libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip bcmath sodium

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-gd

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=$PORT