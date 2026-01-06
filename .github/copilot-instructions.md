# GitHub Copilot Instructions for "jen"

"jen" is a server application built on the **@priolo/julian** framework, designed as an backend for AI Agents. It provides REST APIs, WebSocket services, and integrates with LLMs and the Model Context Protocol (MCP).

## 🏗 Architecture & Framework (Julian)
The application follows the **@priolo/julian** Service-Oriented Architecture:
- **RootService**: The application entry point (bootstrapped in `src/start.ts`).
- **Configuration-Driven**: The entire service tree (nodes) is defined in `src/config.ts`.
- **Services**: Functional blocks are instances of `ServiceBase` (or subclasses) configured in the tree.
- **Communication**: Services interact via the `Bus` (dispatching actions to paths) or direct parent/child references.

## 📂 Project Structure
- `src/start.ts`: Application entry point. Loads config and starts `RootService`.
- `src/config.ts`: **Core Configuration**. Defines the hierarchy of services (HTTP, WS, DB, Auth, etc.). This is the "Composition Root".
- `src/routers/`: Contains implementation of API routes and WebSocket services. Most files here export a class extending `httpRouter.Service` or `ServiceBase`.
- `src/repository/`: Contains **TypeORM** Entities and Repositories.
- `src/startup/`: Initialization logic (e.g., `dbConfig.ts` for database connection, `seeding.ts`).
- `src/types/`: TypeScript type definitions.
- `src/utils/`: shared utility functions.

> **Note**: `src/jen-client` (frontend) and `src/services` are excluded from this context.

## 🔌 Key Components

### HTTP Layer
The HTTP server is configured in `src/config.ts` using the `http` service.
- **Base URL**: `/api` (configured via `http-router`).
- **Authentication**: Implemented via `http-router/jwt` wrapper in `config.ts`. Protected routes are children of this node.
- **Routes**: Individual route handlers (e.g., `AccountRoute`, `AgentRoute`) are children of the `/api` node.

### WebSocket Layer
Real-time functionality is provided by the `ws` service.
- **Rooms**: `WSRoomsService` (`src/routers/RoomsWSRoute.ts`) manages real-time interactions.

### Database (TypeORM)
Database access is managed by the `typeorm` service.
- **Repositories**: defined in `src/repository/` (e.g., `AccountRepo`).
- **Registration**: Repositories must be listed in `src/config.ts` under the `typeorm` node to be accessible via the Bus.
- **Access Pattern**: Use the `Bus` to dispatch actions (e.g., `FIND`, `SAVE`, `GET_BY_ID`) to the specific repository path (e.g., `/typeorm/accounts`).

## 🛠 Development Guidelines

### Adding a New API Route
1.  **Create Controller**: Create a new file in `src/routers/` (e.g., `MyResourceRoute.ts`).
    - Extend `httpRouter.Service`.
    - Define `stateDefault` with `path` and `routers` (endpoints).
2.  **Register**: Add the class to `src/config.ts` under the `/api` children array.

### Adding a Database Entity
1.  **Define Entity**: Create `MyEntity.ts` in `src/repository/`.
    - Define the interface/class and decorate with TypeORM decorators.
2.  **Register**: Add it to `src/config.ts` under the `typeorm` service children.
3.  **Access**: Use `new Bus(this, "/typeorm/my-entity").dispatch(...)` from your services.

### Coding Style
- Prefer `async/await`.
- Use `Bus` for inter-service communication where possible.
- Keep business logic in Services/Routers, data access in Repositories.
