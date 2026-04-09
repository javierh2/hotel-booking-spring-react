
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

Durante el **Sprint 2** se implementó una evolución completa del sistema agregando:

• Sistema de autenticación con JWT  
• Gestión de usuarios y roles  
• Categorías y características de productos  
• Panel de administración avanzado  
• Notificaciones por email  
• Seguridad completa con Spring Security  

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
Seguridad | Spring Security + JWT (Auth0) |
Hashing | BCrypt |
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
Blush | #EFE4D9 | Bordes / placeholders |

Estos colores buscan transmitir **calidez, elegancia y confianza**, alineados con la estética del sector hotelero.

---

# 🧩 Funcionalidades Implementadas (Sprint 2)

### 🔐 Autenticación y Usuarios

- Registro de usuario con validación
- Login con JWT
- Logout
- Persistencia en localStorage
- Avatar con iniciales
- Gestión de roles (USER / ADMIN)

### 🏷️ Categorías

- CRUD de categorías
- Filtro múltiple en Home
- Asociación con habitaciones

### ⭐ Características (Features)

- CRUD de features
- Relación ManyToMany con habitaciones
- Selección múltiple en formularios
- Visualización en detalle de producto

### 📧 Notificaciones

- Envío de email de confirmación (Mailtrap)

### 🛠️ Administración

- Panel con 5 vistas:
  - Listado de habitaciones
  - Categorías
  - Features
  - Usuarios
  - Dashboard

### 🏠 Producto (Room)

- Crear / editar / eliminar
- Relación con categorías
- Relación con features
- Validaciones completas

---

# ⚙️ Arquitectura Backend

```
com.roomhotel.roomhotel

config
  ├── SecurityConfig
  └── JwtFilter

controller
  ├── AuthController
  ├── RoomController
  ├── CategoryController
  ├── FeatureController
  └── UserController

dto
entity
repository
service
```
### 🔐 Nueva capa de seguridad

```
Request
 ↓
JwtFilter
 ↓
SecurityFilterChain
 ↓
Controller → Service → Repository
```

- Autenticación stateless con JWT
- Validación por roles
- Protección de endpoints

---

# 🔌 API REST

Para ver documentación completa:
👉 https://documenter.getpostman.com/view/33164372/2sBXietaPi

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`

### Rooms
- GET / POST / PUT / DELETE `/api/rooms`

### Categories
- GET / POST / DELETE `/api/categories`

### Features
- GET / POST / DELETE `/api/features`

### Users (Admin)
- GET `/api/users`
- PUT `/api/users/{id}/role`

---

# 💻 Estructura Frontend

```
src
 ├── components
 ├── pages
 ├── services
 ├── context
 └── hooks
```

### Nuevos módulos

- AuthContext (estado global)
- useAuth hook
- authService
- categoryService
- featureService
- userService

---

# 🔄 Flujo de Datos

### Usuario no autenticado

1. Navega el catálogo
2. Filtra por categorías
3. Visualiza detalles

### Usuario autenticado

1. Login → recibe JWT
2. Guarda en localStorage
3. Envía token en cada request
4. Accede a funcionalidades protegidas

### Administrador

1. Accede al panel
2. Gestiona:
   - habitaciones
   - categorías
   - features
   - usuarios
3. Realiza operaciones CRUD

### Flujo técnico

```
Frontend → fetch (token)
↓
JwtFilter valida JWT
↓
SecurityConfig valida permisos
↓
Controller
↓
Service
↓
Repository
↓
DB
↓
Response → Frontend
```

---

# 🧪 Testing

Las pruebas se realizaron utilizando **Postman** y testing manual de componentes.

### 🔐 Autenticación

- Registro exitoso
- Registro duplicado
- Login válido / inválido
- Protección de endpoints

### 📦 API

- CRUD completo de rooms
- CRUD de categories
- CRUD de features
- Gestión de usuarios

### 🎯 Seguridad

- Acceso sin token → 403
- ROLE_USER → restringido
- ROLE_ADMIN → permitido

### 🖥️ Frontend

- Login / Register
- Header dinámico
- Filtros múltiples
- Admin panel completo
- Formularios (crear/editar)

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
