import React from 'react';
import ArrowRightIcon from '../../../../icons/ArrowRightIcon';
import cls from "./NodeRender.module.css";
import { NodeStruct } from '../../../../stores/stacks/reflection/types';
import ArrowDownIcon from '../../../../icons/ArrowDownIcon';
import IconizedIcon from '../../../../icons/IconizeIcon';



interface Props {
	node: NodeStruct
	selectedId: string
	expanded: boolean
	onSelect: () => void;
	onToggle: () => void;
	onOpen?: () => void;
}

const NodeRenderCmp: React.FC<Props> = ({
	node,
	selectedId,
	expanded,
	onSelect,
	onToggle,
	onOpen,
}) => {

	// HANDLERS

	// RENDER
	if (!node) return null
	const hasChildren = !!node.children && node.children.length > 0
	const isSelected = selectedId === node.id

	const clsLabel = `${cls.label} ${isSelected ? cls.selected : ""}`

	return (
		<div className={cls.node}
			onClick={onSelect}
		>
			<span className={cls.toggle}
				onClick={onToggle}>
				{hasChildren ? (
					expanded ? <ArrowDownIcon /> : <ArrowRightIcon />
				) : (
					<IconizedIcon />
				)}
			</span>

			<div className={clsLabel}>
				<span className={cls.name}>{node.name}</span>
				<span className={cls.class}>{node.class}</span>
			</div>

			<ArrowRightIcon onClick={onOpen}/>

		</div>
	);
};

export default NodeRenderCmp