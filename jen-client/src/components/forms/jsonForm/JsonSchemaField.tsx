import { Accordion, IconToggle, NumberInput, TextInput } from "@priolo/jack"
import { FunctionComponent, useState } from "react"
import ArrayField from "./ArrayField"
import ObjectField from "./ObjectField"
import { JsonSchema } from "./types"



interface Props {
    name: string
    schema: JsonSchema
    value: any
    readOnly?: boolean
    required?: boolean

    labelEndRender?: React.ReactNode

    onChange: (value: any) => void
    style?: React.CSSProperties
    className?: string
}

const JsonSchemaField: FunctionComponent<Props> = ({
    name,
    schema,
    value,
    readOnly = false,
    required = false,

    labelEndRender,

    onChange,
    style,
    className
}) => {

    // HOOK
    const [open, setOpen] = useState(true)


    // RENDER
    const label = schema.title ?? name.toUpperCase()

    const renderField = () => {
        switch (schema.type) {

            case "string":
                return <TextInput style={style} className={className}
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder={schema.description}
                />

            case "number":
            case "integer":
                return <NumberInput style={style} className={className}
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder={schema.description}
                    min={schema.minimum}
                    max={schema.maximum}
                />

            case "boolean":
                return <IconToggle style={style} className={className}
                    check={Boolean(value)}
                    onChange={onChange}
                    readOnly={readOnly}
                />

            case "array":
                return <ArrayField style={style} className={className}
                    schema={schema}
                    value={value ?? []}
                    onChange={onChange}
                    readOnly={readOnly}
                />

            case "object":
                return <ObjectField style={style} className={className}
                    schema={schema}
                    value={value || {}}
                    onChange={onChange}
                    readOnly={readOnly}
                />

            default:
                return <TextInput style={style} className={className}
                    value={String(value || "")}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder={schema.description}
                />
        }
    }

    const labelSty = { display: "flex", alignItems: "center", gap: "4px", justifyContent: 'space-between' }
    const labelTextSty = open ? {} : { textDecoration: "underline", textDecorationThickness: "2px", textDecorationColor: "rgba(0, 0, 0, 0.4)" }

    return (
        <div className="lyt-v">

            <div className="jack-lbl-prop" style={labelSty}
                onClick={()=> setOpen(!open)}
            >
                <span style={labelTextSty}>{label}</span>
                {required && <span style={{ color: "red" }}>*</span>}
                {labelEndRender}
            </div>

            <Accordion open={open}>
                {renderField()}
            </Accordion>

        </div>
    )
}


export default JsonSchemaField
