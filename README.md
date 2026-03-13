
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

**Digital Booking – Room Hotel** es una aplicación web desarrollada como parte de un **desafío profesional de desarrollo Full Stack**.

El objetivo fue construir la estructura base de una plataforma de reservas, implementando tanto el **backend como el frontend** y conectándolos mediante una **API REST**.

Durante el **Sprint 1** se implementaron funcionalidades clave como:

• Visualización de habitaciones  
• Detalle de cada habitación  
• Panel de administración  
• Crear habitaciones  
• Eliminar habitaciones  
• Paginación de resultados  
• Galería de imágenes  

Arquitectura general del sistema:

```
React Frontend
      ↓
Spring Boot REST API
      ↓
Base de Datos H2
```

---

# 🧰 Tecnologías Utilizadas

| Capa | Tecnología |
|-----|-------------|
Backend | Java 21 |
Framework Backend | Spring Boot |
Persistencia | Spring Data JPA / Hibernate |
Base de Datos | H2 (en memoria) |
Frontend | React 19 |
Build Tool | Vite |
Routing | React Router DOM |
Testing | Postman |
Control de versiones | Git |
Repositorio | GitHub |

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

# 🧩 Funcionalidades Implementadas (Sprint 1)

### Funcionalidades para usuarios

- Header con navegación y branding
- Home con buscador, categorías y recomendaciones
- Visualización de habitaciones aleatorias
- Página de detalle de habitación
- Galería de imágenes
- Paginación de resultados
- Footer global

### Funcionalidades para administradores

- Panel de administración
- Listar habitaciones
- Crear nuevas habitaciones
- Eliminar habitaciones

---

# ⚙️ Arquitectura Backend

```
com.roomhotel.roomhotel

config
controller
dto
entity
exception
repository
service
```

Responsabilidades:

**Controller**  
Gestiona las peticiones HTTP.

**Service**  
Contiene la lógica de negocio.

**Repository**  
Acceso a la base de datos mediante JPA.

**DTO**  
Objetos de transferencia entre backend y frontend.

**Entity**  
Representación de las tablas en la base de datos.

---

# 🔌 API REST

| Método | Endpoint | Descripción |
|------|------|------|
GET | /api/rooms | Listar habitaciones |
GET | /api/rooms/random | Habitaciones aleatorias |
GET | /api/rooms/{id} | Detalle de habitación |
POST | /api/rooms | Crear habitación |
DELETE | /api/rooms/{id} | Eliminar habitación |

**Documentacion de Postman**
https://documenter.getpostman.com/view/33164372/2sBXietaPi

---

# 💻 Estructura Frontend

```
src
 ├── components
 ├── pages
 └── services
```

Componentes principales:

- Header
- Footer
- RoomCard
- RoomForm
- Pagination
- Categories
- SearchBar

Páginas:

- Home
- Admin
- RoomDetail

---

# 🔄 Flujo de Datos

1️⃣ El usuario interactúa con la interfaz  
2️⃣ React realiza la petición mediante `roomService.js`  
3️⃣ Spring Boot recibe la petición en el Controller  
4️⃣ El Service aplica la lógica de negocio  
5️⃣ El Repository consulta la base de datos  
6️⃣ Se devuelve la respuesta en formato JSON  
7️⃣ React actualiza la interfaz automáticamente

---

# 🧪 Testing

Las pruebas se realizaron utilizando **Postman** y testing manual de componentes.

### API

✔ Listar habitaciones  
✔ Habitaciones aleatorias  
✔ Obtener habitación por ID  
✔ Crear habitación  
✔ Validación de nombre duplicado  
✔ Eliminar habitación  

### UI

Componentes probados:

- Header
- Footer
- Home
- RoomCard
- RoomDetail
- Admin Panel
- Pagination

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
