import { McpServerDetailStore } from "@/stores/stacks/mcpServer/detail"
import { buildMcpToolDetail } from "@/stores/stacks/mcpTool/factory"
import { EDIT_STATE } from "@/types"
import { TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
    store: McpServerDetailStore
}

/**
 * dettaglio di una CONNECTION
 */
const McpServerDetailForm: FunctionComponent<Props> = ({
    store,
}) => {

    // STORE
    useStore(store)

    // HOOKs

    // HANDLER
    const handlePropChange = (prop: {
        [name: string]: any
    }) => store.setMcpServer({ ...store.state.mcpServer, ...prop })

    const handleOpenTool = (tool: any) => {
        store.openTool(tool)
    }


    // RENDER
    const mcpServer = store.getMcpServer()
    if (mcpServer == null) return null
    const name = mcpServer.name ?? ""
    const host = mcpServer.host ?? ""
    const inRead = store.state.editState == EDIT_STATE.READ
    const inNew = store.state.editState == EDIT_STATE.NEW
    const tools = mcpServer.tools ?? []

    return <div className="jack-lyt-form var-dialog">

        <div className="lyt-v">
            <div className="jack-lbl-prop">NAME</div>
            <TextInput autoFocus
                value={name}
                onChange={name => handlePropChange({ name })}
                readOnly={inRead}
            />
        </div>

        <div className="lyt-v">
            <div className="jack-lbl-prop">HOST</div>
            <TextInput
                value={host}
                onChange={host => handlePropChange({ host })}
                readOnly={inRead}
            />
        </div>

        TOOLS

        {tools.map(tool => (
            <div key={tool.name}
                onClick={() => handleOpenTool(tool)}
            >
                <span>{tool.name} {tool.description}</span>
            </div>
        ))}



    </div>
}

export default McpServerDetailForm
