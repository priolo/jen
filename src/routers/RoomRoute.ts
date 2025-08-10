import { RoomRepo } from "@/repository/Room.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";



class RoomRoute extends httpRouter.Service {

	get stateDefault(): httpRouter.conf & any {
		return {
			...super.stateDefault,
			path: "/rooms",
			repository: "/typeorm/rooms",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "delete", method: "delete" },
			]
		}
	}

	async getAll(req: Request, res: Response) {
		const rooms = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.ALL
		})
		res.json(rooms)
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const room: RoomRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: id
		})
		res.json(room)
	}

	async create(req: Request, res: Response) {
		const { room }: { room: RoomRepo } = req.body
		const roomNew: RoomRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: room
		})
		res.json(roomNew)
	}

	async delete(req: Request, res: Response) {
		const id = req.params["id"]
		await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.DELETE,
			payload: id
		})
		res.json({ data: "ok" })
	}

	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const { room }: { room: RoomRepo } = req.body
		if (!id || !room) return
		const roomUp = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: room,
		})
		res.json(roomUp)
	}
}

export default RoomRoute


