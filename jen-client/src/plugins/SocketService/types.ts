
export interface SocketOptions {
    protocol?: string
    host?: string
    port?: number
    base?: string
    userId?: string
}

export enum SS_EVENT {
    /** cambia lo stato della connessione */
    CONNECTION = "connection",
    /** quando arriva un messaggio  */
    MESSAGE = "message",
    /** se c'e' un errore * */
    ERROR = "error",
}