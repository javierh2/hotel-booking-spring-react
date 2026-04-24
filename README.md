# 🏨 Digital Booking

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/SpringBoot-3.2-green)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![Database](https://img.shields.io/badge/Database-H2-lightgrey)

Aplicación **Full Stack de reservas** desarrollada con **Java Spring Boot y React**.

El proyecto simula una plataforma de **gestión y visualización de habitaciones de hotel**, permitiendo a los usuarios explorar productos y a los administradores gestionarlos mediante un panel de administración.

---

# 📌 Descripción del Proyecto

**Digital Booking** es una aplicación web desarrollada como parte de un desafío profesional Full Stack.
Durante **Sprints** se implementó una evolución completa del sistema agregando explícitos requisitos y características de funcionalidad:

• Visualización de habitaciones  
• Detalle de cada habitación  
• Panel de administración  
• Crear habitaciones  
• Eliminar habitaciones  
• Paginación de resultados  
• Galería de imágenes  
• Sistema de autenticación con JWT  
• Gestión de usuarios y roles  
• Categorías y características de productos  
• Panel de administración avanzado  
• Notificaciones por email  
• Seguridad completa con Spring Security  
• Crear reservas asociadas a usuarios  
• Validar disponibilidad por fechas  
• Evitar conflictos de reservas  
• Gestión de reservas y favoritos  
• Bloque fijo de políticas del producto  
• Posibilidad de compartir el producto en variadas plataformas  
• Capacidad de puntuar el producto con posibilidad de comentar
• Historial de reservas
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
---

# 🔌  API REST

POST /api/auth/register **&** POST /api/auth/login **->** creación y login de usuario

GET, POST, PUT, DELETE **->** /api/rooms

GET, POST, DELETE **->** /api/categories

GET, POST, DELETE **->** /api/features

**Operaciones de usuario administrativo bajo ->** /api/users

Para ver documentación completa:
https://documenter.getpostman.com/view/33164372/2sBXietaPi

---

# 💻 Estructura Frontend

```
src
 ├── components
 ├── pages
 ├── services
 ├── context

```
---

# 🔄 Flujo de Datos

### Usuario
- Navega productos
- Guarda favoritos
- Reserva habitaciones
- Puntúa y comenta
- Posibilidad de compartir el producto

### Admin
- Gestiona productos
- Controla reservas
- Administra contenido

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

![Demo del home](assets/user_test.gif)

![Demo de la creacion de habitación](assets/admin_test.gif)
