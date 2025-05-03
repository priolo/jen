import { describe, expect, test } from 'vitest';
import { nodeByPath, forEachNode, nodeById, updatePath } from './utils';
import { NodeStruct } from '../../stores/stacks/reflection/types';

describe('nodeByPath', () => {
	const mockStructure: NodeStruct = {
		id: 'root',
		name: 'root',
		children: [
			{
				id: 'child1',
				name: 'child1',
				children: [
					{
						id: 'grandchild1',
						name: 'grandchild1',
						children: []
					}
				]
			},
			{
				id: 'child2',
				name: 'child2',
				children: []
			}
		]
	};

	test('should find root node', () => {
		const result = nodeByPath(mockStructure, '');
		expect(result).toBe(mockStructure);
	});

	test('should find direct child node', () => {
		const result = nodeByPath(mockStructure, '/child1');
		expect(result).toBe(mockStructure.children[0]);
	});

	test('should find nested node', () => {
		const result = nodeByPath(mockStructure, '/child1/grandchild1');
		expect(result).toBe(mockStructure.children[0].children[0]);
	});

	test('should return null for non-existent path', () => {
		const result = nodeByPath(mockStructure, 'child1/nonexistent');
		expect(result).toBeNull();
	});

	test('should return null for invalid path', () => {
		const result = nodeByPath(mockStructure, 'invalid/path/test');
		expect(result).toBeNull();
	});
});

describe('forEachNode', () => {
	const mockStructure: NodeStruct = {
		id: 'root',
		name: 'root',
		children: [
			{
				id: 'child1',
				name: 'child1',
				children: [
					{
						id: 'grandchild1',
						name: 'grandchild1',
						children: []
					}
				]
			},
			{
				id: 'child2',
				name: 'child2',
				children: []
			}
		]
	};

	test('should visit all nodes', () => {
		const visitedNodes: string[] = [];
		forEachNode(mockStructure, (node) => {
			visitedNodes.push(node.id);
			return true;
		});
		expect(visitedNodes).toEqual(['root', 'child1', 'grandchild1', 'child2']);
	});

	test('should stop traversal when callback returns false', () => {
		const visitedNodes: string[] = [];
		forEachNode(mockStructure, (node) => {
			visitedNodes.push(node.id);
			return node.id !== 'child1'
		});
		expect(visitedNodes).toEqual(['root', 'child1']);
	});

	test('should pass correct paths to callback', () => {
		const paths: string[] = [];
		forEachNode(mockStructure, (node, path) => {
			paths.push(path);
			return true;
		});
		expect(paths).toEqual(["", "/child1", "/child1/grandchild1", "/child2",]);
	});

	test('should handle nodes without children', () => {
		const node: NodeStruct = {
			id: 'single',
			name: 'single',
			children: []
		};
		const visitedNodes: string[] = [];
		forEachNode(node, (n) => {
			visitedNodes.push(n.id);
			return true;
		});
		expect(visitedNodes).toEqual(['single']);
	});
});

describe('nodeById', () => {
	const mockStructure: NodeStruct = {
		id: 'root',
		name: 'root',
		children: [
			{
				id: 'child1',
				name: 'child1',
				children: [
					{
						id: 'grandchild1',
						name: 'grandchild1',
						children: []
					}
				]
			},
			{
				id: 'child2',
				name: 'child2',
				children: []
			}
		]
	};

	test('should find root node', () => {
		const result = nodeById(mockStructure, 'root');
		expect(result).toBe(mockStructure);
	});

	test('should find child node', () => {
		const result = nodeById(mockStructure, 'child1');
		expect(result).toBe(mockStructure.children[0]);
	});

	test('should find nested node', () => {
		const result = nodeById(mockStructure, 'grandchild1');
		expect(result).toBe(mockStructure.children[0].children[0]);
	});

	test('should return null for non-existent id', () => {
		const result = nodeById(mockStructure, 'nonexistent');
		expect(result).toBeNull();
	});
});

describe('updatePath', () => {
	const mockStructure: NodeStruct = {
		id: 'root',
		name: 'root',
		children: [
			{
				id: 'child1',
				name: 'child1',
				children: [
					{
						id: 'grandchild1',
						name: 'grandchild1',
						children: []
					}
				]
			},
			{
				id: 'child2',
				name: 'child2',
				children: []
			}
		]
	};

	test('should update paths for all nodes', () => {
		updatePath(mockStructure);

		expect(mockStructure.path).toBe('');
		expect(mockStructure.children[0].path).toBe('/child1');
		expect(mockStructure.children[0].children[0].path).toBe('/child1/grandchild1');
		expect(mockStructure.children[1].path).toBe('/child2');
	});

	test('should handle single node without children', () => {
		const singleNode: NodeStruct = {
			id: 'single',
			name: 'single',
			children: []
		};

		updatePath(singleNode);
		expect(singleNode.path).toBe('');
	});

	test('should not modify other node properties', () => {
		const node: NodeStruct = {
			id: 'test',
			name: 'test',
			children: []
		};

		const originalNode = { ...node };
		updatePath(node);

		expect(node.id).toBe(originalNode.id);
		expect(node.name).toBe(originalNode.name);
		expect(node.children).toEqual(originalNode.children);
	});
});
