
export interface ClientMessage {
    type: ClientMessageType
    payload: any
}
export interface ServerMessage {
    type: ServerMessageType
    payload: any
}
export interface ServerLogMessage extends ServerMessage{
    name: string
    source: string
}

/**
 * I tipi di messaggi che possono arrivare dal client
*/
export enum ClientMessageType {
    /**
     * Richiede l'albero dei nodi
     */
    GET_STRUCT = "ref-c:get-struct",
    /**
     * Esegue un'azione
     */
    EXECUTE_ACTION = "ref-c:execute-action",
}

export enum ServerMessageType {
    /**
     * Risponde con lo stato dell'albero
     */
    STRUCT = "ref-s:struct",
    /**
     * Risponde con l'esito dell'azione
     */
    ACTION_RESULT = "ref-s:action-result",
    /**
     * Notifica un LOG al client
     */
    LOG = "ref-s:log",
}

/**
 * Identifica lo specifico LOG che è stato creato
 */
export enum NamesLog {
	/** quando lo STATE del NODE cambia */
	STATE_CHANGED = "state:change",

	/** quando il NODE è inizializzato */
	NODE_INIT = "node:init",
	NODE_INIT_AFTER = "node:init-after",
	NODE_DELETED = "node:destroy",
	NODE_EXECUTE = "node:execute",

	/** [ERR] errore esecuzione di un ACTION */
	ERR_EXECUTE = "err:execute",
	ERR_INIT = "err:init",
	ERR_BUILD_CHILDREN = "err:build-children",
}
