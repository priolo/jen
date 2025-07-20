import { LlmDetailStore } from "@/stores/stacks/llm/detail"
import { EDIT_STATE } from "@/types"
import { PROVIDER } from "@/types/Llm"
import { ListDialog, StringUpRow, TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
    store: LlmDetailStore
}

/**
 * dettaglio di una CONNECTION
 */
const LlmDetailForm: FunctionComponent<Props> = ({
    store,
}) => {

    // STORE
    useStore(store)

    // HOOKs

    // HANDLER
    const handlePropChange = (prop: {
        [name: string]: any
    }) => store.setLlm({ ...store.state.llm, ...prop })


    // RENDER
    const llm = store.state.llm
    if (llm == null) return null
    const name = llm.name ?? ""
    const key = llm.key ?? ""
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

        <div className="lyt-v">
            <div className="jack-lbl-prop">PROVIDER</div>
            <ListDialog width={80}
                store={store}
                select={Object.values(PROVIDER).indexOf(llm.provider ?? PROVIDER.OPENAI)}
                items={Object.values(PROVIDER)}
                RenderRow={StringUpRow}
                readOnly={inRead}
                onSelect={index => handlePropChange({ provider: Object.values(PROVIDER)[index] })}
            />
        </div>

        <div className="lyt-v">
            <div className="jack-lbl-prop">API-KEY</div>
            <TextInput
                value={key}
                onChange={key => handlePropChange({ key })}
                readOnly={inRead}
            />
        </div>

    </div>
}

export default LlmDetailForm
