import agentSo from "@/stores/stacks/agent/repo"
import llmSo from "@/stores/stacks/llm/repo"
import toolSo from "@/stores/stacks/tool/repo"
import { delay } from "../../utils/time"
import mcpServerSo from "@/stores/stacks/mcpServer/repo"
import authSo from "@/stores/auth"
import { wsConnection } from "./wsConnection"



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

	// altrimenti MSW non funziona
	if (import.meta.env.DEV) await delay(1000)

	// FETCH CURRENT USER
	await authSo.current()

	// LOAD SINGLETONE STORES
	await mcpServerSo.fetch()
	await llmSo.fetch()
	await toolSo.fetch()
	await agentSo.fetch()

	// WS CONNECTION
	wsConnection.connect()
}

export async function EndSession() {
	wsConnection?.disconnect()
}

export function ClearSession() {
	// localStorage.removeItem("logs")
	// localStorage.removeItem("cards-all")
	// localStorage.removeItem("cards-deck-uuid")
	// localStorage.removeItem("cards-drawer-uuid")
	// localStorage.removeItem("links-menu-uuid")
}

