import { REPO_PATHS } from "@/config.js";
import { RoomRepo } from "@/repository/Room.js";
import { GetAccountDTOList, JWTPayload } from "@/types/account.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { FindManyOptions, FindOneOptions, In } from "typeorm";
import { ChatRepo } from "../repository/Chat.js";



class ChatRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/chats",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "patch", method: "update" },
				{ path: "/:id", verb: "delete", method: "delete" },
			]
		}
	}
	declare state: typeof this.stateDefault

	async getAll(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })

		const chatsIds: ChatRepo[] = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<ChatRepo>>{
				select: { id: true },
				where: [
					{ accountId: userJwt.id },
					{ accountId: null },
					{ users: { id: userJwt.id } }
				],
			}
		})
		if (!chatsIds || chatsIds.length == 0) return res.json([])
		const ids = chatsIds.map(chat => chat.id)

		const chats: ChatRepo[] = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<ChatRepo>>{
				where: { id: In(ids) },
				relations: { users: true }
			}
		})

		chats.forEach(chat => chat.users = GetAccountDTOList(chat.users))
		res.json(chats)
	}

	async getById(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })

		const id = req.params["id"]
		const chat: ChatRepo = await this.getByIdInternal(id, userJwt.id)
		res.json(chat)
	}
	private async getByIdInternal(chatId: string, userId: string): Promise<ChatRepo> {
		const chat: ChatRepo = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: <FindOneOptions<ChatRepo>>{
				where: [
					{ id: chatId, accountId: userId },
					{ id: chatId, accountId: null }
				],
			}
		})
		return chat
	}

	async create(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })
		const { chat }: { chat: ChatRepo } = req.body

		// 1. SAVE CHAT (to have an ID for the ROOM)
		const chatNew: ChatRepo = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: {
				accountId: userJwt.id,
				...chat,
			} as ChatRepo
		})

		// 2. SAVE ROOM (with the chatId)
		const roomNew: RoomRepo = await new Bus(this, REPO_PATHS.ROOMS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: {
				chatId: chatNew.id,
				accountId: userJwt.id,
			} as RoomRepo
		})

		// 3. UPDATE CHAT (with the mainRoomId)
		chatNew.mainRoomId = roomNew.id
		await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: chatNew
		})

		chatNew.rooms = [roomNew]

		res.json(chatNew)
	}

	async update(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })

		const id = req.params["id"]
		const { chat }: { chat: ChatRepo } = req.body
		if (!id || !chat) return

		const chatUp = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: chat,
		})
		res.json(chatUp)
	}

	async delete(req: Request, res: Response) {
		const id = req.params["id"]
		await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.DELETE,
			payload: id
		})
		res.json({ data: "ok" })
	}
}

export default ChatRoute
