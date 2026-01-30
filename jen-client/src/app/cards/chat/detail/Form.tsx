import RowButton from "@/components/buttons/RowButton"
import EditorIcon from "@/icons/EditorIcon"
import { ChatDetailStore } from "@/stores/stacks/chat/detail"
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
    }) => store.setChat({ ...store.state.chat, ...prop })

    const handleAccountsClick = () => store.openAccounts()

    
    // RENDER
    const chat = store.state.chat
    if (chat == null) return null
    const inRead = store.state.editState == EDIT_STATE.READ
    const inNew = store.state.editState == EDIT_STATE.NEW

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
                readOnly={inRead}
            />
        </div>

        <div className="lyt-v">
            <div className="jack-lbl-prop">DESCRIPTION</div>
            <TextInput
                value={chat.description}
                onChange={description => handlePropChange({ description })}
                readOnly={inRead}
            />
        </div>

    </div>
}

export default ChatDetailForm
