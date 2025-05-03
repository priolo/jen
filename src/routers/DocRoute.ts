import { Request, Response } from "express"
import { BaseOperation, createEditor, Descendant, withoutNormalizing } from "slate"
import { Bus, RepoRestActions, httpRouter } from "typexpress"
import { Doc } from "../repository/Doc.js"
import { Editor, Transforms } from "slate";



export default class DocRoute extends httpRouter.Service {

	get stateDefault(): httpRouter.conf & any {
		return {
			...super.stateDefault,
			path: "/docs",
			repository: "/typeorm/docs",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "delete", method: "delete" },
				{ path: "/:id", verb: "patch", method: "update" }
			]
		}
	}

	async getAll(req: Request, res: Response) {
		const docs = await new Bus(this, this.state.repository).dispatch({
			type: RepoRestActions.ALL
		})
		res.json(docs)
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const docDB:Doc = await new Bus(this, this.state.repository).dispatch({
			type: RepoRestActions.GET_BY_ID,
			payload: id
		})
		res.json({ data: docDB })
	}

	async create(req: Request, res: Response) {
		const body: { doc: Doc } = req.body
		const docDB: Doc = await new Bus(this, this.state.repository).dispatch({
			type: RepoRestActions.SAVE,
			payload: body.doc,
		})
		// i children non servono
		res.json({ data: "ok" })
	}

	async delete(req: Request, res: Response) {
		const id = req.params["id"]
		await new Bus(this, this.state.repository).dispatch({
			type: RepoRestActions.DELETE,
			payload: id
		})
		res.json({ data: "ok" })
	}

	/** 
	 * aggiorna un DOC tramite un array di ACTIONS
	 */
	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const body: { actions: BaseOperation[] } = req.body
		if (!id || !(body?.actions?.length > 0)) return

		// recupero il DOC interessato
		const doc: Doc = await new Bus(this, this.state.repository).dispatch({
			type: RepoRestActions.GET_BY_ID,
			payload: id
		})

		// applico le ACTIONS
		try {
			doc.children = applyOperations(body.actions, doc.children)
			await new Bus(this, this.state.repository).dispatch({
				type: RepoRestActions.SAVE,
				payload: doc,
			})
			// TODO: memorizzare le ACTIONS nella history
		} catch (e) {
			console.error(e)
			// restituire errore!
		}

		res.json({ data: "ok" })
	}
}



export function applyOperations(actions: BaseOperation[], initialValue: Descendant[]): Descendant[] {
	const editor = createEditor();
	editor.children = initialValue;
	withoutNormalizing(editor, () => {
		actions.forEach(op => {
			if (op.type === 'set_selection' && !editor.selection) {
                // Imposta una selezione di default se non c'è una selezione corrente
                Transforms.select(editor, { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } });
            }
			editor.apply(op);
		})
	})
	return editor.children;
}