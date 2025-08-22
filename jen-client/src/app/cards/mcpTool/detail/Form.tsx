import ObjectField from "@/components/forms/jsonForm/ObjectField"
import { McpToolDetailStore } from "@/stores/stacks/mcpTool/detail"
import { TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ToolRequestCmp from "../ToolRequestCmp"
import ToolResultCmp from "../ToolResultCmp"



interface Props {
    store: McpToolDetailStore
}

/**
 * dettaglio di una CONNECTION
 */
const McpToolDetailForm: FunctionComponent<Props> = ({
    store,
}) => {

    // STORE
    useStore(store)

    // HOOKs

    // HANDLER
    const handleSchemaDataChange = (data: any) => {
        store.setRequest(data)
    }

    // RENDER
    const tool = store.state.mcpTool
    if (tool == null) return null

    return <div className="jack-lyt-form var-dialog">

        <TitleAccordion title="INFO" open={false}>
            <div className="lyt-v">
                <div className="jack-lbl-prop">NAME</div>
                <div className="jack-lbl-readonly">{tool.name ?? ""}</div>
            </div>

            <div className="lyt-v">
                <div className="jack-lbl-prop">DESCRIPTION</div>
                <div className="jack-lbl-readonly">{tool.description ?? ""}</div>
            </div>
        </TitleAccordion>

        <TitleAccordion title="INPUT SCHEMA">
            <ObjectField isRoot
                schema={tool.inputSchema}
                value={store.state.request}
                onChange={handleSchemaDataChange}
                readOnly={false}
            />
        </TitleAccordion>

        <TitleAccordion title="INPUT VALUE" open={false}>
            <ToolRequestCmp
                request={store.state.request}
            />
        </TitleAccordion>

        <TitleAccordion title="OUTPUT VALUE" open={true}>
            {store.state.response?.content?.map((content, index) => (
                <ToolResultCmp key={index}
                    content={content}
                />
            ))}
        </TitleAccordion>

    </div>
}

export default McpToolDetailForm



