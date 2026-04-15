# Documentación técnica — ParkControl (front + API local)

Documento generado a partir del código y la configuración del repositorio `parkcontrol-front`. Donde no hay evidencia en el proyecto, se indica **PENDIENTE**.

---

## 1. Descripción general

Aplicación web **ParkControl** orientada al **control de estacionamiento en condominios** (texto visible en metadatos de `src/routes/__root.tsx` y títulos de rutas). El repositorio incluye:

- **Cliente**: SPA con **React 19**, **Vite 7**, **TanStack Router** y **TanStack Start** (según dependencias y estructura de rutas con `createFileRoute`).
- **API de desarrollo / demostración**: servidor **Express** en `server/`, que persiste datos en **`server/db.json`** (lectura/escritura vía `server/store.ts`).

El `package.json` mantiene el nombre interno `tanstack_start_ts` (plantilla); el nombre comercial en UI es **ParkControl**. **PENDIENTE:** alinear nombre del paquete con el producto si se publica como librería o artefacto nombrado.

---

## 2. Objetivo

**Inferido del código (no hay PRD ni README en el repositorio):**

- Permitir **inicio de sesión** contra usuarios definidos en la base JSON.
- Mostrar un **dashboard** con métricas de cajones, rejilla de estacionamiento y vehículos recientes.
- Gestionar **vehículos** (listado administrativo, alta/edición/baja) consumiendo la API REST.

**PENDIENTE:** objetivos de negocio formales, alcance por rol, entornos (staging/producción) y SLAs acordados con el cliente — no constan en archivos revisados.

---

## 3. Arquitectura

### 3.1 Vista de alto nivel

```
┌─────────────────────────────────────────────────────────────┐
│  Navegador (React + TanStack Router)                         │
│  - Rutas: /, /dashboard, /vehicles                           │
│  - Auth: localStorage (token + usuario)                      │
│  - HTTP: fetch → /api/... (base opcional VITE_API_URL)       │
└───────────────────────────┬─────────────────────────────────┘
                            │  Vite dev: proxy /api → 127.0.0.1:3001
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Express (server/index.ts) — escucha 127.0.0.1:PORT (3001)   │
│  - CORS habilitado                                           │
│  - JSON body                                                 │
│  - Sesiones Bearer persistidas en db.json                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  server/db.json (AppDatabase: users, parkingSpots, vehicles,  │
│                  sessions opcional)                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Frontend

- **Enrutado por archivos** bajo `src/routes/`; el árbol compilado está en `src/routeTree.gen.ts` (generado por TanStack Router; no editar a mano).
- **Router** creado en `src/router.tsx` (`getRouter`): `routeTree`, `scrollRestoration: true`, componente de error por defecto en inglés.
- **Raíz** (`src/routes/__root.tsx`): `shellComponent` con `<html>`/`<body>`, estilos globales, `Toaster` (Sonner).

### 3.3 Backend (carpeta `server/`)

- **Un único proceso Node** con rutas `/api/auth/*`, `/api/dashboard/metrics`, `/api/parking-spots`, `/api/vehicles` (incluye CRUD y listado reciente).
- **Autenticación**: middleware `requireAuth` (`server/auth.ts`) que valida Bearer, resuelve `userId` desde sesiones en `db.json` y adjunta `authUser` al request.
- **Persistencia**: `readDb` / `writeDb` con escritura atómica aproximada (`db.json.tmp` + `rename`).

**PENDIENTE:** si en producción la API será este Express, otro backend, o serverless; el repositorio solo documenta explícitamente el flujo dev (proxy + `npm run dev`).

---

## 4. Tecnologías

| Área | Tecnología (evidencia) |
|------|-------------------------|
| Runtime / lenguaje | TypeScript 5.x, Node (API con `tsx`) |
| UI | React 19, Tailwind CSS 4 (`@tailwindcss/vite`), componentes Radix/shadcn-style en `src/components/ui/` |
| Build / dev | Vite 7; configuración encapsulada en `@lovable.dev/vite-tanstack-config` (comentario en `vite.config.ts` lista plugins incluidos) |
| Routing | `@tanstack/react-router`, `@tanstack/react-start`, plugin `@tanstack/router-plugin` |
| Formularios / validación | `react-hook-form`, `@hookform/resolvers`, `zod` |
| API local | `express`, `cors` |
| Tests | `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@vitest/coverage-v8` |
| Otros | `sonner`, `recharts`, `framer-motion`, `lucide-react`, etc. (dependencias en `package.json`) |

**Nota:** `@tanstack/react-query` aparece en `package.json` pero **no hay imports** en `src/` en el análisis del repositorio. **PENDIENTE:** uso planificado o eliminación como dependencia no usada.

**PENDIENTE:** detalle del pipeline de despliegue; existe `@cloudflare/vite-plugin` en dependencias y el preset Lovable menciona Cloudflare en build — no se revisó configuración de despliegue fuera de `vite.config.ts`.

---

## 5. Módulos y carpetas principales

| Ruta | Rol |
|------|-----|
| `src/routes/` | Rutas de archivo: `index.tsx` (login), `dashboard.tsx`, `vehicles.tsx`, `__root.tsx` |
| `src/routeTree.gen.ts` | Árbol de rutas generado |
| `src/router.tsx` | Fábrica del router y error boundary por defecto |
| `src/components/` | UI de negocio (`LoginForm`, `TopNavBar`, `ParkingGrid`, `VehicleFormDialog`, etc.) y librería `ui/` |
| `src/hooks/` | `useAuth`, `use-mobile` |
| `src/services/api.ts` | Cliente HTTP hacia `/api` |
| `src/services/mockData.ts` | Tipos compartidos con forma de datos de dominio (nombre histórico “mock”) |
| `src/lib/utils.ts` | Utilidades (p. ej. `cn`) |
| `server/index.ts` | Aplicación Express y definición de endpoints |
| `server/auth.ts` | Sesiones y middleware de auth |
| `server/store.ts` | Persistencia JSON |
| `server/types.ts` | Tipos `AppDatabase`, entidades DB |
| `server/vehicles.ts` | Helpers (placa, IDs) |
| `server/db.json` | Datos de demostración |
| `vitest.config.ts` | Tests bajo `src/**/*.spec.{ts,tsx}`; cobertura configurada principalmente sobre `src/routes/vehicles.tsx` |
| `src/test-setup.ts` | Setup global de tests (jest-dom, `scrollTo`, limpieza de mocks) |

**PENDIENTE:** convención de inclusión de `server/` en `tsconfig.json` (el `tsconfig` actual lista principalmente `src/`); el servidor se ejecuta con `tsx` según scripts.

---

## 6. Flujo del sistema

### 6.1 Desarrollo local (scripts en `package.json`)

1. `npm run dev`: **concurrently** levanta `server:dev` (`tsx watch server/index.ts`) y `dev:vite` (`vite dev`).
2. Vite proxifica **`/api`** hacia `VITE_API_PROXY_TARGET` o por defecto `http://127.0.0.1:3001` (`vite.config.ts`).

