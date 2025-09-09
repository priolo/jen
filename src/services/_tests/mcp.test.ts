import { http, RootService } from "@priolo/julian";
import buildNodeConfig, { PORT } from "../../config.js";
import { getMcpTools } from "../mcp/utils.js";



describe("Test MCP", () => {

	let root: RootService

	beforeAll(async () => {
		const cnf = buildNodeConfig(true, true)
		root = await RootService.Start(cnf)
		const http = root.nodeByPath("/http") as http.Service
		const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
		http.server.setTimeout(TIMEOUT_MS); // General socket timeout
		http.server.keepAliveTimeout = TIMEOUT_MS; // Keep-alive timeout
		http.server.headersTimeout = TIMEOUT_MS + 1000; // Headers timeout (should be slightly more than keepAliveTimeout)
	})

	afterAll(async () => {
		await RootService.Stop(root)
	})

	test("Ricavo i tools", async () => {
		const res = await getMcpTools(`http://localhost:${PORT}/mcp`)
		console.log(res)
		expect(res).toMatchObject([{
			name: "sum",
			title: "Tool for Addition",
			description: "Performs addition of two numbers",
		},
		{
			name: "subtract",
			title: "Tool for Subtraction",
			description: "Performs subtraction of two numbers",
		},
		])
	}, 100000)


	test("Ricavo i tools", async () => {
		const res = await getMcpTools("https://mcp.copilotkit.ai")
		console.log(res)
	}, 100000)

})