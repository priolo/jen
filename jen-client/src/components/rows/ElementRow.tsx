import React, { FunctionComponent } from "react"
import cls from "./ElementRow.module.css"



interface Props {
	icon?: React.ReactNode
	title: string
	subtitle?: string
	selected?: boolean
	disabled?: boolean

	tabIndex?: number
	className?: string
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * riga generica di lista figa
 */
const ElementRow: FunctionComponent<Props> = ({
	icon,
	title,
	subtitle,
	selected,
	disabled,

	tabIndex = 0,
	className,
	onClick,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.code === "Space" || e.code === "Enter") {
			onClick?.(e as any);
		}
	}

	// RENDER
	if (!title) return null
	const clsRoot = `${cls.root} ${selected ? cls.select : ""} ${disabled ? cls.disabled : ""} ${className ?? ""}`

	return <div className={clsRoot} 
		tabIndex={disabled ? -1 : tabIndex}
		aria-disabled={disabled}
		role={onClick ? "button" : undefined}
		onClick={disabled ? undefined : onClick}
		onKeyDown={disabled ? undefined : handleKeyDown}
	>
		{icon}
		<div className={cls.label}>
			<div className={cls.title}>
				{title}
			</div>
			<div className={cls.subtitle}>
				{subtitle}
			</div>
		</div>
	</div>
}

export default ElementRow