### 6.2 Autenticación (cliente + servidor)

1. Usuario en `/` envía credenciales → `api.login` → `POST /api/auth/login`.
2. El servidor valida email/contraseña contra `db.users` y devuelve usuario público + `accessToken`.
3. El cliente guarda token en `localStorage` (`STORAGE_ACCESS_TOKEN_KEY`) y usuario en `parkcontrol_user` (`useAuth`).
4. Rutas protegidas en UI: componentes usan `useAuth` y redirigen si no hay sesión (p. ej. dashboard y vehículos).
5. Peticiones autenticadas: `apiFetch` añade cabecera `Authorization: Bearer …` cuando hay token.
6. Logout: `POST /api/auth/logout` revoca sesión en servidor y el cliente limpia almacenamiento.

### 6.3 Dashboard

1. Tras `ready` y autenticado, se cargan en paralelo métricas, cajones y vehículos recientes (`getDashboardMetrics`, `getParkingSpots`, `getRecentVehicles`).
2. El usuario puede alternar estado de cajones vía `PATCH /api/parking-spots/:id` (lógica en `server/index.ts`).

### 6.4 Vehículos (administración)

1. Ruta `/vehicles`: lista con `GET /api/vehicles`, operaciones de crear/editar/eliminar vía `POST`, `PATCH`, `DELETE` en `/api/vehicles` y `/api/vehicles/:id` (detalle en `server/index.ts` y cliente en `src/services/api.ts`).

### 6.5 Tests

- Vitest ejecuta archivos `src/**/*.spec.{ts,tsx}`.
- Ejemplo documentado en código: `src/routes/vehicles.spec.tsx` (router en memoria, mocks de API y auth).

---

## 7. Riesgos técnicos y limitaciones

1. **Base de datos en un solo archivo JSON**: adecuada para demo; bajo concurrencia real pueden aparecer condiciones de carrera entre lecturas/escrituras (aunque el `rename` mitiga corrupción parcial del archivo). **PENDIENTE:** estrategia de migración a BD relacional/documental si el producto escala.

2. **Contraseñas en texto plano** en el modelo `DbUser` y validación directa en login — adecuado solo para desarrollo/demostración. Riesgo grave si se expone el mismo esquema en producción.

3. **Sesiones almacenadas en `db.json`**: tokens viven junto a datos; revocación y caducidad dependen de la implementación actual (no se observó TTL en `server/auth.ts` en la revisión). **PENDIENTE:** política de expiración y rotación de tokens.

4. **API escucha en `127.0.0.1`**: limita acceso remoto por defecto (comportamiento explícito en `server/index.ts`). **PENDIENTE:** configuración para despliegue accesible en red interna o pública.

5. **CORS `origin: true`**: permisivo; revisar en despliegue real.

6. **Configuración de build centralizada en preset Lovable**: el comentario en `vite.config.ts` advierte de no duplicar plugins. **PENDIENTE:** documentación interna de qué añade el preset y cómo depurar conflictos de plugins.

7. **Pruebas y DOM**: `__root` renderiza `<html>`; en tests con Testing Library puede generar advertencias de HTML anidado inválido. El setup global parchea `window.scrollTo` por limitaciones de jsdom (`src/test-setup.ts`).

8. **Cobertura de tests**: `vitest.config.ts` limita `coverage.include` principalmente a `vehicles.tsx`; el resto del código puede aparecer sin cobertura medida aunque existan más tests en el futuro.

---

## 8. PENDIENTE (resumen)

- Objetivos de negocio, roles y requisitos no versionados en el repo.
- Entorno de producción, hosting y seguridad operativa (HTTPS, secretos, hashing de contraseñas).
- Uso real de `@tanstack/react-query` y de plugins Cloudflare en el flujo actual.
- README o guía de onboarding para nuevos desarrolladores (no existe en la raíz del proyecto al momento de este análisis).
- Alineación `package.json` `name` con el producto.

---

*Última actualización del análisis: según el estado del repositorio en la fecha de generación de este documento.*
