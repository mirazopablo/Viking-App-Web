<div align="center">

# 🛡️ Viking App Web

**Enterprise-Grade Web Platform for Workshop & Technical Repair Management**

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[🌐 Live Production App](https://viking-app.zondasolutions.com/) &nbsp;•&nbsp; [⚙️ Go Backend Repository](https://github.com/mirazopablo/viking-app-go) &nbsp;•&nbsp; [📜 API Contract](./openapi.yaml)

<p align="center">
  <a href="#en-english"><strong>English Documentation</strong></a> |
  <a href="#es-español"><strong>🇦🇷 Documentación en Español</strong></a>
</p>

</div>

---

<a id="en-english"></a>
## English Documentation

### 1. Overview & Architecture

**Viking App Web** is the official web client for the **Viking App** repair and workshop ecosystem. Built with a strict focus on API parity, security, and high performance, it interfaces directly with the REST API powered by the [Viking App Go Backend](https://github.com/mirazopablo/viking-app-go).

The platform is architected around two primary domain flows:

1. **Public Customer Portal (`/status`)**:
   - Allows end-users to check real-time repair statuses, diagnostic points, and service logs without requiring user registration or authentication.
   - Protected via a dual-factor lookup using the Work Order UUID/Client Document ID combined with a cryptographic order security code (`WOVIK-XXXXX`).

2. **Private Operational Dashboard (`/login`, `/clients`, `/devices`, `/work-orders`)**:
   - Secure management panel utilizing hierarchical **Role-Based Access Control (RBAC)** (`ADMIN`, `STAFF`, `CLIENT`) backed by JWT Bearer tokens.
   - Enables workshop technicians and administrators to manage client profiles, register equipment, attach diagnostic evidence, and manage the full repair lifecycle.

---

### 2. Live Deployment & Ecosystem

* **Production URL:** [https://viking-app.zondasolutions.com/](https://viking-app.zondasolutions.com/)
* **Backend API Repository (Golang):** [https://github.com/mirazopablo/viking-app-go](https://github.com/mirazopablo/viking-app-go)
* **API OpenAPI Specification:** Included in [`openapi.yaml`](./openapi.yaml).

> **Note on Access Control:** Administrative and workshop views are strictly restricted to authorized staff members (`STAFF` and `ADMIN` roles). Public users track orders strictly via their individual security codes on the `/status` portal.

---

### 3. Technology Stack

| Component | Technology | Rationale & Responsibility |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server-Side Rendering (SSR), modular route grouping (`(auth)`, `(admin)`, `(public)`), and optimized static assets. |
| **Language** | TypeScript 5 | End-to-end type safety strictly mapped to OpenAPI backend schemas. |
| **UI & Styling** | Tailwind CSS v4 + Shadcn UI | Modern utility-first design system with accessible Radix UI primitives and dynamic Dark/Light theme switching (`next-themes`). |
| **Server State** | TanStack React Query v5 | Advanced caching, automatic background refetching, and optimistic mutations for responsive workshop workflows. |
| **HTTP Client** | Axios | Interceptors for automated Bearer token attachment and centralized error handling. |
| **Form Validation** | React Hook Form + Zod v4 | Declarative client-side validation schema ensuring strict compliance with backend DTO constraints. |

---

### 4. Project Structure

```text
viking-app-web/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Protected RBAC routes: /clients, /devices, /work-orders
│   │   ├── (auth)/           # Authentication routes: /login
│   │   ├── (public)/         # Public order tracking routes: /status
│   │   ├── globals.css       # Design tokens & Tailwind CSS v4 setup
│   │   └── layout.tsx        # Global application shell & providers
│   ├── components/           # Reusable UI components & Shadcn UI library
│   ├── hooks/                # Custom React hooks (Query & UI state)
│   ├── lib/                  # Utility helpers & Axios client instance
│   ├── services/             # API integration layer communicating with backend endpoints
│   └── types/                # TypeScript interfaces mapped to openapi.yaml DTOs
├── Dockerfile                # Production multi-stage container build script
├── docker-compose.server.example.yml # Production server Traefik + Watchtower deployment
└── openapi.yaml              # Single Source of Truth for REST API specification
```

---

### 5. Quick Start (Local Development)

#### Prerequisites
* **Node.js** `>= 20.x`
* **npm** `>= 10.x`
* Running instance of [Viking App Go Backend](https://github.com/mirazopablo/viking-app-go) locally or remotely accessible.

#### Installation & Execution

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mirazopablo/Viking-App-Web.git
   cd Viking-App-Web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file and define your backend endpoint:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:8080"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:3000`.

---

### 6. Containerization & Production Deployment

The project includes an optimized multi-stage `Dockerfile` designed for minimal image footprint and hardened production readiness.

#### Build & Run Locally via Docker
```bash
docker build -t viking-app-web:latest .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL="https://your-backend-api.com" viking-app-web:latest
```


---
---

<a id="es-español"></a>
## 🇦🇷Documentación en Español

### 1. Visión General y Arquitectura

**Viking App Web** es la plataforma web oficial para el ecosistema del servicio técnico y taller de reparaciones **Viking App**. Diseñada con una estricta paridad arquitectónica frente a los contratos de la API REST, se integra de forma directa con el [Backend en Go de Viking App](https://github.com/mirazopablo/viking-app-go).

La aplicación se articula en dos flujos de negocio principales:

1. **Portal Público de Seguimiento (`/status`)**:
   - Permite a los clientes consultar en tiempo real el avance de sus reparaciones, diagnósticos técnicos e historial sin requerir registro ni autenticación previa.
   - Protegido mediante un doble factor de consulta: ID de Orden / DNI del cliente en combinación con un código de seguridad efímero (`WOVIK-XXXXX`).

2. **Panel Operativo Privado (`/login`, `/clients`, `/devices`, `/work-orders`)**:
   - Entorno administrativo respaldado por **Control de Acceso Basado en Roles (RBAC)** (`ADMIN`, `STAFF`, `CLIENT`) protegido con tokens JWT Bearer.
   - Permite al personal técnico gestionar perfiles de clientes, alta y baja de dispositivos, adjuntar diagnósticos y administrar todo el ciclo de vida de las órdenes de trabajo.

---

### 2. Despliegue en Producción y Ecosistema

* **URL de Producción:** [https://viking-app.zondasolutions.com/](https://viking-app.zondasolutions.com/)
* **Repositorio del Backend API (Golang):** [https://github.com/mirazopablo/viking-app-go](https://github.com/mirazopablo/viking-app-go)
* **Especificación OpenAPI:** Disponible en [`openapi.yaml`](./openapi.yaml).

> **Nota de Control de Acceso:** Las secciones de administración y taller están estrictamente restringidas al personal autorizado (`STAFF` y `ADMIN`). Los usuarios públicos interactúan con sus reparaciones de forma segura desde la ruta `/status`.

---

### 3. Stack Tecnológico

| Componente | Tecnología | Rationale y Responsabilidad |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Renderizado del lado del servidor (SSR), agrupación modular de rutas (`(auth)`, `(admin)`, `(public)`) y optimización de recursos. |
| **Lenguaje** | TypeScript 5 | Tipado robusto de extremo a extremo sincronizado con los DTOs del contrato OpenAPI. |
| **UI & Estilos** | Tailwind CSS v4 + Shadcn UI | Sistema de diseño moderno basado en utilidades con primitivas accesibles Radix UI y soporte de modo Oscuro/Claro (`next-themes`). |
| **Estado del Servidor** | TanStack React Query v5 | Caché inteligente, refetching en segundo plano y mutaciones optimistas para flujos operativos ágiles. |
| **Cliente HTTP** | Axios | Interceptores automáticos de tokens Bearer JWT y manejo centralizado de respuestas REST. |
| **Formularios** | React Hook Form + Zod v4 | Validación declarativa del lado del cliente alineada con las invariantes del backend. |

---

### 4. Estructura del Proyecto

```text
viking-app-web/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Rutas protegidas RBAC: /clients, /devices, /work-orders
│   │   ├── (auth)/           # Rutas de autenticación: /login
│   │   ├── (public)/         # Portal de seguimiento público: /status
│   │   ├── globals.css       # Tokens de diseño y configuración de Tailwind CSS v4
│   │   └── layout.tsx        # Shell principal de la aplicación y proveedores globales
│   ├── components/           # Componentes UI reutilizables y librería Shadcn UI
│   ├── hooks/                # Custom hooks (TanStack Query y estado de UI)
│   ├── lib/                  # Helpers, formateadores y cliente Axios base
│   ├── services/             # Servicios de comunicación con endpoints REST del backend
│   └── types/                # Interfaces TypeScript mapeadas al esquema openapi.yaml
├── Dockerfile                # Configuración Docker multi-stage build de producción
├── docker-compose.server.example.yml # Plantilla de despliegue en servidor VPS con Traefik
└── openapi.yaml              # Single Source of Truth del contrato API REST
```

---

### 5. Guía de Inicio Rápido (Desarrollo Local)

#### Requisitos Previos
* **Node.js** `>= 20.x`
* **npm** `>= 10.x`
* Instancia en ejecución del [Backend Go de Viking App](https://github.com/mirazopablo/viking-app-go).

#### Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/mirazopablo/Viking-App-Web.git
   cd Viking-App-Web
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo de ejemplo y apunta a tu servidor backend:
   ```bash
   cp .env.example .env.local
   ```
   Edita `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:8080"
   ```

4. **Inciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Accede a la plataforma en `http://localhost:3000`.

---

### 6. Contenedorización y Producción

El proyecto incorpora un `Dockerfile` multi-etapa (*multi-stage build*) optimizado para producción con una huella ligera de memoria.

#### Construcción y Ejecución Local mediante Docker
```bash
docker build -t viking-app-web:latest .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL="https://tu-backend-api.com" viking-app-web:latest
```

---
<div align="center">
  <small>Viking App • Built for enterprise repair efficiency & scalability.</small>
</div>
