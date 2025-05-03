import { ENV_TYPE } from "../utils.js"
import { Bus, RepoStructActions } from "typexpress"


const route = process.env.NODE_ENV == ENV_TYPE.TEST ? {
	class: "http-router",
	path: "/debug",
	routers: [
		{
			path: "/reset", verb: "post", method: async function (req, res, next) {
				const {default:users} = await import("../tests/seed/users.js")

				await new Bus(this, "/typeorm/users").dispatch({
					type: RepoStructActions.SEED,
					payload: [
						{ type: RepoStructActions.TRUNCATE },
						[...users]
					]
				})
				res.json({ data: "debug:reset:ok" })
			}
		},
	]
} : null

export default route


