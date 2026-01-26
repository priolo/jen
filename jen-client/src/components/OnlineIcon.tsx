import React, { FunctionComponent } from "react";



interface Props {
	online?: boolean
}

/**
 * riga generica di lista figa
 */
const OnlineIcon: FunctionComponent<Props> = ({
	online,
}) => {
	const s: React.CSSProperties = {
	}
	return <div style={cssIcon(online)} />
}

export default OnlineIcon

const cssIcon = (online: boolean) => ({
	width: 10,
	height: "100%",
	backgroundColor: online ? "green" : "red",
})