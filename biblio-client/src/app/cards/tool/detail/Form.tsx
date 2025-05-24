import { ToolDetailStore } from "@/stores/stacks/tool/detail"
import { EDIT_STATE } from "@/types"
import { TextInput } from "@priolo/jack"
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


    // RENDER
    const llm = store.state.tool
    if (llm == null) return null
    const name = llm.name ?? ""
    const inRead = store.state.editState == EDIT_STATE.READ
    const inNew = store.state.editState == EDIT_STATE.NEW

    return <div className="jack-lyt-form var-dialog">

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
