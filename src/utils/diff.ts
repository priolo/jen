export type DiffOp = {
	path: string;
	value?: any;
	op?: "delete";
};

type PathSegment =
	| { type: "key"; key: string }
	| { type: "id"; id: string };

const ID_SEGMENT_REGEX = /^\{id:(.+)\}$/;

export function getDiff(original: any, modified: any): DiffOp[] {
	const ops: DiffOp[] = [];
	buildDiff(original, modified, "", ops);
	return ops;
}

export function applyDiff(target: any, diff: DiffOp[]): any {
	let result = cloneValue(target);
	for (const op of diff) {
		result = applyOp(result, op);
	}
	return result;
}

function buildDiff(original: any, modified: any, path: string, ops: DiffOp[]): void {
	if (deepEqual(original, modified)) return;

	if (Array.isArray(original) && Array.isArray(modified)) {
		if (isIdArray(original, modified)) {
			diffIdArray(original, modified, path, ops);
			return;
		}
		ops.push({ path: path || "/", value: cloneValue(modified) });
		return;
	}

	if (isPlainObject(original) && isPlainObject(modified)) {
		const modifiedKeys = Object.keys(modified);
		for (const key of modifiedKeys) {
			buildDiff(
				original[key],
				modified[key],
				joinPath(path, key),
				ops
			);
		}

		const originalKeys = Object.keys(original);
		for (const key of originalKeys) {
			if (!Object.prototype.hasOwnProperty.call(modified, key)) {
				ops.push({ path: joinPath(path, key), op: "delete" });
			}
		}
		return;
	}

	ops.push({ path: path || "/", value: cloneValue(modified) });
}

function diffIdArray(original: any[], modified: any[], path: string, ops: DiffOp[]): void {
	const originalMap = new Map<string, any>();
	for (const item of original) {
		originalMap.set(String(item.id), item);
	}

	const modifiedMap = new Map<string, any>();
	for (const item of modified) {
		modifiedMap.set(String(item.id), item);
	}

	for (const item of modified) {
		const id = String(item.id);
		const originalItem = originalMap.get(id);
		const itemPath = joinPath(path, `{id:${id}}`);
		if (!originalItem) {
			ops.push({ path: itemPath, value: cloneValue(item) });
		} else {
			buildDiff(originalItem, item, itemPath, ops);
		}
	}

	for (const item of original) {
		const id = String(item.id);
		if (!modifiedMap.has(id)) {
			ops.push({ path: joinPath(path, `{id:${id}}`), op: "delete" });
		}
	}
}

function applyOp(root: any, op: DiffOp): any {
	const segments = parsePath(op.path);
	if (segments.length === 0) {
		return op.op === "delete" ? undefined : cloneValue(op.value);
	}

	let current = root;
	let parent: any = null;
	let parentSegment: PathSegment | null = null;

	for (let i = 0; i < segments.length - 1; i++) {
		const segment = segments[i];
		const nextSegment = segments[i + 1];
		if (segment.type === "key") {
			if (!isPlainObject(current) && !Array.isArray(current)) {
				current = ensureContainerForSegment(nextSegment);
				if (parent === null) {
					root = current;
				} else {
					assignChild(parent, parentSegment, current);
				}
			}

			const container = current as any;
			if (!Object.prototype.hasOwnProperty.call(container, segment.key) ||
				container[segment.key] === null ||
				typeof container[segment.key] !== "object") {
				container[segment.key] = ensureContainerForSegment(nextSegment);
			} else if (nextSegment.type === "id" && !Array.isArray(container[segment.key])) {
				container[segment.key] = [];
			} else if (nextSegment.type === "key" && Array.isArray(container[segment.key])) {
				container[segment.key] = {};
			}

			parent = current;
			parentSegment = segment;
			current = container[segment.key];
			continue;
		}

		if (!Array.isArray(current)) {
			current = [];
			if (parent === null) {
				root = current;
			} else {
				assignChild(parent, parentSegment, current);
			}
		}

		const array = current as any[];
		let index = findIndexById(array, segment.id);
		if (index === -1) {
			const newItem: any = { id: parseIdValue(segment.id) };
			array.push(newItem);
			index = array.length - 1;
		}

		parent = current;
		parentSegment = segment;
		current = array[index];
	}

	const last = segments[segments.length - 1];
	if (last.type === "key") {
		if (!isPlainObject(current) && !Array.isArray(current)) {
			current = {};
			if (parent === null) {
				root = current;
			} else {
				assignChild(parent, parentSegment, current);
			}
		}

		if (op.op === "delete") {
			if (current && typeof current === "object") {
				delete current[last.key];
			}
			return root;
		}

		(current as any)[last.key] = cloneValue(op.value);
		return root;
	}

	if (!Array.isArray(current)) {
		current = [];
		if (parent === null) {
			root = current;
		} else {
			assignChild(parent, parentSegment, current);
		}
	}

	const array = current as any[];
	const index = findIndexById(array, last.id);
	if (op.op === "delete") {
		if (index !== -1) {
			array.splice(index, 1);
		}
		return root;
	}

	const value = ensureIdOnValue(cloneValue(op.value), last.id);
	if (index === -1) {
		array.push(value);
	} else {
		array[index] = value;
	}
	return root;
}

