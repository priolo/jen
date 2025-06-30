import { Agent } from "@/repository/Agent.js"



export function complete( room: Room): Response {
	const history = room.history.map(m => {
		//...
	})

	const executor = new AgentExecutor({
		agents: room.agent,
		history,
	})

	const responde = await executor.ask()
	
}

