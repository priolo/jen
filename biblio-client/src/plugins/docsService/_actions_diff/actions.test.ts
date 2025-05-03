import { describe, it, expect, vi } from 'vitest';
import { NodeType, getActionsFromDocDiff } from './actions';
import { ACTION_VERB } from "./actions";
import { generateUUID } from '../../../../utils/object';



vi.mock('../../../../utils/object', () => ({
	generateUUID: vi.fn(() => 'mock-uuid')
}));

describe('getActionsFromDocDiff', () => {
	it('should add a node when it is not present in doc1', () => {
		const doc1: NodeType[] = [];
		const doc2: NodeType[] = [{ id: '1', value: 'Node 1' }];

		const actions = getActionsFromDocDiff(doc1, doc2);

		expect(actions).toEqual([
			{
				verb: ACTION_VERB.DELETE,
				position: 0,
			}
		]);
	});

	it('should delete a node when it is not present in doc2', () => {
		const doc1: NodeType[] = [{ id: '1', value: 'Node 1' }];
		const doc2: NodeType[] = [];

		const actions = getActionsFromDocDiff(doc1, doc2);

		expect(actions).toEqual([
			{
				verb: ACTION_VERB.ADD,
				node: { id: '1', value: 'Node 1' },
				position: 0,
			}
		]);
	});

	it('should modify a node when its value has changed', () => {
		const doc1: NodeType[] = [{ id: '1', value: 'Node 1' }];
		const doc2: NodeType[] = [{ id: '1', value: 'Modified Node 1' }];

		const actions = getActionsFromDocDiff(doc1, doc2);

		expect(actions).toEqual([
			{
				verb: ACTION_VERB.MODIFY,
				node: { id: '1', value: 'Node 1' },
				position: 0,
			}
		]);
	});

	it('should move a node when its position has changed', () => {
		const doc1: NodeType[] = [{ id: '1', value: 'Node 1' }, { id: '2', value: 'Node 2' }];
		const doc2: NodeType[] = [{ id: '2', value: 'Node 2' }, { id: '1', value: 'Node 1' }];

		const actions = getActionsFromDocDiff(doc1, doc2);

		expect(actions).toEqual([
			{
				verb: ACTION_VERB.MOVE,
				node: { id: '1' },
				position: 0,
			}
		]);
	});

	it('should generate a UUID for nodes without an id in doc1', () => {
		const doc1: NodeType[] = [{ value: 'Node 1' }];
		const doc2: NodeType[] = [{ id: 'mock-uuid', value: 'Node 1' }];

		const actions = getActionsFromDocDiff(doc1, doc2);

		expect(generateUUID).toHaveBeenCalled();
		expect(actions).toEqual([]);
	});

	it('should handle complex changes', () => {
		const doc1: NodeType[] = [
			{ id: '1', value: 'Node 1' },
			{ id: '2', value: 'Node 2' },
			{ id: '4', value: 'Node 4' }
		];
		const doc2: NodeType[] = [
			{ id: '1', value: 'Node 1' },
			{ id: '3', value: 'Node 3' },
			{ id: '2', value: 'Modified Node 2' }
		];

		const actions = getActionsFromDocDiff(doc1, doc2);

		const exp = [
			{ verb: ACTION_VERB.DELETE, position: 1, },
			{
				verb: ACTION_VERB.MODIFY,
				node: { id: "2", value: "Node 2", },
				position: 1,
			},
			{
				verb: ACTION_VERB.ADD,
				node: { id: "4", value: "Node 4", },
				position: 2,
			},
		]

		expect(actions).toEqual(exp);
	});
});
