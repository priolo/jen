# GitHub Copilot Instructions for `jen-client`

## Project Overview
`jen-client` is a React-based frontend application built with Vite, using a custom state management solution (`@priolo/jon` and `@priolo/jack`). The architecture is heavily centered around a "deck of cards" UI paradigm where different views (Agents, LLMs, Tools, etc.) are presented as stackable cards.

## Architecture & Core Concepts

### State Management (`@priolo/jon` & `@priolo/jack`)
- **Stores**: The application uses a decentralized store pattern. Stores are defined in `src/stores/` and often composed using `mixStores`.
- **View/Card System**: The UI is built on a "Deck" and "Drawer" system.
  - `DeckGroup` and `DrawerGroup` manage collections of cards.
  - **PolymorphicCard**: The central component (`src/components/cards/PolymorphicCard.tsx`) that dynamically renders specific views based on the `DOC_TYPE` in the store state.
- **Stacks**: Located in `src/stores/stacks/`. These represent the business logic and state for specific features (e.g., `agent`, `llm`, `room`).
  - **Repo Stores**: (e.g., `src/stores/stacks/agent/repo.ts`) Handle data fetching and caching for collections.
  - **List/Detail Stores**: (e.g., `src/stores/stacks/agent/list.ts`, `detail.ts`) Manage the UI state for list and detail views.
- **Serialization**: Stores implement `getSerialization` and `setSerialization` to persist and restore state (e.g., layout, open cards).

### API Layer
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





# Utilizzo libreria JACK
Si occupa di gestire le card che rappresentano le varie viste dell'applicazione.

### Tooltip 
Per inserire un Tooltip collegato ad un componente:
```tsx
// "style" fa riferimento al "childen" del tooltip 
<TooltipWrapCmp content="CONTENUTO DEL TOOLTIP" style={{ display: "flex", alignItems: "center" }}>
	<div>CHILDEN</div>
</TooltipWrapCmp>
```

### Snackbar
Per inserire uno Snackbar bisogna avere il riferimento allo store della CARD
```tsx
store.setSnackbar({
	open: true, 
	type: MESSAGE_TYPE.WARNING, 
	timeout: 5000,
	body: "Please enter your email before requesting a verification code.",
})
```

### Dialog
Una dialog ha bisogno del riferimento allo store della CARD e di una variabile booleana per l'apertura/chiusura.
```tsx
const [dialogIsOpen, setDialogIsOpen] = useState(false);
...

<Dialog store={store}
	title="CODE"
	width={280}
	open={emailDialogIsOpen}
	onClose={handleClose}
>
  CONTENT
	<Button onClick={()=>setDialogIsOpen(false)}>
		CLOSE
	</Button>
</Dialog>
```

Per aprire una dialog che mostra un messaggio di conferma:
```tsx
if (!await store.alertOpen({
	title: "DELETION",
    body: "This action is irreversible.\nAre you sure?",
})) return
```
