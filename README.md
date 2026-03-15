# 🛍️ MyStore Data Auth0

Una API REST construida con **Express.js** para simular una tienda en línea. Incluye rutas para productos, categorías y usuarios, además de validaciones y manejo de errores personalizados con `joi` y `@hapi/boom`. Además, maneja persistencia de datos con PostgreSQL y autenticación basada en Passport.js y JWT

## 🚀 Tecnologías

- Node.js
- Express.js
- Joi (validaciones)
- @hapi/boom (manejo de errores)
- CORS
- Nodemon (desarrollo)
- ESLint + Prettier
- Docker
- PostgreSQL
- Passport.js
- JWT

## 🔧 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/Ronald-Torrens/my-store-data-auth.git
cd my-store-data-auth
```

2. Instala dependencias:

```bash
npm install
```

3. Inicia el servidor:

```bash
npm run dev
```

4. El servidor correrá en:

```bash
http://localhost:3000
```

## 📦 Endpoints principales

```http
GET /products         – Lista todos los productos
POST /products        – Crea un nuevo producto
GET /products/:id     – Obtiene un producto por ID
PATCH /products/:id   – Actualiza parcialmente un producto
DELETE /products/:id  – Elimina un producto
```

## 📋 Ejemplo de respuesta

GET /products

```json
[
  {
    "id": 1,
    "name": "Producto de prueba 1",
    "price": 10,
    "description": "Creando con un POST",
    "image": "https://picsum.photos/seed/edZta66H/983/429",
    "createdAt": "2025-08-08T20:42:11.089Z",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Acero",
      "image": "https://picsum.photos/seed/edZta66H/983/429",
      "createdAt": "2025-08-08T20:38:06.054Z"
    }
  },
  {
    "id": 2,
    "name": "Producto de prueba 2",
    "price": 20,
    "description": "Creando con un POST",
    "image": "https://picsum.photos/seed/edZta66H/983/429",
    "createdAt": "2025-08-08T21:15:03.170Z",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Acero",
      "image": "https://picsum.photos/seed/edZta66H/983/429",
      "createdAt": "2025-08-08T20:38:06.054Z"
    }
  }
]
```

## 🧪 Probar con Insomnia

Puedes probar la API usando Insomnia. Sigue estos pasos:

1. Abre Insomnia.
2. Crea una nueva Request Collection (por ejemplo: MyStore API).
3. Agrega una nueva request:

```http
Método: GET
URL: http://localhost:3000/api/v1/products
```

4. Haz clic en "Send" para ver los resultados.

## 💡 También puedes probar:

### POST /products

```json
{
  "name": "Elegant Gold Pizza",
  "price": 258,
  "description": "Experience the turquoise brilliance of our Hat, perfect for needy environments",
  "image": "https://picsum.photos/seed/RkAoBJvDB/3216/1359",
  "categoryId": 1
}
```

### PATCH /products/:id

```json
{
  "price": 65
}
```

## 🛡️ Manejo de errores

Esta API utiliza middleware personalizado para capturar y formatear errores usando @hapi/boom. Ejemplo de error:

```json
{
  "error": "Not Found",
  "message": "Product not found",
  "statusCode": 404
}
```

## ✅ Licencia

Este proyecto está bajo la licencia MIT.
