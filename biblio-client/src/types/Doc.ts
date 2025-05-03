import { BaseOperation } from "slate"
import { NodeType } from "../stores/stacks/editor/slate/types"
import { User } from "./User"



/** è un dcumento con il suo contenuto */
export interface Doc {
	id:string
	author: string
	updateAt: number
	title: string
	children: NodeType[]
}

/** aggiornamenti ricevuto/da inviare al BE*/
export interface RemoteDoc {
	status: DOC_STATUS
	doc: Partial<Doc>
	buffIn: BaseOperation[]
	buffOut: BaseOperation[]
}

/** filtro richiesto per una lista di docs */
export interface FilterDoc {
	author: User,
}

export enum DOC_STATUS {
	/** il DOC è stato appena creato localmente */
	LOCAL,
	/** il DOC è stato modificto localmente rispetto al remoto */
	MODIFY,
	/** il DOC è localmente uguale al remoto */
	SYNC,
}
