import { UserStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
import { TextInput, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: UserStore
}

const Form: FunctionComponent<Props> = ({
	store: store,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs

	// HANDLER
	const handlePropChange = (prop: { [name: string]: any }) => store.setUser({ ...state.user, ...prop })

	// RENDER
	if (!state.user ) return null
	const inRead = state.editState == EDIT_STATE.READ
	const inNew = state.editState == EDIT_STATE.NEW

	return <div className="lyt-form var-dialog" style={{ marginBottom: 25 }}>

		<TitleAccordion title="BASE">

			<div className="lyt-v">
				<div className="lbl-prop">NAME</div>
				<TextInput
					value={state.user.name}
					onChange={name => handlePropChange({ name })}
					readOnly={inRead || !inNew}
				/>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">EMAIL</div>
				<TextInput multiline rows={2}
					value={state.user.email}
					onChange={email => handlePropChange({ email })}
					readOnly={inRead}
				/>
			</div>

		</TitleAccordion>

	</div>
}

export default Form

