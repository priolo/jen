import { generateUUID } from "../../../utils/object";

// da cancellare
/** riceve un Doc e ne estrapola le differenze cn quello presente nella "library" */
// export async function updateDoc(local: Partial<Doc>) {
// 	const remote = await fetchDoc(local.id)
// 	const actions = getActionsFromDocDiff(
// 		local.children as NodeType[],
// 		remote.doc.children,
// 		isNodeEq
// 	)
// 	console.log(actions)
// }

/** restituisce un array di Action ce indicano come trasformare doc1 in doc2 */
export function getActionsFromDocDiff(
	doc1: NodeWithId[], 
	doc2: NodeWithId[], 
	fnIsEq:(node1: NodeWithId, node2: NodeWithId) => boolean = isNodeEq
) {
	const actions: Action[] = []
	let action: Action = null
	let i1 = 0
	doc2 = [...doc2]

	for (i1 = 0; i1 < doc1.length;) {
		let node1 = {...(doc1[i1])}
		let node2 = doc2[i1]
		action = null
		
		// è nuovo
		//if (!node1.id) node1.id = generateUUID()
	
		// trovo una corrispndenza
		if (node1.id == node2?.id) {
			if (!fnIsEq(node1, node2)) {
				action = {
					verb: ACTION_VERB.MODIFY,
					node: node1,
					position: i1,
				}
			}
			i1++

			// è un altra cosa
		} else {

			if (!!node2 && !doc1.some(n => n.id == node2.id)) {
				action = {
					verb: ACTION_VERB.DELETE,
					position: i1,
				}
			} else {
				// se in NODE "corrente" lo trovo piu' avanti in "precedente" allora lo sposto
				const index = doc2.findIndex(n => !!node1.id && n.id == node1.id)
				if (index != -1) {
					action = {
						verb: ACTION_VERB.MOVE,
						node: { id: doc2[index].id },
						position: i1,
					}
				} else {
					action = {
						verb: ACTION_VERB.ADD,
						node: node1,
						position: i1,
					}
					i1++
				}
			}
		}

		if (!action) continue
		actions.push(action)
		exeAction(doc2, action)
	}
	for (let i = i1; i < doc2.length; i++) {
		actions.push({
			verb: ACTION_VERB.DELETE,
			position: i,
		})
	}
	return actions
}

/** esegue un Action su una serie di Node */
function exeAction(nodes: NodeWithId[], action: Action) {
	switch (action.verb) {
		case ACTION_VERB.ADD:
			nodes.splice(action.position, 0, action.node)
			break;
		case ACTION_VERB.DELETE:
			nodes.splice(action.position, 1)

			break;
		case ACTION_VERB.MODIFY:
			nodes[action.position] = action.node
			break;
		case ACTION_VERB.MOVE:
			const index = nodes.findIndex(n => n.id == action.node.id)
			if (index == -1) break
			const node = nodes.splice(index, 1)?.[0]
			nodes.splice(action.position, 0, node)
			break;
	}
}

/** indica se due Node sono uguali */
function isNodeEq(node1: NodeWithId, node2: NodeWithId) {
	return node1["value"] == node2["value"]
}
/** tipo di azione da compiere */


export enum ACTION_VERB {
	ADD,
	MODIFY,
	MOVE,
	DELETE,
	TRIM
}/** l'informazione da trasformare */


export interface NodeWithId {
	id?: string
}
/** un Action di trasformazione */
export interface Action {
	verb: ACTION_VERB
	node?: NodeWithId
	position?: number
}

