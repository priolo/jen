import ObjectField from "@/components/forms/jsonForm/ObjectField"
import { McpToolDetailStore } from "@/stores/stacks/mcpTool/detail"
import { TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ToolRequestCmp from "../ToolRequestCmp"
import ToolResponseContentCmp from "../ToolResponseContentCmp"



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
    const mcpTool = store.state.mcpTool
    if (mcpTool == null) return null
    const name = mcpTool.name ?? ""
    const description = mcpTool.description ?? ""
    const inputSchema = mcpTool.inputSchema

    // const name = "Example Tool"
    // const description = "This is an example tool for demonstration purposes."
    // const inputSchema = {
    //     type: "object",
    //     properties: {
    //         // Define your input schema properties here
    //         "prop1": {
    //             type: "string",
    //             title: "Example Property",
    //             description: "An example property"
    //         },
    //         "arrayProp": {
    //             type: "array",
    //             items: {
    //                 type: "object",
    //                 properties: {
    //                     id: { type: "number", title: "id" },
    //                     name: { type: "string", title: "name" }
    //                 }
    //             },
    //             title: "Array Property",
    //             description: "An example array property"
    //         },
    //         "objectProp": {
    //             type: "object",
    //             properties: {
    //                 "nestedProp": { type: "string", title: "Nested Property" }
    //             },
    //             title: "Object Property",
    //             description: "An example object property"
    //         },

    //     }
    // }

    return <div className="jack-lyt-form var-dialog">

        <TitleAccordion title="INFO" open={false}>
            <div className="lyt-v">
                <div className="jack-lbl-prop">NAME</div>
                <div className="jack-lbl-readonly">{name}</div>
            </div>

            <div className="lyt-v">
                <div className="jack-lbl-prop">DESCRIPTION</div>
                <div className="jack-lbl-readonly">{description}</div>
            </div>
        </TitleAccordion>

        <TitleAccordion title="INPUT SCHEMA">
            <ObjectField isRoot
                schema={inputSchema}
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

        <TitleAccordion title="OUTPUT VALUE" open={false}>
            {store.state.response?.content?.map((content, index) => (
                <ToolResponseContentCmp key={index}
                    content={content}
                />
            ))}
        </TitleAccordion>

    </div>
}

export default McpToolDetailForm



