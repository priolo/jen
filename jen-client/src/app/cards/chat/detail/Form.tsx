import RowButton from "@/components/buttons/RowButton"
import EditorIcon from "@/icons/EditorIcon"
import { ChatDetailStore } from "@/stores/stacks/chat/detail"
import chatRepoSo from "@/stores/stacks/chat/repo"
import { EDIT_STATE } from "@/types"
import { TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
    store: ChatDetailStore
}

/**
 * dettaglio di una CONNECTION
 */
const ChatDetailForm: FunctionComponent<Props> = ({
    store,
}) => {

    // STORE
    useStore(store)

    // HOOKs

    // HANDLER
    const handlePropChange = (prop: {
        [name: string]: any
    }) => store.setChatInEdit({ ...store.state.chatInEdit, ...prop })

    const handleAccountsClick = () => store.openAccounts()

    
    // RENDER
    const inEdit = store.state.editState != EDIT_STATE.READ
    const chat = inEdit ? store.state.chatInEdit : chatRepoSo.getById(store.state.chatId)
    if (chat == null) return null
    

    return <div className="jack-lyt-form var-dialog">

        <RowButton
            icon={<EditorIcon />}
            label="USERS"
            onClick={handleAccountsClick}
        />

        <div className="lyt-v">
            <div className="jack-lbl-prop">NAME</div>
            <TextInput autoFocus
                value={chat.name}
                onChange={name => handlePropChange({ name })}
                readOnly={!inEdit}
            />
        </div>

        <div className="lyt-v">
            <div className="jack-lbl-prop">DESCRIPTION</div>
            <TextInput
                value={chat.description}
                onChange={description => handlePropChange({ description })}
                readOnly={!inEdit}
            />
        </div>

    </div>
}

export default ChatDetailForm
