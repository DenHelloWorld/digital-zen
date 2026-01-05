# Quick Reference - Backend Deployment

## Быстрая инструкция по развертыванию на Hostinger

### 1️⃣ Подготовка (на вашем компьютере)

```bash
cd backend
./build-for-deploy.sh
```

Это создаст файл `backend-hostinger.zip`

### 2️⃣ Загрузка на Hostinger

1. Войдите в **hPanel** (панель управления Hostinger)
2. Откройте **Files → File Manager**
3. Перейдите в папку `public_html`
4. Загрузите `backend-hostinger.zip`
5. Щелкните правой кнопкой → **Extract** (Извлечь)
6. Переименуйте папку `backend-deploy` в `api`

### 3️⃣ Настройка на сервере

Подключитесь через **SSH** и выполните:

```bash
cd ~/public_html/api

# Установите зависимости
composer install --optimize-autoloader --no-dev

# Настройте окружение
cp .env.example .env
nano .env

# Важно! Измените в .env:
# - DB_DATABASE=ваша_база_данных  (из hPanel → Databases)
# - DB_USERNAME=ваш_пользователь
# - DB_PASSWORD=ваш_пароль

# Сгенерируйте ключ
php artisan key:generate

# Установите права
chmod -R 755 storage bootstrap/cache
```

### 4️⃣ Настройка домена

В **hPanel → Domains**:
- Установите Document Root: `/public_html/api/public`

### 5️⃣ Проверка

Откройте в браузере:
```
https://ваш-домен.com/api/v1/health
```

Должны увидеть:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "..."
}
```

---

## English Quick Guide

### 1️⃣ Build (on your computer)

```bash
cd backend
./build-for-deploy.sh
```

Creates `backend-hostinger.zip`

### 2️⃣ Upload to Hostinger

1. Login to **hPanel**
2. Go to **Files → File Manager**
3. Navigate to `public_html`
4. Upload `backend-hostinger.zip`
5. Right-click → **Extract**
6. Rename `backend-deploy` to `api`

### 3️⃣ Configure on Server

Connect via **SSH** and run:

```bash
cd ~/public_html/api

composer install --optimize-autoloader --no-dev
cp .env.example .env
nano .env  # Add your database credentials from hPanel
php artisan key:generate
chmod -R 755 storage bootstrap/cache
```

### 4️⃣ Configure Domain

In **hPanel → Domains**:
- Set Document Root to: `/public_html/api/public`

### 5️⃣ Test

Visit: `https://your-domain.com/api/v1/health`

---

## About Frontend Files (package.json, vite.config.js, etc.)

**Это НЕ нужно!** / **NOT NEEDED!**

Laravel включает файлы для фронтенда по умолчанию, но для API они не нужны.

**НЕ запускайте `npm install`** - бэкенд работает без этого.

---

## Troubleshooting / Решение проблем

### 500 Error

```bash
chmod -R 755 storage bootstrap/cache
php artisan config:clear
php artisan cache:clear
```

### Database Connection Error

Проверьте в **hPanel → Databases**:
- Имя базы данных
- Имя пользователя
- Пароль

---

**Полная инструкция:** [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)
