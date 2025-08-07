import mcpServerSo from "@/stores/stacks/mcpServer/repo"
import { ToolDetailStore } from "@/stores/stacks/tool/detail"
import { EDIT_STATE } from "@/types"
import { McpServer } from "@/types/McpServer"
import { ListDialog2, TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
    store: ToolDetailStore
}

/**
 * dettaglio di una CONNECTION
 */
const ToolDetailForm: FunctionComponent<Props> = ({
    store,
}) => {

    // STORE
    useStore(store)

    // HOOKs

    // HANDLER
    const handlePropChange = (prop: {
        [name: string]: any
    }) => store.setTool({ ...store.state.tool, ...prop })

    const handleMcpChange = (mcpId: string) => {
        const mcp = mcpServerSo.getById(mcpId)
        if (mcp) {
            store.setTool({ ...store.state.tool, mcpId: mcp.id })
        }
    }


    // RENDER
    const tool = store.state.tool
    if (tool == null) return null
    const name = tool.name ?? ""
    const mcpServers = mcpServerSo.state.all

    const inRead = store.state.editState == EDIT_STATE.READ
    const inNew = store.state.editState == EDIT_STATE.NEW

    return <div className="jack-lyt-form var-dialog">

        <div className="lyt-v">
            <div className="jack-lbl-prop">MCP</div>
            <ListDialog2
                store={store}
                select={tool.mcpId}
                items={mcpServers}
                readOnly={inRead}
                fnGetId={(mcp: McpServer) => mcp.id}
                fnGetString={(mcp: McpServer) => mcp?.name}
                onChangeSelect={handleMcpChange}
            />
        </div>

        <div className="lyt-v">
            <div className="jack-lbl-prop">NAME</div>
            <TextInput autoFocus
                value={name}
                onChange={name => handlePropChange({ name })}
                readOnly={inRead}
            />
        </div>

    </div>
}

export default ToolDetailForm
