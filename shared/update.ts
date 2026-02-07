
export enum TYPE_JSON_COMMAND {
	SET = "set",
	DELETE = "delete",
	MERGE = "merge",
}

export interface JsonCommand {
	type: TYPE_JSON_COMMAND
	path: string
	value?: any
}

export type Ref = { 
	parent: any, 
	key: string | number, 
	value: any 
}


/**
 * Applica un comando inplace a un oggetto JSON
 */
export function applyJsonCommand(json: any, command: JsonCommand): any {

	const ref = getRef(json, command.path)

	switch (command.type) {
		case TYPE_JSON_COMMAND.SET:
			ref.parent[ref.key] = command.value
			break;
		case TYPE_JSON_COMMAND.DELETE:
			if (Number.isInteger(ref.key)) {
				ref.parent.splice(ref.key, 1)
			} else if (command.value != undefined && Array.isArray(ref.value)) {
				ref.parent[ref.key] = ref.value.filter((v: any) => v !== command.value)
			} else {
				delete ref.parent[ref.key]
			}
			break;
		case TYPE_JSON_COMMAND.MERGE:
			if (Array.isArray(ref.value)) {
				ref.value.push(command.value)
			} else {
				ref.parent[ref.key] = { ...ref.value, ...command.value }
			}
			break;
	}
}


/** confronta deboolmente due oggetti, true se tutti i campi di conf sono presenti in value e con lo stesso valore */
const isWeakly = (value: any, conf: any) => Object.keys(conf).every(key => key in value && value[key] === conf[key])

/**
 * Normalizza il path per supportare anche array con indici dinamici o oggetti di ricerca
 */
function normalizePath(value: any, path: string): string | number {
	if (Array.isArray(value)) {
		const index = Number.parseInt(path)
		if (!isNaN(index)) return index
		if (path.startsWith("{") && path.endsWith("}")) {
			const toFind = JSON.parse(path)
			const index = value.findIndex((v) => isWeakly(v, toFind))
			return index
		}
	}
	return path
}

/**
 * resttuisce un riferimento al campo specificato dal path, supporta array con indici dinamici o oggetti di ricerca
 */
function getRef(json: any, path: string): Ref {
	const pathParts = path.split(".")

	let current: any = json
	for (let i = 0; i < pathParts.length - 1; i++) {
		const part = pathParts[i]
		const partNorm = normalizePath(current, part)
		if (partNorm == null || !(partNorm in current)) continue
		current = current[partNorm]
	}
	const lastPart = pathParts[pathParts.length - 1]
	const lastPartNorm = normalizePath(current, lastPart)
	return { parent: current, key: lastPartNorm, value: current[lastPartNorm] }
}



/**

const json = {
	name: "Jason",
	age: 30,
	mom: {
		name: "Jane",
		age: 55,
	},
	friends: ["Alice", "Bob", "Charlie"],
	docs: [
		{ id: 1, title: "primo" },
		{ id: 2, title: "secondo" },
		{ id: 3, title: "terzo" },
	]
}

const command: JsonCommand = {
	type: TYPE_JSON_COMMAND.DELETE,
	path: 'docs.0',
}

// const command: JsonCommand = {
// 	type: TYPE_JSON_COMMAND.SET,
// 	path: "friends.0",
// 	value: "Pippo",
// }

// const command: JsonCommand = {
// 	type: TYPE_JSON_COMMAND.MERGE,
// 	path: "friends",
// 	value: "Pippo",
// }

// const command: JsonCommand = {
// 	type: TYPE_JSON_COMMAND.SET,
// 	path: "mom.name",
// 	value: "Janet**",
// }

//console.log( normalizePath(["a", "b", "c"], "1") )
// console.log(normalizePath(
// 	[{ id: 1, name: "pippo" }, { id: 2, name: "pappo" }, { id: 3, name: "pallo" }],
// 	'{"id":1}'
// ))

const ref = getRef(json, command.path)
console.log(ref)
applyJsonCommand(json, command)
console.log(json)

*/