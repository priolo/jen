import { RootService } from "@priolo/julian";
import buildNodeConfig, { PORT } from "../config"
import axios, { AxiosInstance } from "axios"
import { Llm } from "../repository/Llm";
import {http } from "@priolo/julian";


describe("Test on AGENT router", () => {

	let axiosIstance: AxiosInstance
	let root: RootService

	beforeAll(async () => {

		axiosIstance = axios.create({
			baseURL: `http://localhost:${PORT}`,
			withCredentials: true
		})

		const cnf = buildNodeConfig()
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

	test("posso accedere all'endpoint?", async () => {

		// creo un agent nuovo
		const agent1 = await axiosIstance.post(`/api/agents`, {
			name: "name",
			description: "description",
			systemPrompt: "systemPrompt",
			contextPrompt: "contextPrompt",
			askInformation: false,
			killOnResponse: true,
			agents: [],
			tools: []
		})
		expect(agent1.status).toBe(200)
		expect(agent1.data).toHaveProperty("id")

		// creo un altro agente
		const agent2 = await axiosIstance.post(`/api/agents`, {
			name: "name2",
			description: "description2",
			systemPrompt: "systemPrompt2",
			contextPrompt: "contextPrompt2",
			askInformation: false,
			killOnResponse: true,
			agents: [],
			tools: []
		})
		expect(agent2.status).toBe(200)
		expect(agent2.data).toHaveProperty("id")

		// recupero gli agenti
		const allAgents = await axiosIstance.get(`/api/agents`)
		expect(allAgents.status).toBe(200)
		expect(allAgents.data?.length).toBe(2)

		// recupero un agente
		const agent1_ = await axiosIstance.get(`/api/agents/${agent1.data.id}`)
		expect(agent1_.status).toBe(200)
		expect(agent1_.data).toHaveProperty("id")

		// aggiorno l'agente
		const agentUpdate = await axiosIstance.patch(`/api/agents/${agent1.data.id}`, {
			name: "name3",
			description: "description3",
		})
		expect(agentUpdate.status).toBe(200)

		// cancello l'agente
		const agentDelete = await axiosIstance.delete(`/api/agents/${agent1.data.id}`)
		expect(agentDelete.status).toBe(200)

	}, 100000)

	test("can create an agent with relationships to Llm, Tool, and other Agents", async () => {
		let llmId: string | null = null;
		let toolId: string | null = null;
		let childAgentId: string | null = null;
		let parentAgentId: string | null = null;


		// 1. Create an Llm
		const llmPayload = { name: "Test LLM", key: "test-key" };
		const llmRes = await axiosIstance.post(`/api/llm`, { llm: llmPayload });
		expect(llmRes.status).toBe(200);
		expect(llmRes.data).toHaveProperty("id");
		llmId = llmRes.data.id;

		// 2. Create a Tool
		const toolPayload = { name: "Test Tool", description: "A tool for testing" };
		const toolRes = await axiosIstance.post(`/api/tools`, { tool: toolPayload });
		expect(toolRes.status).toBe(200);
		expect(toolRes.data).toHaveProperty("id");
		toolId = toolRes.data.id;

		// 3. Create a child Agent
		const childAgentPayload = {
			name: "Child Agent",
			description: "A child agent for testing relationships",
			systemPrompt: "Child system prompt",
			contextPrompt: "Child context prompt",
			askInformation: false,
			killOnResponse: true,
		};
		const childAgentRes = await axiosIstance.post(`/api/agents`, {agent: childAgentPayload});
		expect(childAgentRes.status).toBe(200);
		expect(childAgentRes.data).toHaveProperty("id");
		childAgentId = childAgentRes.data.id;

		// 4. Create a parent Agent with relationships
		const parentAgentPayload = {
			name: "Parent Agent",
			description: "A parent agent with relationships",
			systemPrompt: "Parent system prompt",
			contextPrompt: "Parent context prompt",
			askInformation: false,
			killOnResponse: true,
			llm: { id: llmId },
			tools: [{ id: toolId }],
			agents: [{ id: childAgentId }],
		};
		const parentAgentRes = await axiosIstance.post(`/api/agents`, {agent: parentAgentPayload});
		expect(parentAgentRes.status).toBe(200);
		expect(parentAgentRes.data).toHaveProperty("id");
		parentAgentId = parentAgentRes.data.id;

		// 5. Fetch the parent Agent and verify relationships
		const fetchedAgentRes = await axiosIstance.get(`/api/agents/${parentAgentId}?relations=llm,tools,agents`);
		expect(fetchedAgentRes.status).toBe(200);
		const fetchedAgent = fetchedAgentRes.data;

		// Verify Llm relationship
		expect(fetchedAgent.llm).toBeDefined();
		expect(fetchedAgent.llm.id).toBe(llmId);

		// Verify Tool relationship
		expect(fetchedAgent.tools).toBeDefined();
		expect(fetchedAgent.tools.length).toBe(1);
		expect(fetchedAgent.tools[0].id).toBe(toolId);

		// Verify child Agent relationship
		expect(fetchedAgent.agents).toBeDefined();
		expect(fetchedAgent.agents.length).toBe(1);
		expect(fetchedAgent.agents[0].id).toBe(childAgentId);


	}, 100000);

})