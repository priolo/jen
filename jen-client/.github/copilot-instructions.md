# Architecture & Core Concepts


## Stores: 
The application uses a decentralized store pattern. 
La documentazione per usare `@priolo/jon` si trova nel file `jon/.github/copilot-instructions.md` di questo "workspace".
### directory structure
- The STORES are defined in `src/stores/`.


## View/Card System UI: 
La UI è costruita su un sistema di "CARD" fornito dalla libreria `@priolo/jack`.
La documentazione per gestire la UI con le CARD si trova nel file `jack/.github/copilot-instructions.md` di questo "workspace".
### directory structure
- The CARD components are in `src/app/cards/`.
- The main CARD rendering component is `src/components/cards/PolymorphicCard.tsx`.


## API Layer
- **AjaxService**: A wrapper around `fetch` located in `src/plugins/AjaxService.ts`. It handles standard HTTP methods and integrates with stores for loading states.
- **API Modules**: Located in `src/api/`. Each module (e.g., `agent.ts`) maps to backend endpoints and uses `AjaxService`.


### Component Structure
- **App Entry**: `src/main.tsx` mounts `src/app/App.tsx`.
- **Layout**: `App.tsx` defines the main layout with `MainMenu`, `DeckGroup`, and `DrawerGroup`.
- **Cards**: Feature-specific views are in `src/app/cards/`. Each card typically has a `ListView` and `DetailView`.


## Developer Workflow

### Commands
- **Dev Server**: `npm run dev` (Vite) - Proxies `/api` to `http://localhost:3000`.
- **Build**: `npm run build`
- **Test**: `npm run test` (Vitest)

### Key Conventions
- **Store Naming**: Stores often end with `So` (e.g., `docsSo`, `deckCardsSo`).
- **Path Aliases**: Use `@/` to reference `src/` (configured in `vite.config.ts`).
- **CSS Modules**: Used for component-specific styling (e.g., `App.module.css`).
- **Global Styles**: Located in `src/css/`.
- **Environment Variables**: `VITE_API_URL` controls the API base URL (defaults to `/api/`).


## Integration Points
- **Backend**: The app expects a backend running on port 3000 (proxied via Vite).
- **External Libs**: Heavily relies on `@priolo/jon` (state), `@priolo/jack` (UI kit/state patterns), and `slate` (rich text editing).


## Common Patterns
- **Creating a New View**:
  1. Define a `DOC_TYPE` enum.
  2. Create a Store in `src/stores/stacks/`.
  3. Create a View Component in `src/app/cards/`.
  4. Register the mapping in `PolymorphicCard.tsx`.
  5. Add factory methods to create the store instance.
- **Data Fetching**:
  - Call API methods from Store actions.
  - Use `loadBaseSetup` mixin for handling loading states automatically.

## File Structure Highlights
- `src/stores/stacks/`: Domain-specific state logic (the "Brain").
- `src/app/cards/`: UI components for each view (the "Face").
- `src/api/`: Backend communication.
- `src/plugins/`: Infrastructure services (Ajax, etc.).

