import { Content } from "@/stores/stacks/mcpTool/types"
import { FunctionComponent } from "react"



interface Props {
    content: Content
}

/**
 * Visualizza un RISULTATO di un TOOL
 */
const ToolResultCmp: FunctionComponent<Props> = ({
    content,
}) => {

    // STORE

    // HOOKs

    // HANDLER

    // RENDER
    return (
        <div className="jack-lbl-readonly" style={{
            fontFamily: "monospace",
            fontSize: "12px",
            backgroundColor: "rgba(0,255,0,0.2)",
            padding: "8px",
            borderRadius: "4px",
            whiteSpace: "pre-wrap"
        }}>
            {content.text}
        </div>
    )
}

export default ToolResultCmp



