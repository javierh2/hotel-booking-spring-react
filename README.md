# 🏨 Digital Booking — Room Hotel

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/SpringBoot-3.2-green)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![Database](https://img.shields.io/badge/Database-H2-lightgrey)

Aplicación **Full Stack de reservas de habitaciones** desarrollada con **Java Spring Boot y React**.

El proyecto simula una plataforma de **gestión y visualización de habitaciones de hotel**, permitiendo a los usuarios explorar productos y a los administradores gestionarlos mediante un panel de administración.

---

# 📌 Descripción del Proyecto

**Digital Booking – Room Hotel** es una aplicación web desarrollada como parte de un desafío profesional Full Stack.

Durante el **Sprint 3** se implementó una evolución completa del sistema agregando:

• Crear reservas asociadas a usuarios  
• Validar disponibilidad por fechas  
• Evitar conflictos de reservas  
• Gestión de reservas y favoritos  
• Bloque fijo de políticas del producto  
• Posibilidad de compartir el producto en variadas plataformas  
• Capacidad de puntuar el producto con posibilidad de comentar  
• Eliminación de categorías  
• Integración completa con seguridad JWT  

Arquitectura general:

```
React Frontend
      ↓
Spring Boot + Security + JWT
      ↓
Base de Datos H2
```

---

# 🧰 Tecnologías Utilizadas

| Capa | Tecnología |
|-----|-------------|
Backend | Java 21 |
Framework | Spring Boot |
Seguridad | Spring Security + JWT |
Persistencia | Spring Data JPA / Hibernate |
Base de datos | H2 |
Email | Spring Mail + Mailtrap |
Frontend | React 19 |
Estado global | Context API |
Build Tool | Vite |
Routing | React Router DOM |
Testing | Postman |
Control de versiones | Git + GitHub |

---

# 🎨 Identidad de Marca

El proyecto incluye una **identidad visual definida** con logotipo y paleta de colores.

| Color | Código | Uso |
|------|------|------|
Cream | #F9F3EE | Fondo principal |
Navy | #2C3E50 | Header y textos |
Terracotta | #C47E5A | Botones principales |
Terracotta Dark | #B06A45 | Hover botones |
Gray | #9E8E82 | Textos secundarios |
Blush | #EFE4D9 | Bordes |

Estos colores buscan transmitir **calidez, elegancia y confianza**, alineados con la estética del sector hotelero.

---

# 🧩 Funcionalidades Implementadas (Sprint 3)

### 📅 Reservas
- Crear reservas
- Validar disponibilidad
- Evitar conflictos

### ❤️ Favoritos
- Agregar / quitar favoritos

### ⭐ Rating
- Puntuar productos
- Comentar experiencias

### 🔗 Compartir
- Compartir productos en plataformas externas

### 🏷️ Categorías
- Eliminación de categorías

### 📜 Políticas
- Bloque fijo en detalle de producto

---

# ⚙️ Arquitectura Backend

```
config
controller
dto
entity
repository
service
exception
```

Nuevos módulos:

- Booking
- Favorite
- Rating

---

# 🔌 API REST

Para ver documentación completa:
https://documenter.getpostman.com/view/33164372/2sBXietaPi

### Ratings
- GET /ratings/room/{roomId}
- GET /ratings/room/{roomId}/can-rate
- POST /ratings/room/{roomId}

### Rooms
GET /rooms/available?checkIn=2026-06-01&checkOut=2026-06-05

### Bookings
- GET /bookings/room/{roomId}/occupied-dates
- POST /bookings

### Favorites
- GET /favorites
- GET /favorites/ids
- POST /favorites/{roomId}
- DELETE /favorites/{roomId}

---

# 💻 Estructura Frontend

```
src
 ├── components
 ├── pages
 ├── services
 ├── context

```

Nuevos:

- bookingService
- favoriteService
- ratingService

---

# 🔄 Flujo de Datos

### Usuario
- Navega productos
- Guarda favoritos
- Reserva habitaciones
- Puntúa y comenta

### Admin
- Gestiona productos
- Controla reservas
- Administra contenido

---

# 🧪 Testing (Sprint 3)

- Reservas
- Favoritos
- Reviews y Rating de producto
- Seguridad
- Flujo completo frontend-backend

---

# 🚀 Cómo ejecutar el proyecto

## 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/javierh2/proyect_hotel_java_react_dh.git
cd proyect_hotel_java_react_dh
```

---

# Backend (Spring Boot)

## Requisitos

- Java 21
- Maven

## Ejecutar backend

```bash
cd backend/roomhotel
mvn spring-boot:run
```

El servidor se ejecutará en:

```
http://localhost:8080
```

---

# Frontend (React)

## Requisitos

- Node.js
- npm

## Instalar dependencias

```bash
cd frontend
npm install
```

## Ejecutar aplicación

```bash
npm run dev
```

La aplicación se abrirá en:

```
http://localhost:5173
```

---
## 🎥 Demos de la aplicación

![Demo del home](assets/home.gif)

![Demo de la creacion de habitación](assets/createroom.gif)
