import { FunctionComponent } from "react"



interface Props {
    request: any
}

/**
 * Render REQUEST to a TOOL
 */
const ToolRequestCmp: FunctionComponent<Props> = ({
    request,
}) => {

    // STORE

    // HOOKs

    // HANDLER

    // RENDER
    return (
        <div className="jack-lbl-readonly" style={{
            fontFamily: "monospace",
            fontSize: "12px",
            backgroundColor: "rgba(0,0,0,0.2)",
            padding: "8px",
            borderRadius: "4px",
            whiteSpace: "pre-wrap"
        }}>
            {JSON.stringify(request, null, 2)}
        </div>
    )
}

export default ToolRequestCmp



