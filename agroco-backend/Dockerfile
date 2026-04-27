FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    git curl libpq-dev zip unzip libzip-dev libsodium-dev \
    && docker-php-ext-install pdo pdo_pgsql zip bcmath \
    && docker-php-ext-enable sodium \
    && a2enmod rewrite headers

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-gd

RUN php artisan config:clear && php artisan cache:clear && php artisan route:clear

RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

CMD apache2-foreground