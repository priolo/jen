import { LlmDetailStore } from "@/stores/stacks/llm/detail"
import { EDIT_STATE } from "@/types"
import { LLM_MODELS } from "@/types/commons/LlmProviders"
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
    const inRead = store.state.editState == EDIT_STATE.READ
    const inNew = store.state.editState == EDIT_STATE.NEW

    const models = Object.values(LLM_MODELS)
    const modelIndex = models.indexOf(llm.code as LLM_MODELS ?? LLM_MODELS.MISTRAL_LARGE)


    return <div className="jack-lyt-form var-dialog">

        {/* <div className="lyt-v">
            <div className="jack-lbl-prop">NAME</div>
            <TextInput autoFocus
                value={name}
                onChange={name => handlePropChange({ name })}
                readOnly={inRead}
            />
        </div> */}

        <div className="lyt-v">
            <div className="jack-lbl-prop">LLMs</div>
            <ListDialog width={80}
                store={store}
                select={modelIndex}
                items={models}
                RenderRow={StringUpRow}
                readOnly={inRead}
                onSelect={index => handlePropChange({ name: Object.values(LLM_MODELS)[index] })}
            />
        </div>

        <div className="lyt-v">
            <div className="jack-lbl-prop">API-KEY</div>
            <TextInput
                value={llm.key}
                onChange={key => handlePropChange({ key })}
                readOnly={inRead}
            />
        </div>

    </div>
}

export default LlmDetailForm
