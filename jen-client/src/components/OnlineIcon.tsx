import React, { FunctionComponent } from "react";



interface Props {
	online?: boolean
	disabled?: boolean
}

/**
 * riga generica di lista figa
 */
const OnlineIcon: FunctionComponent<Props> = ({
	online,
	disabled,
}) => {
	const s: React.CSSProperties = {
	}
	return <div style={cssIcon(online, disabled)} />
}

export default OnlineIcon

const cssIcon = (online: boolean, disabled: boolean): React.CSSProperties => ({
	width: 10,
	height: "100%",
	backgroundColor: disabled 
		? "grey"
		: (online ? "green" : "red"),

})