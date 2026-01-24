import { REPO_PATHS } from "@/config.js";
import { ChatRepo } from "../repository/Chat.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { JWTPayload } from "@/types/account.js";
import { FindManyOptions } from "typeorm";


class ChatRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/chats",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "delete", method: "delete" },
				{ path: "/:id", verb: "put", method: "update" },
			]
		}
	}
	declare state: typeof this.stateDefault

	async getAll(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]

		const chats = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<ChatRepo>>{
				where: [
					{ accountId: userJwt.id },
					{ accountId: null }
				],
			}
		})
		res.json(chats)
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const chat: ChatRepo = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: id
		})
		res.json(chat)
	}

	async create(req: Request, res: Response) {
		const { chat }: { chat: ChatRepo } = req.body
		const chatNew: ChatRepo = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: chat
		})
		res.json(chatNew)
	}

	async delete(req: Request, res: Response) {
		const id = req.params["id"]
		await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.DELETE,
			payload: id
		})
		res.json({ data: "ok" })
	}

	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const { chat }: { chat: ChatRepo } = req.body
		if (!id || !chat) return
		const chatUp = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: chat,
		})
		res.json(chatUp)
	}

}

export default ChatRoute
