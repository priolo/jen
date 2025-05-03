import React from 'react';
import { NodeStruct } from '../../../../../stores/stacks/reflection/types';
import ChildrenCmp from './ChildrenCmp';
import cls from "./Node.module.css";
import { NodeView } from '../../../../../stores/stacks/reflection';



interface Props {
	node: NodeStruct
	states?: { [id: string]: NodeView }
	RenderNode?: React.FC<{ node: NodeStruct }>
}

const NodeCmp: React.FC<Props> = ({
	node,
	states,
	RenderNode,
}) => {

	// HANDLERS

	// RENDER
	if (!node) return null
	const hasChildren = !!node.children && node.children.length > 0
	const isExpanded = states[node.id]?.expanded ?? false

	return (
		<div className={cls.root}>

			<RenderNode
				node={node}
			/>

			{hasChildren && isExpanded && (
				<div className={cls.children}>
					<ChildrenCmp
						children={node.children}
						states={states}
						RenderNode={RenderNode}
					/>
				</div>
			)}
		</div>
	);
};

export default NodeCmp