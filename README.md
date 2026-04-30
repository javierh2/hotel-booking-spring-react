# 🏨 Digital Booking

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white) 

Aplicación Full Stack de reservas hoteleras que implementa autenticación JWT, gestión de usuarios con roles y un sistema de reservas con validación de disponibilidad en tiempo real, incluyendo prevención de solapamientos (overbooking) y notificaciones por email.

Desarrollada con Java Spring Boot en el backend, React en el frontend y PostgreSQL como base de datos, incorpora funcionalidades avanzadas como favoritos con actualización optimista, sistema de valoraciones dinámicas y calendario interactivo con disponibilidad en tiempo real.

El proyecto modela un sistema real de gestión hotelera con flujo completo end-to-end, desde la búsqueda hasta la confirmación de reservas.

## 💻 Live Demo

🌐 URL: https://digitalbooking-theta.vercel.app/

> ⚠️ Nota: el backend puede tardar unos segundos en responder la primera vez (cold start en Render)

👤 Usuario ADMIN  
email: dev@admin.com  
password: admin1234

---

## 🚀 Funcionalidades principales

### 👤 Usuario
- Exploración de habitaciones con listado paginado
- Visualización detallada de cada habitación con galería de imágenes
- Sistema de valoraciones con puntuación y comentarios
- Gestión de favoritos con actualización optimista
- Historial de reservas del usuario

### 🛠️ Administrador
- CRUD completo de habitaciones y categorías
- Gestión de usuarios y asignación de roles
- Panel de administración para control del contenido

### 🔐 Autenticación y seguridad
- Autenticación basada en JWT (sin estado en servidor - stateless)
- Control de acceso por roles (USER / ADMIN)
- Protección de endpoints mediante Spring Security

### 🏨 Reservas
- Creación de reservas asociadas a usuarios autenticados
- Validación de disponibilidad en tiempo real
- Prevención de solapamientos de reservas (overbooking)
- Respuesta de error controlada ante conflictos (HTTP 409)
- Notificaciones por email al confirmar la reserva

### ⭐ Experiencia de usuario
- Calendario interactivo con fechas disponibles y ocupadas
- Navegación protegida (Protected Routes)
- Compartir habitaciones en plataformas externas

---

## 🧰 Stack tecnológico

### Backend
- Java 21 + Spring Boot para desarrollo de API REST
- Spring Security para autenticación y autorización
- JWT para autenticación stateless
- Spring Data JPA / Hibernate para persistencia de datos

### Frontend
- React 19 para construcción de interfaces
- React Router DOM para navegación
- Context API para manejo de estado global
- Vite como herramienta de build

### Base de datos
- PostgreSQL (Supabase) como base de datos relacional
- Desplegada mediante Docker Compose con volumen persistente

### DevOps y herramientas
- Docker Compose para entorno local
- Postman para testing manual de endpoints
- JUnit 5 + Mockito para testing unitario
- Git y GitHub para control de versiones


## 🏗️ Arquitectura

El sistema sigue una arquitectura en capas:

- Frontend: React (interfaz de usuario)
- API REST: Spring Boot (controladores, servicios y endpoints)
- Capa de servicios: lógica de negocio
- Capa de persistencia: JPA / Hibernate
- Base de datos: PostgreSQL

La autenticación se gestiona mediante JWT, validado en cada request a través de Spring Security.

---

## 🧠 Decisiones Técnicas

- Se utilizó JWT para implementar autenticación sin estado en servidor, evitando sesiones y facilitando la escalabilidad del sistema.

- La lógica de reservas fue diseñada para prevenir solapamientos (overbooking), validando disponibilidad en tiempo real y devolviendo errores controlados (HTTP 409) ante conflictos.

- El envío de emails se desacopló de la lógica principal mediante un bloque try/catch independiente, evitando que fallos externos afecten la persistencia de reservas.

- Se migró de H2 a PostgreSQL, desplegado mediante Docker Compose, para garantizar un entorno reproducible y más cercano a producción.

- Se adoptó una arquitectura en capas para separar responsabilidades entre controladores, servicios y persistencia.

- Se implementaron tests unitarios con JUnit y Mockito para validar la lógica de reservas, aislando dependencias externas como base de datos y servicios de email.

- Se priorizó el manejo de errores controlados y respuestas HTTP semánticas para representar correctamente los estados del sistema.

---

## 🔌 API REST (principales endpoints)

### Autenticación
- POST /api/auth/register → Registro de usuario
- POST /api/auth/login → Inicio de sesión

### Habitaciones
- GET /api/rooms → Listado de habitaciones
- POST /api/rooms → Crear habitación (ADMIN)
- PUT /api/rooms/{id} → Actualizar habitación (ADMIN)
- DELETE /api/rooms/{id} → Eliminar habitación (ADMIN)

### Reservas
- POST /api/bookings → Crear reserva
- GET /api/bookings/my → Reservas del usuario

### Recursos adicionales
- /api/categories
- /api/features
- /api/users (solo ADMIN)

📄 Documentación completa:
https://documenter.getpostman.com/view/33164372/2sBXietaPi

---

## 🎯 Qué aporta este proyecto

- Desarrollo Full Stack completo (frontend + backend + base de datos)
- Implementación de autenticación segura con JWT
- Modelado de lógica de negocio real (sistema de reservas con validación de disponibilidad)
- Manejo de errores y conflictos mediante respuestas HTTP adecuadas
- Separación de responsabilidades mediante arquitectura en capas
- Testing unitario de lógica crítica con aislamiento de dependencias

---

## ⚙️ Ejecución local

### 1. Clonar el repositorio

~~~bash
git clone https://github.com/javierh2/hotel-booking-spring-react.git
cd proyect_hotel_java_react_dh
~~~

---

### 2. Variables de entorno

- **Backend:** configurar `.env` basado en `.env.example` (credenciales de Mailtrap)
- **Frontend:** configurar `.env` para integración de WhatsApp

---

### 3. Backend (Spring Boot)

**Requisitos:**
- Java 21
- Maven

**Ejecutar:**

~~~bash
cd backend/roomhotel
mvn spring-boot:run
~~~

📍 http://localhost:8080

---

### 4. Frontend (React)

**Requisitos:**
- Node.js
- npm

**Ejecutar:**

~~~bash
cd frontend
npm install
npm run dev
~~~

📍 http://localhost:5173

---

## 🎥 Demo de la aplicación

![Demo del home](assets/user_test.gif)

![Demo de la creacion de habitación](assets/admin_test.gif)
