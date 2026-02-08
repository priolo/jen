import { applyJsonCommand, JsonCommand, matchPath, TYPE_JSON_COMMAND } from './update';

describe('applyJsonCommand', () => {
	let data: any;

	beforeEach(() => {
		data = {
			user: {
				name: "John",
				details: {
					age: 30,
					city: "New York"
				}
			},
			items: [
				{ id: 1, name: "Item 1", sub: [ "a", "b" ] },
				{ id: 2, name: "Item 2" },
				{ id: 3, name: "Item 3" }
			],
			simpleList: ["a", "b", "c"],
		};
	});

	//#region SET tests






	// test('Create if not exist', () => {
	// 	const command: JsonCommand = {
	// 		type: TYPE_JSON_COMMAND.SET,
	// 		path: 'test.tst2',
	// 		value: "pippo"
	// 	};
	// 	applyJsonCommand(data, command);
	// 	expect(data.user.details.age).toBe(31);
	// });






	test('should SET a nested object property', () => {
		const command: JsonCommand = {
			type: TYPE_JSON_COMMAND.SET,
			path: 'user.details.age',
			value: 31
		};
		applyJsonCommand(data, command);
		expect(data.user.details.age).toBe(31);
	});

	test('should SET an array element by index', () => {
		const command: JsonCommand = {
			type: TYPE_JSON_COMMAND.SET,
			path: 'simpleList.1',
			value: 'z'
		};
		applyJsonCommand(data, command);
		expect(data.simpleList[1]).toBe('z');
	});

	//#endregion


	//#region DELETE tests

	test('should DELETE an object property', () => {
		const command: JsonCommand = {
			type: TYPE_JSON_COMMAND.DELETE,
			path: 'user.details.city'
		};
		applyJsonCommand(data, command);
		expect(data.user.details.city).toBeUndefined();
	});

	test('should DELETE an array element by index', () => {
		// When deleting by index in arrays, splice is used
		const command: JsonCommand = {
			type: TYPE_JSON_COMMAND.DELETE,
			path: 'items.1'
		};
		applyJsonCommand(data, command);
		expect(data.items).toHaveLength(2);
		expect(data.items.find((i: any) => i.id === 2)).toBeUndefined();
	});

	test('should DELETE an array element by value', () => {
		const command: JsonCommand = {
			type: TYPE_JSON_COMMAND.DELETE,
			path: 'simpleList',
			value: 'b'
		};
		applyJsonCommand(data, command);
		expect(data.simpleList).toHaveLength(2);
		expect(data.simpleList.includes("b")).toBe(false)
	});

	//#endregion


	//#region MERGE tests

	test('should MERGE into an object', () => {
		const command: JsonCommand = {
			type: TYPE_JSON_COMMAND.MERGE,
			path: 'user.details',
			value: { country: "USA" }
		};
		applyJsonCommand(data, command);
		expect(data.user.details.country).toBe("USA");
		expect(data.user.details.age).toBe(30); // Preserves existing
	});

	test('should MERGE into an array (push)', () => {
		const command: JsonCommand = {
			type: TYPE_JSON_COMMAND.MERGE,
			path: 'simpleList',
			value: "d"
		};
		applyJsonCommand(data, command);
		expect(data.simpleList).toHaveLength(4);
		expect(data.simpleList[3]).toBe("d");
	});

	test('should MERGE into an array in sub-object', () => {
		const command: JsonCommand = {
			type: TYPE_JSON_COMMAND.MERGE,
			path: 'items.{"id":1}.sub',
			value: "c",
		};
		applyJsonCommand(data, command);
		expect(data.items[0].sub).toHaveLength(3);
		expect(data.items[0].sub[2]).toBe("c");
	});


	test('should navigate using object matching in array', () => {
		const command: JsonCommand = {
			type: TYPE_JSON_COMMAND.SET,
			path: 'items.{"id":2}.name',
			value: "Updated Item 2"
		};
		applyJsonCommand(data, command);
		expect(data.items[1].name).toBe("Updated Item 2");
	});

	test('should SET using object matching nested', () => {
		const command: JsonCommand = {
			type: TYPE_JSON_COMMAND.SET,
			path: 'items.{"name":"Item 3"}.name',
			value: "Updated Item 3"
		};
		applyJsonCommand(data, command);
		expect(data.items[2].name).toBe("Updated Item 3");
	});

	//#endregion


	//#region matchPath tests

	test('should return true for exact match', () => {
        expect(matchPath("a.b.c", "a.b.c")).toBe(true)
        expect(matchPath("one", "one")).toBe(true)
    })

    test('should return false for different lengths', () => {
        expect(matchPath("a.b.c", "a.b")).toBe(false)
        expect(matchPath("a.b", "a.b.c")).toBe(false)
    })

    test('should return false for content mismatch', () => {
        expect(matchPath("a.b.c", "a.b.d")).toBe(false)
        expect(matchPath("a.b.c", "x.b.c")).toBe(false)
    })

    test('should support wildcards', () => {
        expect(matchPath("a.b.c", "a.*.c")).toBe(true)
        expect(matchPath("a.b.c", "*.b.c")).toBe(true)
        expect(matchPath("a.b.c", "a.b.*")).toBe(true)
        expect(matchPath("a.b.c", "*.*.*")).toBe(true)
    })

    test('should match mixed wildcard and values correctly', () => {
        // Length matches, wildcard matches middle, but end mismatch
        expect(matchPath("a.b.c", "a.*.d")).toBe(false)
        // Length matches, start matches, wildcard matches end
        expect(matchPath("context.user.id", "context.user.*")).toBe(true)
    })

	//#endregion
});
