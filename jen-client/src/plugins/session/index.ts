import agentSo from "@/stores/stacks/agent/repo"
import llmSo from "@/stores/stacks/llm/repo"
import toolSo from "@/stores/stacks/tool/repo"
import { delay } from "../../utils/time"
import mcpServerSo from "@/stores/stacks/mcpServer/repo"
import authSo from "@/stores/stacks/auth/repo"
import { wsConnection } from "./wsConnection"
import { loadLocalStorage, saveLocalStorage } from "./storage"
import docsSo from "@/stores/docs"
import { Session } from "./types"
import { ViewStore } from "@priolo/jack"
import { buildStore } from "@/stores/docs/utils/factory"
import { deckCardsSo } from "@/stores/docs/cards"
import { DOC_TYPE } from "@/types"



window.addEventListener("load", async (event) => StartSession())
window.addEventListener("beforeunload", async (event) => EndSession())
window.onerror = (message, url, line, col, error) => {
	//	logSo.addError(error)
}
window.addEventListener('online', function () {
	console.log("Sei tornato online!");
});
window.addEventListener('offline', function () {
	console.log("Sei andato offline!");
});



export async function StartSession() {

	// FETCH CURRENT USER
	await authSo.current()


	// LOAD SINGLETONE STORES
	await mcpServerSo.fetch()
	await llmSo.fetch()
	await toolSo.fetch()
	await agentSo.fetch()


	// WS CONNECTION
	//wsConnection.connect()


	// LOAD ALLA SESSION-STATES FROM LOCAL STORAGE
	const session = loadLocalStorage()
	docsSo.setSerialization(session.docsState)
	const { deckStores, drawerStores, menuStores } = buildCards(session)
	//const allStores = [...deckStores, ...drawerStores, ...menuStores]
	deckCardsSo.setAll(deckStores)
	//drawerCardsSo.setAll(drawerStores)
	//menuSo.setAll(menuStores)


	// BUILD SINGLETONE CARDS
	//buildFixedCards(allStores)

}

export async function EndSession() {
	wsConnection?.disconnect()

	const deckStates = deckCardsSo.state.all.map(store => store.getSerialization())
	// const drawerStates = drawerCardsSo.state.all.map(store => store.getSerialization())
	// const menuStates = menuSo.state.all.reduce((acc, store) => {
	// 	if (utils.forEachViews(docsSo.getAllCards(), (v) => v.state.uuid == store.state.uuid)) return acc
	// 	return [...acc, store.getSerialization()]
	// }, [])
	const docsState = docsSo.getSerialization()
	const session: Session = {
		allStates: [...deckStates/*, ...drawerStates, ...menuStates*/],
		docsState,
		deckUuids: deckStates.map(s => s.uuid),
		drawerUuids: [],//drawerStates.map(s => s.uuid),
		menuUuids: [],//menuSo.state.all.map(store => store.state.uuid),
		logs: [],//logSo.state.all,
	}
	saveLocalStorage(session)
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
	//logSo.setAll(session.logs ?? [])

	// DECK
	const deckStates = session.deckUuids?.map(uuid => session.allStates.find(s => s.uuid == uuid))
	const deckStores = deckStates?.map(state => {
		const store: ViewStore = buildStore({ type: state.type, group: deckCardsSo }, state)
		return store
	}).filter(s => !!s) ?? []

	// DRAWER
	const drawerStores = []
	// const drawerStates = session.drawerUuids?.map(uuid => session.allStates.find(s => s.uuid == uuid))
	// const drawerStores = drawerStates?.map(state => {
	// 	const store: ViewStore = buildStore({ type: state.type, group: drawerCardsSo }, state)
	// 	return store
	// }).filter(s => !!s) ?? []

	// MENU
	const menuStores = []
	// const menuStores = session.menuUuids?.map(uuid => {
	// 	let store: ViewStore = utils.forEachViews([...deckStores, ...drawerStores], (v) => v.state.uuid == uuid ? v : null)
	// 	if (!store) {
	// 		const state = session.allStates.find(s => s.uuid == uuid)
	// 		store = state ? buildStore({ type: state.type }, state) : null
	// 	}
	// 	return store
	// }).filter(s => !!s) ?? []

	return { deckStores, drawerStores, menuStores }
}

function buildFixedCards(allStores: ViewStore[]) {
	// const fixedCnn = (allStores.find(s => s.state.type == DOC_TYPE.CONNECTIONS) ?? buildStore({ type: DOC_TYPE.CONNECTIONS })) as CnnListStore
	// const fixedLogs = (allStores.find(s => s.state.type == DOC_TYPE.LOGS) ?? buildStore({ type: DOC_TYPE.LOGS })) as ViewLogStore
	// const fixedAbout = (allStores.find(s => s.state.type == DOC_TYPE.ABOUT) ?? buildStore({ type: DOC_TYPE.ABOUT })) as AboutStore
	// const fixedHelp = buildStore({ type: DOC_TYPE.HELP }) as HelpStore
	// docsSo.setFixedViews([fixedCnn, fixedLogs, fixedAbout, fixedHelp])
}