import { ServerRemoteProxy } from "../ServerRemoteProxy.js"
import { CachedProxy } from "../CachedProxy.js"
import { InMemoryProxy } from "../InMemoryProxy.js"
import { MESSAGE_TYPE } from "../Message.js"
import { ENVELOPE_TYPE, Envelope, RemoteTransport } from "../RemoteTransport.js"

type TestItem = { id: string; name: string; revision?: number }

function makeServer(source: TestItem[]) {
	const server = new ServerRemoteProxy<TestItem>(
		'test-proxy',
		new CachedProxy(new InMemoryProxy(source))
	)
	const sent: Envelope[] = []
	const transport: RemoteTransport = { sendMessage: (msg) => { sent.push(msg as Envelope) } }
	server.setTransport(transport)
	return { server, sent }
}

function subEnvelope(clientId: string, itemId: string): Envelope {
	return {
		type: ENVELOPE_TYPE.TO_SERVER,
		from: clientId,
		proxyId: 'test-proxy',
		message: { type: MESSAGE_TYPE.SUBSCRIBE, itemId }
	}
}

function unsubEnvelope(clientId: string, itemId: string): Envelope {
	return {
		type: ENVELOPE_TYPE.TO_SERVER,
		from: clientId,
		proxyId: 'test-proxy',
		message: { type: MESSAGE_TYPE.UNSUBSCRIBE, itemId }
	}
}

describe('ServerRemoteProxy', () => {

	let source: TestItem[]

	beforeEach(() => {
		source = [
			{ id: '1', name: 'Alice' },
			{ id: '2', name: 'Bob' },
		]
	})

	// --- onMessage: SUBSCRIBE ---

	test('SUBSCRIBE - invia SNAPSHOT al client che si iscrive', async () => {
		const { server, sent } = makeServer(source)
		await server.onMessage(subEnvelope('client1', '1'))
		expect(sent).toHaveLength(1)
		expect(sent[0].type).toBe(ENVELOPE_TYPE.TO_CLIENT)
		expect(sent[0].to).toBe('client1')
		expect(sent[0].message.type).toBe(MESSAGE_TYPE.SNAPSHOT)
	})

	test('SUBSCRIBE - lo snapshot contiene i dati corretti dell\'item', async () => {
		const { server, sent } = makeServer(source)
		await server.onMessage(subEnvelope('client1', '1'))
		const snapshot = sent[0].message as any
		expect(snapshot.item.id).toBe('1')
		expect(snapshot.item.name).toBe('Alice')
	})

	test('SUBSCRIBE - due client sullo stesso item ricevono entrambi lo snapshot', async () => {
		const { server, sent } = makeServer(source)
		await server.onMessage(subEnvelope('client1', '1'))
		await server.onMessage(subEnvelope('client2', '1'))
		expect(sent).toHaveLength(2)
		expect(sent[0].to).toBe('client1')
		expect(sent[1].to).toBe('client2')
	})

	// --- onMessage: UNSUBSCRIBE ---

	test('UNSUBSCRIBE - rimuove listener: dopo unsubscribe il client non riceve più messaggi', async () => {
		const { server, sent } = makeServer(source)
		await server.onMessage(subEnvelope('client1', '1'))
		sent.length = 0
		await server.onMessage(unsubEnvelope('client1', '1'))
		// sendMessage su item '1' non deve raggiungere nessuno
		;(server as any).sendMessage({ type: MESSAGE_TYPE.SNAPSHOT, itemId: '1', item: source[0] })
		expect(sent).toHaveLength(0)
	})

	// --- filtraggio envelope ---

	test('ignora envelope con proxyId errato', async () => {
		const { server, sent } = makeServer(source)
		await server.onMessage({
			type: ENVELOPE_TYPE.TO_SERVER,
			from: 'client1',
			proxyId: 'wrong-proxy',
			message: { type: MESSAGE_TYPE.SUBSCRIBE, itemId: '1' }
		})
		expect(sent).toHaveLength(0)
	})

	test('ignora envelope TO_CLIENT (solo TO_SERVER accettati)', async () => {
		const { server, sent } = makeServer(source)
		await server.onMessage({
			type: ENVELOPE_TYPE.TO_CLIENT,
			from: 'client1',
			proxyId: 'test-proxy',
			message: { type: MESSAGE_TYPE.SUBSCRIBE, itemId: '1' }
		})
		expect(sent).toHaveLength(0)
	})

	test('ignora envelope senza campo "from"', async () => {
		const { server, sent } = makeServer(source)
		await server.onMessage({
			type: ENVELOPE_TYPE.TO_SERVER,
			proxyId: 'test-proxy',
			message: { type: MESSAGE_TYPE.SUBSCRIBE, itemId: '1' }
		})
		expect(sent).toHaveLength(0)
	})

	// --- listener management ---

	test('addListenerInItem / removeListenerFromItem - via comportamento', async () => {
		const { server, sent } = makeServer(source)
		server.addListenerInItem('1', 'client1')
		server.addListenerInItem('1', 'client2')
		;(server as any).sendMessage({ type: MESSAGE_TYPE.SNAPSHOT, itemId: '1', item: source[0] })
		expect(sent).toHaveLength(2)

		sent.length = 0
		server.removeListenerFromItem('1', 'client1')
		;(server as any).sendMessage({ type: MESSAGE_TYPE.SNAPSHOT, itemId: '1', item: source[0] })
		expect(sent).toHaveLength(1)
		expect(sent[0].to).toBe('client2')
	})

	test('removeAllListenersFromItem - rimuove tutti i listener di un item', () => {
		const { server, sent } = makeServer(source)
		server.addListenerInItem('1', 'client1')
		server.addListenerInItem('1', 'client2')
		server.removeAllListenersFromItem('1')
		;(server as any).sendMessage({ type: MESSAGE_TYPE.SNAPSHOT, itemId: '1', item: source[0] })
		expect(sent).toHaveLength(0)
	})

	test('removeListenerInAllItems - rimuove un client da tutti gli item', () => {
		const { server, sent } = makeServer(source)
		server.addListenerInItem('1', 'client1')
		server.addListenerInItem('2', 'client1')
		server.addListenerInItem('1', 'client2')
		server.removeListenerInAllItems('client1')

		;(server as any).sendMessage({ type: MESSAGE_TYPE.SNAPSHOT, itemId: '1', item: source[0] })
		;(server as any).sendMessage({ type: MESSAGE_TYPE.SNAPSHOT, itemId: '2', item: source[1] })
		// solo client2 su item '1' rimane
		expect(sent).toHaveLength(1)
		expect(sent[0].to).toBe('client2')
	})
})
