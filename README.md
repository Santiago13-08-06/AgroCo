# 🌾 AgroCo

> Plataforma web y móvil que convierte análisis de suelo en planes de fertilización personalizados para cultivos de arroz en Colombia.

---

## 📋 Descripción

AgroCo nace de una necesidad real del campo colombiano: los agricultores de arroz reciben análisis de suelo pero no saben cómo traducirlos en un plan de fertilización concreto. Esta plataforma toma los valores nutricionales del suelo y genera automáticamente un plan fraccionado por fase de cultivo (siembra, macollamiento y embuche), con dosis exactas por nutriente, lista de compra en bultos comerciales y envío automático del reporte al correo del agricultor.

---

## ✨ Funcionalidades

- 📊 **Motor de cálculo agronómico** basado en estándares ICA para determinar dosis de fertilizantes según el nivel real del suelo
- 📄 **Generación automática de reportes PDF** con planes fraccionados por fase de cultivo
- 🛒 **Lista de compra** expresada en bultos comerciales reales
- 📧 **Envío automático por correo** al agricultor con su plan adjunto
- 🔐 **Autenticación segura** con Laravel Sanctum
- 🗂️ **Gestión de lotes por usuario** con semáforo visual del estado nutricional del suelo

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Laravel (PHP) |
| Frontend | Angular (TypeScript) |
| Base de datos | PostgreSQL |
| Autenticación | Laravel Sanctum |
| Control de versiones | Git / GitHub |

---

## ⚙️ Requisitos previos

Antes de instalar el proyecto, asegúrate de tener instalado:

- [PHP >= 8.1](https://www.php.net/)
- [Composer](https://getcomposer.org/)
- [Node.js >= 18](https://nodejs.org/) y npm
- [Angular CLI](https://angular.io/cli) — `npm install -g @angular/cli`
- [PostgreSQL >= 14](https://www.postgresql.org/)

---

## 🚀 Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Santiago13-08-06/AgroCo.git
cd AgroCo
```

---

### 2. Configurar el Backend (Laravel)

```bash
cd agroco-backend

# Instalar dependencias
composer install

# Copiar el archivo de entorno
cp .env.example .env

# Generar la clave de la aplicación
php artisan key:generate
```

Edita el archivo `.env` y configura tu base de datos:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=agroco
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña

MAIL_MAILER=smtp
MAIL_HOST=smtp.tuproveedor.com
MAIL_PORT=587
MAIL_USERNAME=tu_correo@ejemplo.com
MAIL_PASSWORD=tu_contraseña
MAIL_FROM_ADDRESS=tu_correo@ejemplo.com
MAIL_FROM_NAME="AgroCo"
```

Luego ejecuta las migraciones:

```bash
php artisan migrate

# Levantar el servidor
php artisan serve
```

El backend quedará disponible en: `http://localhost:8000`

---

### 3. Configurar el Frontend (Angular)

Abre una nueva terminal:

```bash
cd agroco-frontend

# Instalar dependencias
npm install

# Levantar el servidor de desarrollo
ng serve
```

El frontend quedará disponible en: `http://localhost:4200`

---

## 📁 Estructura del proyecto

```
AgroCo/
├── agroco-backend/     # API REST en Laravel
├── agroco-frontend/    # Aplicación Angular
└── docs/               # Documentación adicional
```

---

## 👤 Autor

**Santiago Tovar Vargas**  
Desarrollador FullStack — Laravel + Angular  
📍 Neiva, Huila, Colombia  
🔗 [LinkedIn](https://linkedin.com/in/santiago-tovar-vargas)  
📧 santiagotovarvargas4@gmail.com

---

## 📄 Licencia

Este proyecto es de uso personal y educativo. Todos los derechos reservados © 2025 Santiago Tovar Vargas.
