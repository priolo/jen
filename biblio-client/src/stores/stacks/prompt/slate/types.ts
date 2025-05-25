import { BaseElement, Node } from "slate"



export enum PROMPT_ROLES {
	SYSTEM = "system",
	USER = "user",
	TOOL = "tool",
}

export type ElementType = {
	id?: string
	type?: PROMPT_ROLES
} & BaseElement

export type NodeType = Node & ElementType
