import { REPO_PATHS, SERVICE_PATHS } from "@/config.js";
import { RoomRepo } from "@/repository/Room.js";
import { AccountDTOFromAccountRepo, AccountDTOFromAccountRepoList, JWTPayload } from '@/repository/Account.js';
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { FindManyOptions, FindOneOptions, In } from "typeorm";
import { AccountRepo } from "../repository/Account.js";
import { ChatDTOListFromChatRepoList, ChatRepo } from "../repository/Chat.js";
import { ChatsWSService } from "./ChatsWSRoute.js";
import { CHAT_ACTION_S2C, ChatUpdateS2C2 } from "@shared/types/ChatActionsServer.js";
import { TYPE_JSON_COMMAND } from "@shared/update.js";



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
				{ path: "/:id/invite", verb: "post", method: "partecipant_invite" },
				{ path: "/:id/remove", verb: "post", method: "partecipant_remove" },
			]
		}
	}
	declare state: typeof this.stateDefault

	async getAll(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })

		// prendo tutte le CHATs dove sono PARTECIPANTE o PROPRIETARIO o PUBBLICA
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

		// recupero le CHATS
		const chats: ChatRepo[] = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<ChatRepo>>{
				where: { id: In(ids) },
				relations: { users: true }
			}
		})

		res.json(ChatDTOListFromChatRepoList(chats))
	}

	async getById(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })
		const chatId = req.params["id"]

		const service = this.nodeByPath<ChatsWSService>(SERVICE_PATHS.CHATS_WS)
		const chatProxy = await service.chatManager.loadChatById(chatId)

		res.json(chatProxy.chatRepo)
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

	async partecipant_invite(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })

		// prendo i parametri
		const chatId = req.params["id"]
		const { userId } = req.body
		if (!userId) return res.status(400).json({ error: "userId is required" })

		// carico lo USER
		const user: AccountRepo = await new Bus(this, REPO_PATHS.ACCOUNTS).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: userId,
		})
		if (!user) return res.status(404).json({ error: "User not found" })

		// carico la CHAT
		const chat: ChatRepo = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: <FindOneOptions<ChatRepo>>{
				where: { id: chatId },
				relations: { users: true }
			}
		})
		if (!chat) return res.status(404).json({ error: "Chat not found" })

		// se la CHAT non l'ho fatta io non posso invitare altri
		if (chat.accountId != userJwt.id) return res.status(403).json({ error: "Forbidden" })

		// aggiungo lo USER se non è già presente
		if (!chat.users.find(u => u.id == userId)) {
			chat.users.push({ id: userId } as AccountRepo)
			await new Bus(this, REPO_PATHS.CHATS).dispatch({
				type: typeorm.Actions.SAVE,
				payload: chat
			})
		}
		res.json(chat)



		// avviso il WS della CHAT
		const chatsWS = this.nodeByPath<ChatsWSService>(SERVICE_PATHS.CHATS_WS)
		const chatProxy = chatsWS.chatManager.getChatById(chat.id)
		const userDTO = AccountDTOFromAccountRepo(user)
		chatProxy.sendMessage(<ChatUpdateS2C2>{
			action: CHAT_ACTION_S2C.CHAT_UPDATE2,
			chatId: chat.id,
			commands: [
				{
					type: TYPE_JSON_COMMAND.MERGE,
					path: "users",
					value: userDTO,
				}
			]
		})
		chat.users.push(userDTO)
	}

	async partecipant_remove(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })

		// prendo i parametri
		const chatId = req.params["id"]
		const { userId } = req.body
		if (!userId) return res.status(400).json({ error: "userId is required" })

		// carico la CHAT
		const chat: ChatRepo = await new Bus(this, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: <FindOneOptions<ChatRepo>>{
				where: { id: chatId },
				relations: { users: true }
			}
		})
		if (!chat) return res.status(404).json({ error: "Chat not found" })
		// se la CHAT non l'ho fatta io non posso invitare altri
		if (chat.accountId != userJwt.id) return res.status(403).json({ error: "Forbidden" })

		// rimuovo lo USER se è presente e salvo in DB
		if (chat.users.find(u => u.id == userId)) {
			chat.users = chat.users.filter(u => u.id != userId)
			await new Bus(this, REPO_PATHS.CHATS).dispatch({
				type: typeorm.Actions.SAVE,
				payload: chat
			})
		}
		res.json(chat)



		// avviso il WS della CHAT
		const chatsWS = this.nodeByPath<ChatsWSService>(SERVICE_PATHS.CHATS_WS)
		const chatProxy = chatsWS.chatManager.getChatById(chat.id)
		chatProxy.sendMessage(<ChatUpdateS2C2>{
			action: CHAT_ACTION_S2C.CHAT_UPDATE2,
			chatId: chat.id,
			commands: [
				{
					type: TYPE_JSON_COMMAND.DELETE,
					path: `users.{"id":"${userId}"}`,
				}
			]
		})
		chat.users = chat.users.filter(u => u.id != userId)

		// rimuovo dalla sessione (se presente) e notifico (CLIENT_LEAVE)
		chatProxy.removeUser(userId)
	}



}

export default ChatRoute
