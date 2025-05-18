
import { RootService } from "@priolo/julian";
import buildNodeConfig, { PORT } from "../config"
import axios, { AxiosInstance } from "axios"


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

})