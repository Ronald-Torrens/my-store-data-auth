# 🛍️ My Store Data Auth API

Backend authentication API built with Node.js, Express and Sequelize.

## 📋 Features

- JWT Authentication
- Password recovery via email
- Role-based access control
- Secure password hashing with bcrypt
- Nodemailer email notifications

## 🚀 Tech Stack

- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT
- Nodemailer
- Docker

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/Ronald-Torrens/my-store-data-auth.git
cd my-store-data-auth
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm run dev
```

4. The server will run on:

```bash
http://localhost:3000
```

## Environment Variables

Create a `.env` file:

```bash
JWT_SECRET=
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
```
## 📦 API Endpoints

```http
POST /auth/login  
POST /auth/recovery  
POST /auth/change-password
```
