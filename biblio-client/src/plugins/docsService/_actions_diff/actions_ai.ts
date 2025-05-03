import { generateUUID } from "../../../../utils/object";

/** l'informazione da trasformare */
export interface NodeType {
    id?: string;
    value?: string;
}

/** tipo di azione da compiere */
export enum ACTION_VERB {
    ADD,
    MODIFY,
    MOVE,
    DELETE,
}

/** un Action di trasformazione */
export interface Action {
    verb: ACTION_VERB;
    node?: NodeType;
    position: number;
}

/** restituisce un array di Action che indicano come trasformare doc1 in doc2 */
export function getActionsFromDocDiff(doc1: NodeType[], doc2: NodeType[]): Action[] {
    const actions: Action[] = [];

    // Mappa per trovare i nodi per id
    const nodeMap1 = new Map(doc1.map(node => [node.id, node]));
    const nodeMap2 = new Map(doc2.map(node => [node.id, node]));

    let i1 = 0;
    let i2 = 0;

    while (i1 < doc1.length || i2 < doc2.length) {
        const node1 = doc1[i1];
        const node2 = doc2[i2];

        if (!node1 && node2) {
            // Node2 è nuovo in doc2
            actions.push({
                verb: ACTION_VERB.ADD,
                node: node2,
                position: i2,
            });
            i2++;
        } else if (node1 && !node2) {
            // Node1 non esiste in doc2
            actions.push({
                verb: ACTION_VERB.DELETE,
                position: i1,
            });
            i1++;
        } else if (node1 && node2 && node1.id === node2.id) {
            if (!isNodeEq(node1, node2)) {
                actions.push({
                    verb: ACTION_VERB.MODIFY,
                    node: node2,
                    position: i2,
                });
            }
            i1++;
            i2++;
        } else if (node1 && node2 && nodeMap2.has(node1.id) && nodeMap1.has(node2.id)) {
            actions.push({
                verb: ACTION_VERB.DELETE,
                position: i1,
            });
            doc1.splice(i1, 1);
        } else if (node2 && nodeMap1.has(node2.id)) {
            actions.push({
                verb: ACTION_VERB.ADD,
                node: node2,
                position: i2,
            });
            i2++;
        } else {
            actions.push({
                verb: ACTION_VERB.DELETE,
                position: i1,
            });
            i1++;
        }
    }

    return actions;
}

/** esegue un Action su una serie di Node */
function exeAction(nodes: NodeType[], action: Action) {
    switch (action.verb) {
        case ACTION_VERB.ADD:
            nodes.splice(action.position, 0, action.node);
            break;
        case ACTION_VERB.DELETE:
            nodes.splice(action.position, 1);
            break;
        case ACTION_VERB.MODIFY:
            nodes[action.position] = action.node;
            break;
        case ACTION_VERB.MOVE:
            const index = nodes.findIndex(n => n.id === action.node.id);
            if (index !== -1) {
                const [node] = nodes.splice(index, 1);
                nodes.splice(action.position, 0, node);
            }
            break;
    }
}

/** indica se due Node sono uguali */
function isNodeEq(node1: NodeType, node2: NodeType): boolean {
    return node1.value === node2.value;
}
