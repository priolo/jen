import { CachedProxy } from "../CachedProxy.js"
import { InMemoryProxy } from "../InMemoryProxy.js"
import { TYPE_JSON_COMMAND } from "../../update.js"

type TestItem = { id: string; name: string; revision?: number }

describe('CachedProxy', () => {

	let source: TestItem[]
	let proxy: CachedProxy<TestItem>

	beforeEach(() => {
		source = [
			{ id: '1', name: 'Alice' },
			{ id: '2', name: 'Bob' },
		]
		proxy = new CachedProxy(new InMemoryProxy(source))
	})

	// --- getItem / getItems ---

	test('getItem - restituisce undefined prima del load', () => {
		expect(proxy.getItem('1')).toBeUndefined()
	})

	test('getItems - restituisce lista vuota prima di qualsiasi load', () => {
		expect(proxy.getItems()).toHaveLength(0)
	})

	// --- load ---

	test('load - recupera dal proxy e mette in cache', async () => {
		const item = await proxy.load('1')
		expect(item).toBeDefined()
		expect(proxy.getItem('1')).toBe(item)
	})

	test('load - alla seconda chiamata usa la cache (non il proxy)', async () => {
		await proxy.load('1')
		// modifico il source: la cache non deve essere aggiornata
		source[0].name = 'Alice Modified'
		const item = await proxy.load('1')
		expect(item!.name).toBe('Alice')
	})

	test('load - restituisce undefined per id mancante', async () => {
		const item = await proxy.load('999')
		expect(item).toBeUndefined()
	})

	// --- loadAll ---

	test('loadAll - carica e mette in cache tutti gli item', async () => {
		await proxy.loadAll()
		expect(proxy.getItems()).toHaveLength(2)
	})

	test('loadAll - item caricati sono accessibili via getItem', async () => {
		await proxy.loadAll()
		expect(proxy.getItem('1')).toBeDefined()
		expect(proxy.getItem('2')).toBeDefined()
	})

	// --- create ---

	test('create - aggiunge item alla cache', async () => {
		await proxy.create({ id: '3', name: 'Charlie' })
		expect(proxy.getItem('3')).toBeDefined()
		expect(proxy.getItem('3')!.name).toBe('Charlie')
	})

	// --- update ---

	test('update - aggiorna item nella cache', async () => {
		await proxy.load('1')
		await proxy.update('1', [{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'Alice Updated' }])
		expect(proxy.getItem('1')!.name).toBe('Alice Updated')
	})

	test('update - incrementa revision', async () => {
		await proxy.load('1')
		await proxy.update('1', [{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'X' }])
		expect(proxy.getItem('1')!.revision).toBe(1)
	})

	test('update - applica più comandi in sequenza', async () => {
		await proxy.load('1')
		await proxy.update('1', [
			{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'X' },
		])
		await proxy.update('1', [
			{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'Y' },
		])
		expect(proxy.getItem('1')!.revision).toBe(2)
	})

	test('update - restituisce undefined se item non è in cache', async () => {
		// item non è mai stato caricato in cache
		const result = await proxy.update('1', [{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'X' }])
		expect(result).toBeUndefined()
	})

	// --- delete ---

	test('delete - rimuove item dalla cache', async () => {
		await proxy.load('1')
		const result = await proxy.delete('1')
		expect(result).toBe(true)
		expect(proxy.getItem('1')).toBeUndefined()
	})

	test('delete - restituisce false se item non è in cache', async () => {
		// item non è in cache
		const result = await proxy.delete('1')
		expect(result).toBe(false)
	})
})
