import { applyDiff, getDiff, type DiffOp } from "../diff.js";

function sortOps(ops: DiffOp[]): DiffOp[] {
	return [...ops].sort((a, b) => {
		if (a.path !== b.path) return a.path.localeCompare(b.path);
		if ((a.op ?? "") !== (b.op ?? "")) return (a.op ?? "").localeCompare(b.op ?? "");
		const aValue = a.value === undefined ? "" : JSON.stringify(a.value);
		const bValue = b.value === undefined ? "" : JSON.stringify(b.value);
		return aValue.localeCompare(bValue);
	});
}

describe("diff utils", () => {
	test("diff + apply with array items by id", () => {
		const a = {
			name: "Alice",
			age: 30,
			friends: [
				{ id: "fr-1", name: "Maria" },
				{ id: "fr-2", name: "Federico" },
			],
			tags: [{ tag: "friend" }, { tag: "colleague" }],
		};

		const b = {
			name: "Alice",
			age: 31,
			friends: [
				{ id: "fr-1", name: "Mario" },
				{ id: "fr-3", name: "Giuseppe" },
			],
			tags: [{ tag: "best friend" }, { tag: "family" }],
		};

		const diff = getDiff(a, b);

		const expected: DiffOp[] = [
			{ path: "/age", value: 31 },
			{ path: "/friends/{id:fr-1}/name", value: "Mario" },
			{ path: "/friends/{id:fr-2}", op: "delete" },
			{ path: "/friends/{id:fr-3}", value: { id: "fr-3", name: "Giuseppe" } },
			{
				path: "/tags",
				value: [{ tag: "best friend" }, { tag: "family" }],
			},
		];

		expect(sortOps(diff)).toEqual(sortOps(expected));

		const patched = applyDiff(a, diff);
		expect(patched).toEqual(b);
	});

	test("deletes missing properties", () => {
		const a = { name: "Alice", age: 30, meta: { active: true } };
		const b = { name: "Alice" };

		const diff = getDiff(a, b);
		expect(diff).toEqual([
			{ path: "/age", op: "delete" },
			{ path: "/meta", op: "delete" },
		]);

		expect(applyDiff(a, diff)).toEqual(b);
	});

	test("replaces arrays without id", () => {
		const a = { items: [{ tag: "friend" }, { tag: "colleague" }] };
		const b = { items: [{ tag: "best friend" }] };

		const diff = getDiff(a, b);
		expect(diff).toEqual([
			{ path: "/items", value: [{ tag: "best friend" }] },
		]);

		expect(applyDiff(a, diff)).toEqual(b);
	});

	test("root replacement for atomic values", () => {
		const diff = getDiff(10, 20);
		expect(diff).toEqual([{ path: "/", value: 20 }]);
		expect(applyDiff(10, diff)).toBe(20);
	});

	test("test mio", () => {
		const a = {
			id: "chat-1",
			name: "my chat",
			users: [
				{ id: "usr-1", name: "pippo" },
			],
		};
		const b = {
			id: "chat-1",
			name: "my chat",
			users: [
				{ id: "usr-1", name: "pippo" },
				{ id: "usr-2", name: "pappo" },
			],
		};


		const diff = getDiff(a, b);
		expect(diff).toEqual([
			{ path: "/users", value: { id: "usr-2", name: "pappo" } },
		]);

		expect(applyDiff(a, diff)).toEqual(b);
	});
});