function parsePath(path: string): PathSegment[] {
	if (!path || path === "/") return [];
	const rawSegments = path.startsWith("/") ? path.slice(1).split("/") : path.split("/");
	return rawSegments.map((segment) => {
		const decoded = decodePathToken(segment);
		const match = decoded.match(ID_SEGMENT_REGEX);
		if (match) return { type: "id", id: match[1] };
		return { type: "key", key: decoded };
	});
}

function joinPath(base: string, token: string): string {
	const encoded = encodePathToken(token);
	if (!base) return `/${encoded}`;
	return `${base}/${encoded}`;
}

function encodePathToken(token: string): string {
	return token.replace(/~/g, "~0").replace(/\//g, "~1");
}

function decodePathToken(token: string): string {
	return token.replace(/~1/g, "/").replace(/~0/g, "~");
}

function isPlainObject(value: any): value is Record<string, any> {
	return !!value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);
}

function isIdArray(original: any[], modified: any[]): boolean {
	if (original.length === 0 && modified.length === 0) return false;
	if (original.length === 0) return modified.every(isIdObject);
	if (modified.length === 0) return original.every(isIdObject);
	return original.every(isIdObject) && modified.every(isIdObject);
}

function isIdObject(value: any): boolean {
	return isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, "id");
}

function deepEqual(a: any, b: any): boolean {
	if (a === b) return true;
	if (a === null || b === null) return false;
	if (typeof a !== typeof b) return false;
	if (a instanceof Date || b instanceof Date) {
		return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
	}
	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b)) return false;
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (!deepEqual(a[i], b[i])) return false;
		}
		return true;
	}
	if (isPlainObject(a) || isPlainObject(b)) {
		if (!isPlainObject(a) || !isPlainObject(b)) return false;
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		if (aKeys.length !== bKeys.length) return false;
		for (const key of aKeys) {
			if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
			if (!deepEqual(a[key], b[key])) return false;
		}
		return true;
	}
	return false;
}

function cloneValue<T>(value: T): T {
	if (value === null || typeof value !== "object") return value;
	if (value instanceof Date) return new Date(value.getTime()) as T;
	if (Array.isArray(value)) return value.map((item) => cloneValue(item)) as T;
	if (isPlainObject(value)) {
		const result: any = {};
		for (const key of Object.keys(value)) {
			result[key] = cloneValue((value as any)[key]);
		}
		return result as T;
	}
	return value;
}

function ensureContainerForSegment(segment: PathSegment): any {
	return segment.type === "id" ? [] : {};
}

function assignChild(parent: any, segment: PathSegment | null, child: any): void {
	if (!parent || !segment) return;
	if (segment.type === "key") {
		parent[segment.key] = child;
		return;
	}
	if (Array.isArray(parent)) {
		const index = findIndexById(parent, segment.id);
		if (index === -1) {
			parent.push(ensureIdOnValue(child, segment.id));
		} else {
			parent[index] = ensureIdOnValue(child, segment.id);
		}
	}
}

function findIndexById(array: any[], id: string): number {
	for (let i = 0; i < array.length; i++) {
		if (array[i] && String(array[i].id) === id) return i;
	}
	return -1;
}

function parseIdValue(id: string): string | number {
	const numeric = Number(id);
	if (!Number.isNaN(numeric) && String(numeric) === id) return numeric;
	return id;
}

function ensureIdOnValue(value: any, id: string): any {
	if (isPlainObject(value) && !Object.prototype.hasOwnProperty.call(value, "id")) {
		return { ...value, id: parseIdValue(id) };
	}
	return value;
}
