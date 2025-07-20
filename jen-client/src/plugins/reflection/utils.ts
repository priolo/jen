import { NodeStruct } from "../../stores/stacks/reflection/types";



/**
 *  Find a node in a tree structure by its path.
 * @param root  The root node of the tree.
 * @param path  The path to the node, separated by slashes.
 * @returns   The node at the given path, or null if not found.
 */
export function nodeByPath(root: NodeStruct, path: string): NodeStruct | null {
	// if (!root) return null;
	// if (!path || path.length == 0) return root;
	// if (path.startsWith('/')) path = path.slice(1)

	// const names = path.split("/");
	// let node = root;

	// for (const name of names) {
	// 	if (!node || !node.children) return null;
	// 	node = node.children.find(n => n.name === name);
	// 	if (!node) return null;
	// }

	// return node;

	const chain = chainByPath(root, path);
	return chain.length > 0 ? chain[chain.length - 1] : null;
}

export function chainByPath(root: NodeStruct, path: string): NodeStruct[] {
	if (!root) return [];
	if (!path || path.length == 0) return [root];
	if (path.startsWith('/')) path = path.slice(1)

	const names = path.split("/");
	const ret:NodeStruct[] = [root];
	let node = root;

	for (const name of names) {
		node = node.children?.find(n => n.name == name)
		if (!node || !node.children) return []
		ret.push(node)
	}

	return ret;
}

/**
 *  Find a node in a tree structure by its path.
 * @param root  The root node of the tree.
 * @param callback  The callback to be called for each node.
 * @param path  The path to the node, separated by slashes.
 * @returns  The node at the given path, or null if not found.
 */
export function forEachNode(root: NodeStruct, callback: (node: NodeStruct, path?: string) => boolean, path: string = ""): boolean {
	if (callback(root, path) === false) return false
	if (!root.children) return true
	for (const child of root.children) {
		const rest = forEachNode(child, callback, path + '/' + child.name);
		if (rest === false) return false
	}
	return true
}

/**
 *  Find a node in a tree structure by its id.
 * @param root  The root node of the tree.
 * @param id  The id of the node.
 * @returns  The node with the given id, or null if not found.
 */
export function nodeById(root: NodeStruct, id: string): NodeStruct | null {
	let finded: NodeStruct = null
	forEachNode(root, (node) => {
		if (node.id === id) {
			finded = node;
			return false;
		}
	});
	return finded
}

/**
 * percorre tutti i nodi partendo da root e aggiorna il path di ogni nodo
 */
export function updatePath(root: NodeStruct): NodeStruct {
	forEachNode(root, (node, path) => {
		node.path = path;
		return true;
	});
	return root
}