import agentSo from "@/stores/stacks/agent/repo"
import llmSo from "@/stores/stacks/llm/repo"
import toolSo from "@/stores/stacks/tool/repo"
import { delay } from "../../utils/time"
import { SocketService } from "../SocketService"
import mcpServerSo from "@/stores/stacks/mcpServer/repo"



export const wsConnection: SocketService = new SocketService({
	protocol: window.location.protocol == "http:" ? "ws:" : "wss:",
	host: window.location.hostname,
	port: import.meta.env.VITE_API_WS_PORT ?? 3010,
	base: "",
})




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

