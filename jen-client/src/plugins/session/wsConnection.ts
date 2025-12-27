import authSo from "@/stores/stacks/auth/repo";
import { SocketService } from "../SocketService";



export const wsConnection: SocketService = new SocketService({
	protocol: window.location.protocol == "http:" ? "ws:" : "wss:",
	host: window.location.hostname,
	port: import.meta.env.VITE_API_WS_PORT ?? 3010,
	base: "",
})
