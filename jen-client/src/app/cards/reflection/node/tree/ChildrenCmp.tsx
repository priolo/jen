import React from 'react';
import NodeCmp from './NodeCmp';
import cls from "./ChildrenCmp.module.css";
import { NodeStruct } from '../../../../../stores/stacks/reflection/types';



interface Props {
	children: NodeStruct[]
	states?: { [id: string]: { expanded: boolean } }
	RenderNode?: React.FC<{node:NodeStruct}>
}

const ChildrenCmp: React.FC<Props> = ({
	children,
	states,
	RenderNode,
}) => {

	// RENDER
	if (!children) return null

	return (
		<div className={cls.root}>
			{children.map((child) => (
				<NodeCmp
					key={child.id}
					node={child}
					states={states}
					RenderNode={RenderNode}
				/>
			))}
		</div>
	)
}

export default ChildrenCmp