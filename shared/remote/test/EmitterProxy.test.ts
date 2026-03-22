import { EmitterProxy } from "../EmitterProxy.js"
import { InMemoryProxy } from "../InMemoryProxy.js"
import { TYPE_JSON_COMMAND } from "../../update.js"

type TestItem = { id: string; name: string; revision?: number }

function makeProxy(source: TestItem[]) {
	const proxy = new EmitterProxy<TestItem>(new InMemoryProxy(source))
	const emit = jest.spyOn(proxy.emitter, 'emit')
	return { proxy, emit }
}

describe('EmitterProxy', () => {

	let source: TestItem[]

	beforeEach(() => {
		source = [
			{ id: '1', name: 'Alice' },
			{ id: '2', name: 'Bob' },
		]
	})

	// --- load ---

	test('load - emette evento "load" con l\'item', async () => {
		const { proxy, emit } = makeProxy(source)
		const item = await proxy.load('1')
		expect(emit).toHaveBeenCalledWith('load', item)
	})

	test('load - emette "load" anche se item non esiste (undefined)', async () => {
		const { proxy, emit } = makeProxy(source)
		await proxy.load('999')
		expect(emit).toHaveBeenCalledWith('load', undefined)
	})

	// --- loadAll ---

	test('loadAll - emette evento "load-all" con l\'array di item', async () => {
		const { proxy, emit } = makeProxy(source)
		const items = await proxy.loadAll()
		expect(emit).toHaveBeenCalledWith('load-all', items)
	})

	// --- create ---

	test('create - emette evento "create" con l\'item salvato', async () => {
		const { proxy, emit } = makeProxy(source)
		const item = await proxy.create({ id: '3', name: 'Charlie' })
		expect(emit).toHaveBeenCalledWith('create', item)
	})

	// --- update ---

	test('update - emette evento "update" con l\'item aggiornato', async () => {
		const { proxy, emit } = makeProxy(source)
		const item = await proxy.update('1', [{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'X' }])
		expect(emit).toHaveBeenCalledWith('update', item)
	})

	test('update - emette "update" anche se item non esiste', async () => {
		const { proxy, emit } = makeProxy(source)
		await proxy.update('999', [{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'X' }])
		expect(emit).toHaveBeenCalledWith('update', undefined)
	})

	// --- delete ---

	test('delete - emette evento "delete" con l\'id', async () => {
		const { proxy, emit } = makeProxy(source)
		await proxy.delete('1')
		expect(emit).toHaveBeenCalledWith('delete', '1')
	})

	test('ogni operazione emette esattamente un evento', async () => {
		const { proxy, emit } = makeProxy(source)
		await proxy.load('1')
		await proxy.loadAll()
		await proxy.create({ id: '3', name: 'C' })
		await proxy.update('1', [{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'X' }])
		await proxy.delete('2')
		expect(emit).toHaveBeenCalledTimes(5)
	})
})
