import { InMemoryProxy } from "../InMemoryProxy.js"
import { TYPE_JSON_COMMAND } from "../../update.js"

type TestItem = { id: string; name: string; revision?: number }

describe('InMemoryProxy', () => {

	let source: TestItem[]
	let proxy: InMemoryProxy<TestItem>

	beforeEach(() => {
		source = [
			{ id: '1', name: 'Alice' },
			{ id: '2', name: 'Bob' },
		]
		proxy = new InMemoryProxy(source)
	})

	// --- load ---

	test('load - restituisce item per id', async () => {
		const item = await proxy.load('1')
		expect(item).toEqual({ id: '1', name: 'Alice' })
	})

	test('load - restituisce undefined per id mancante', async () => {
		const item = await proxy.load('999')
		expect(item).toBeUndefined()
	})

	// --- loadAll ---

	test('loadAll - senza filtro restituisce tutti gli item', async () => {
		const items = await proxy.loadAll()
		expect(items).toHaveLength(2)
	})

	test('loadAll - filtra per campo', async () => {
		const items = await proxy.loadAll({ name: 'Alice' })
		expect(items).toHaveLength(1)
		expect(items[0].id).toBe('1')
	})

	test('loadAll - restituisce lista vuota se nessun match', async () => {
		const items = await proxy.loadAll({ name: 'Zzz' })
		expect(items).toHaveLength(0)
	})

	test('loadAll - restituisce una copia dell\'array (non il riferimento)', async () => {
		const items = await proxy.loadAll()
		items.push({ id: '99', name: 'Extra' })
		expect(source).toHaveLength(2)
	})

	// --- create ---

	test('create - aggiunge item al source', async () => {
		const item = await proxy.create({ id: '3', name: 'Charlie' })
		expect(item.id).toBe('3')
		expect(source).toHaveLength(3)
		expect(source[2].name).toBe('Charlie')
	})

	// --- update ---

	test('update - SET su campo radice', async () => {
		await proxy.update('1', [{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'Alice Updated' }])
		expect(source[0].name).toBe('Alice Updated')
	})

	test('update - restituisce undefined per id mancante', async () => {
		const result = await proxy.update('999', [{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'X' }])
		expect(result).toBeUndefined()
	})

	test('update - restituisce l\'item modificato', async () => {
		const item = await proxy.update('1', [{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'Alice Updated' }])
		expect(item?.name).toBe('Alice Updated')
	})

	// --- delete ---

	test('delete - rimuove item dal source', async () => {
		const result = await proxy.delete('1')
		expect(result).toBe(true)
		expect(source).toHaveLength(1)
		expect(source[0].id).toBe('2')
	})

	test('delete - restituisce false per id mancante', async () => {
		const result = await proxy.delete('999')
		expect(result).toBe(false)
		expect(source).toHaveLength(2)
	})
})
