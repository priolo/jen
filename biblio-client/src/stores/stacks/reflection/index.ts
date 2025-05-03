import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import reflectionService from "../../../plugins/reflection"
import { nodeByPath } from "../../../plugins/reflection/utils"
import { ViewState } from "../viewBase"
import { NodeStruct } from "./types"



export interface NodeView {
    expanded: boolean
}

export type ActionPayload = { [action: string]: { value: string, type: string } }



const setup = {

    state: {

        path: "",
        nodesState: <{ [id: string]: NodeView }>{},
        selectedId: <string>null,
        actionsPayload: <ActionPayload>{},

        //#region VIEWBASE

        //#endregion
    },

    getters: {
        //#region VIEWBASE
        getTitle: (_: void, store?: ViewStore) => `REF: ${(<ReflectionStore>store).getNode()?.name}`,
        getSubTitle: (_: void, store?: ViewStore) => (<ReflectionStore>store).getNode()?.path,
        getSerialization: (_: void, store?: ViewStore) => {
            const state = store.state as ReflectionState
            return {
                ...viewSetup.getters.getSerialization(null, store),
            }
        },
        //#endregion

        getNode: (_: void, store?: ReflectionStore): NodeStruct => {
            return nodeByPath(reflectionService.root, store.state.path)
        },
        getConnectionState: (_: void, store?: ReflectionStore) => {
            return reflectionService.ws?.websocket?.readyState
        }
    },

    actions: {

        //#region VIEWBASE
        setSerialization: (data: any, store?: ViewStore) => {
            viewSetup.actions.setSerialization(data, store)
        },
        //#endregion

        async fetch(_: void, store?: ReflectionStore) {
            // const root = await reflectionService.fetch()
            // store.setRoot(root)
        },

        async fetchIfVoid(_: void, store?: ReflectionStore) {
            //store.setRoot(NodeTest)
            //reflectionService.emitter.on( "root", store.onRootChange)
            //if (!!store.state.root) return
            //await store.fetch()
        },


        toggleNode(id: string, store?: ReflectionStore) {
            const nodesState = { ...store.state.nodesState }
            nodesState[id] = { expanded: !nodesState[id]?.expanded }
            store.setNodesState(nodesState)
        },

        async onCreated(_: void, store?: ReflectionStore) {
            await reflectionService.sendGetStruct()
            store._update()
            reflectionService.emitter.on("root", () => {
			    if ( !store.getNode() ) {
                    store.onRemoveFromDeck()
                    return
                }
                store._update()
            })
            reflectionService.emitter.on("connection", () => {
                store._update()
            })
        },

        async sendAction(action: string, store?: ReflectionStore) {
            const actionPayload = store.state.actionsPayload[action]
            const payload = actionPayload?.value == null ? null
                : actionPayload.type === "json" ? JSON.parse(actionPayload.value)
                    : actionPayload.value
            const res = await reflectionService.sendAction(store.state.path, action, payload)
        }

    },

    mutators: {
        setPath: (path: string) => ({ path }),
        setNodesState: (nodesState: { [id: string]: { expanded: boolean } }) => ({ nodesState }),
        setSelectedId: (selectedId: string) => ({ selectedId }),
        setActionsPayload: (actionsPayload: ActionPayload) => ({ actionsPayload }),
    },
}

export type ReflectionState = typeof setup.state & ViewState
export type ReflectionGetters = typeof setup.getters
export type ReflectionActions = typeof setup.actions
export type ReflectionMutators = typeof setup.mutators
export interface ReflectionStore extends ViewStore, ReflectionGetters, ReflectionActions, ReflectionMutators {
    state: ReflectionState
    onCreated(_: void, store?: ReflectionStore): Promise<void>
}
const reflectionSetup = mixStores(viewSetup, setup)
export default reflectionSetup


const NodeTest = {
    "type": "s-ref:state",
    "payload": {
        "id": "m5k2740j.rd88k",
        "name": "root",
        "class": "RootService",
        "state": {
            "name": "root",
            "onLog": null
        },
        "commands": [
            "init",
            "destroy"
        ],
        "children": [
            {
                "id": "m5k2740j.o5eea",
                "name": "farm",
                "class": "FarmService",
                "children": []
            },
            {
                "id": "m5k2740r.kv2kg",
                "name": "node",
                "class": "LogService",
                "state": {
                    "name": null,
                    "onLog": null,
                    "levels": null
                },
                "commands": [
                    "init",
                    "destroy"
                ],
                "children": []
            },
            {
                "id": "m5k2740u.mot0v",
                "name": "http",
                "class": "HttpService",
                "state": {
                    "name": "http",
                    "onLog": null,
                    "port": 3000,
                    "render": null,
                    "options": null,
                    "https": null
                },
                "commands": [
                    "init",
                    "destroy"
                ],
                "children": [
                    {
                        "id": "m5k2740x.ggyxe",
                        "name": "ws-server",
                        "class": "SocketServerService",
                        "state": {
                            "name": "ws-server",
                            "onLog": null,
                            "autostart": true,
                            "port": null,
                            "jwt": null,
                            "clients": [
                                {
                                    "remoteAddress": "::1",
                                    "remotePort": 53742,
                                    "params": {}
                                }
                            ],
                            "onAuth": null
                        },
                        "commands": [
                            "init",
                            "destroy",
                            "ws:send",
                            "ws:broadcast",
                            "ws:disconnect",
                            "ws:start",
                            "ws:stop"
                        ],
                        "children": [
                            {
                                "id": "m5k2740x.11cyk",
                                "name": "ws-reflection",
                                "class": "WSReflectionService",
                                "state": {
                                    "name": "ws-reflection",
                                    "onLog": null
                                },
                                "commands": [
                                    "init",
                                    "destroy",
                                    "ws:send",
                                    "ws:broadcast",
                                    "ws:disconnect"
                                ],
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    }
}