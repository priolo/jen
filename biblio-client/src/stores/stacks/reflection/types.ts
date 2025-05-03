
export interface NodeStruct {
	id: string
	name: string
	class?: string
	state?: any
	commands?: string[]
	children?: NodeStruct[]

	path?: string
}

//Tuca_duca34