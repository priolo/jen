import { REPO_PATHS, SERVICE_PATHS } from "@/config.js";
import { RoomRepo } from "../repository/Room.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { ChatsWSService } from "./ChatsWSRoute.js";
import { FindManyOptions } from "typeorm";
import { AgentDTOFromAgentRepoList, AgentRepo } from "@/repository/Agent.js";



class RoomRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/rooms",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "delete", method: "delete" },

				{ path: "/:id/agents", verb: "get", method: "getAgents" },
			]
		}
	}
	declare state: typeof this.stateDefault

	async getAll(req: Request, res: Response) {
		const rooms = await new Bus(this, REPO_PATHS.ROOMS).dispatch({
			type: typeorm.Actions.ALL
		})
		res.json(rooms)
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		// verifico che non ci sia gia' in MEM
		const chatWS = this.nodeByPath<ChatsWSService>(SERVICE_PATHS.CHATS_WS)
		let room = chatWS?.chatManager.getChatById(id)

		// const room: RoomRepo = await new Bus(this, this.state.repository).dispatch({
		// 	type: typeorm.Actions.GET_BY_ID,
		// 	payload: id
		// })
		res.json(room)
	}

	async create(req: Request, res: Response) {
		const { room }: { room: RoomRepo } = req.body
		const roomNew: RoomRepo = await new Bus(this, REPO_PATHS.ROOMS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: room
		})
		res.json(roomNew)
	}

	async delete(req: Request, res: Response) {
		const id = req.params["id"]
		await new Bus(this, REPO_PATHS.ROOMS).dispatch({
			type: typeorm.Actions.DELETE,
			payload: id
		})
		res.json({ data: "ok" })
	}

	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const { room }: { room: RoomRepo } = req.body
		if (!id || !room) return
		const roomUp = await new Bus(this, REPO_PATHS.ROOMS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: room,
		})
		res.json(roomUp)
	}

	async getAgents(req: Request, res: Response) {
		const roomId = req.params["id"]
		if (!roomId) return res.status(400).json({ error: "Bad Request" })

		const agents: AgentRepo[] = await new Bus(this, REPO_PATHS.AGENTS).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<AgentRepo>>{
				where: {
					rooms: { id: roomId }
				}
			}
		})
		
		const agentsDTO = AgentDTOFromAgentRepoList(agents)
		res.json(agentsDTO)
	}

}

export default RoomRoute


