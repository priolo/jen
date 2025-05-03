import docsSo from "@/stores/docs"
import { GetAllCards, deckCardsSo, drawerCardsSo } from "@/stores/docs/cards"
import { menuSo } from "@/stores/docs/links"
import { buildStore } from "@/stores/docs/utils/factory"
import { forEachViews } from "@/stores/docs/utils/manage"
import logSo from "@/stores/log"
import { AboutStore } from "@/stores/stacks/about"
import { HelpStore } from "@/stores/stacks/help"
import { ViewLogStore } from "@/stores/stacks/log"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { loadLocalStorage, saveLocalStorage } from "./storage"
import { Session } from "./types"
import { delay } from "../../utils/time"



// window.addEventListener("load", async (event) => StartSession())
// window.addEventListener("beforeunload", async (event) => EndSession())
window.onerror = (message, url, line, col, error) => {
	logSo.addError(error)
}
window.addEventListener('online', function() {
    console.log("Sei tornato online!");
});
window.addEventListener('offline', function() {
    console.log("Sei andato offline!");
});

export async function EndSession() {
	const deckStates = deckCardsSo.state.all.map(store => store.getSerialization())
	const drawerStates = drawerCardsSo.state.all.map(store => store.getSerialization())
	const menuStates = menuSo.state.all.reduce((acc, store) => {
		if (forEachViews(GetAllCards(), (v) => v.state.uuid == store.state.uuid)) return acc
		return [...acc, store.getSerialization()]
	}, [])
	const docsState = docsSo.getSerialization()
	const session: Session = {
		allStates: [...deckStates, ...drawerStates, ...menuStates],
		docsState,
		deckUuids: deckStates.map(s => s.uuid),
		drawerUuids: drawerStates.map(s => s.uuid),
		menuUuids: menuSo.state.all.map(store => store.state.uuid),
		logs: logSo.state.all,
	}
	saveLocalStorage(session)
}

export async function StartSession() {

	// altrimenti MSW non funziona
	if (import.meta.env.DEV) await delay(1000)

	// carico e costruisco la CARD in CACHE
	const session = loadLocalStorage()
	docsSo.setSerialization(session.docsState)
	const { deckStores, drawerStores, menuStores } = buildCards(session)
	const allStores = [...deckStores, ...drawerStores, ...menuStores]
	// inserisco negli STOREs
	deckCardsSo.setAll(deckStores)
	drawerCardsSo.setAll(drawerStores)
	menuSo.setAll(menuStores)

	// BUILD SINGLETONE CARDS
	buildFixedCards(allStores)

	// FINITO! lo indico nel LOGs
	logSo.add({ body: "STARTUP NUI - load session" })

	// mi connetto a chicchessia
	// const ss = new SocketService({
	// 	protocol: window.location.protocol == "http:" ? "ws:" : "wss:",
	// 	host: window.location.hostname,
	// 	port: 3000, //import.meta.env.VITE_API_WS_PORT ?? window.location.port,
	// 	base: "",
	// })
	// ss.connect()
}

export function ClearSession() {
	localStorage.removeItem("logs")
	localStorage.removeItem("cards-all")
	localStorage.removeItem("cards-deck-uuid")
	localStorage.removeItem("cards-drawer-uuid")
	localStorage.removeItem("links-menu-uuid")
}

function buildCards(session: Session) {

	// LOGS
	logSo.setAll(session.logs ?? [])

	// DECK
	const deckStates = session.deckUuids?.map(uuid => session.allStates.find(s => s.uuid == uuid))
	const deckStores = deckStates?.map(state => {
		const store: ViewStore = buildStore({ 
			...state,
			type: state.type, 
			group: deckCardsSo,
		})
		store?.setSerialization(state)
		return store
	}).filter(s => !!s) ?? []

	// DRAWER
	const drawerStates = session.drawerUuids?.map(uuid => session.allStates.find(s => s.uuid == uuid))
	const drawerStores = drawerStates?.map(state => {
		const store: ViewStore = buildStore({ 
			...state,
			type: state.type, 
			group: drawerCardsSo 
		})
		store?.setSerialization(state)
		return store
	}).filter(s => !!s) ?? []

	// MENU
	const menuStores = session.menuUuids?.map(uuid => {
		let store: ViewStore = forEachViews([...deckStores, ...drawerStores], (v) => v.state.uuid == uuid ? v : null)
		if (!store) {
			const state = session.allStates.find(s => s.uuid == uuid)
			store = state ? buildStore({ ...state, type: state.type }) : null
			store?.setSerialization(state)
		}
		return store
	}).filter(s => !!s) ?? []

	return { deckStores, drawerStores, menuStores }
}

function buildFixedCards(allStores: ViewStore[]) {
	const fixedLogs = (allStores.find(s => s.state.type == DOC_TYPE.LOGS) ?? buildStore({ type: DOC_TYPE.LOGS })) as ViewLogStore
	const fixedAbout = (allStores.find(s => s.state.type == DOC_TYPE.ABOUT) ?? buildStore({ type: DOC_TYPE.ABOUT })) as AboutStore
	const fixedHelp = buildStore({ type: DOC_TYPE.HELP }) as HelpStore
	docsSo.setFixedViews([fixedLogs, fixedAbout, fixedHelp])
}