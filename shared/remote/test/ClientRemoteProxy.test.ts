import { ClientRemoteProxy } from "../ClientRemoteProxy.js"
import { CachedProxy } from "../CachedProxy.js"
import { InMemoryProxy } from "../InMemoryProxy.js"
import { MESSAGE_TYPE } from "../Message.js"
import { ENVELOPE_TYPE, Envelope, RemoteTransport } from "../RemoteTransport.js"

type TestItem = { id: string; name: string; revision?: number }

function makeClient(clientId = 'client1') {
	const source: TestItem[] = []
	const cache = new CachedProxy<TestItem>(new InMemoryProxy(source))
	const client = new ClientRemoteProxy<TestItem>('test-proxy', clientId, cache)
	const sent: Envelope[] = []
	const transport: RemoteTransport = { sendMessage: (msg) => { sent.push(msg as Envelope) } }
	client.setTransport(transport)
	return { client, cache, source, sent }
}

function snapshotEnvelope(to: string, item: TestItem, proxyId = 'test-proxy'): Envelope {
	return {
		type: ENVELOPE_TYPE.TO_CLIENT,
		to,
		proxyId,
		message: { type: MESSAGE_TYPE.SNAPSHOT, itemId: item.id, item }
	}
}

describe('ClientRemoteProxy', () => {

	// --- subscribe ---

	test('subscribe - invia SUBSCRIBE envelope al server', () => {
		const { client, sent } = makeClient()
		client.subscribe('item1')
		expect(sent).toHaveLength(1)
		expect(sent[0].type).toBe(ENVELOPE_TYPE.TO_SERVER)
		expect(sent[0].from).toBe('client1')
		expect(sent[0].proxyId).toBe('test-proxy')
		expect(sent[0].message.type).toBe(MESSAGE_TYPE.SUBSCRIBE)
		expect(sent[0].message.itemId).toBe('item1')
	})

	test('subscribe - è chainable (ritorna this)', () => {
		const { client } = makeClient()
		const result = client.subscribe('item1')
		expect(result).toBe(client)
	})

	// --- unsubscribe ---

	test('unsubscribe - invia UNSUBSCRIBE envelope al server', () => {
		const { client, sent } = makeClient()
		client.unsubscribe('item1')
		expect(sent).toHaveLength(1)
		expect(sent[0].message.type).toBe(MESSAGE_TYPE.UNSUBSCRIBE)
		expect(sent[0].message.itemId).toBe('item1')
	})

	test('unsubscribe - è chainable (ritorna this)', () => {
		const { client } = makeClient()
		const result = client.unsubscribe('item1')
		expect(result).toBe(client)
	})

	// --- onMessage: SNAPSHOT ---

	test('SNAPSHOT - item viene creato nel proxy sottostante', async () => {
		const { client } = makeClient()
		await client.onMessage(snapshotEnvelope('client1', { id: '1', name: 'Alice' }))
		const item = await client.load('1')
		expect(item).toBeDefined()
		expect(item!.name).toBe('Alice')
	})

	// --- filtraggio envelope ---

	test('ignora messaggio destinato ad altro client', async () => {
		const { client } = makeClient('client1')
		await client.onMessage(snapshotEnvelope('client2', { id: '1', name: 'Alice' }))
		const item = await client.load('1')
		expect(item).toBeUndefined()
	})

	test('ignora messaggio con proxyId errato', async () => {
		const { client } = makeClient()
		await client.onMessage(snapshotEnvelope('client1', { id: '1', name: 'Alice' }, 'other-proxy'))
		const item = await client.load('1')
		expect(item).toBeUndefined()
	})

	test('ignora envelope TO_SERVER (solo TO_CLIENT accettati)', async () => {
		const { client } = makeClient()
		await client.onMessage({
			type: ENVELOPE_TYPE.TO_SERVER,
			to: 'client1',
			proxyId: 'test-proxy',
			message: { type: MESSAGE_TYPE.SNAPSHOT, itemId: '1', item: { id: '1', name: 'Alice' } }
		})
		const item = await client.load('1')
		expect(item).toBeUndefined()
	})

	// --- sendMessage ---

	test('sendMessage - wrappa il messaggio in un envelope con from e proxyId', () => {
		const { client, sent } = makeClient()
		client.subscribe('item1') // trigger interno a sendMessage
		expect(sent[0].from).toBe('client1')
		expect(sent[0].proxyId).toBe('test-proxy')
		expect(sent[0].type).toBe(ENVELOPE_TYPE.TO_SERVER)
	})
})
