/**
 * Test di integrazione dell'intera pipeline di decorator.
 *
 * Stack server:  InMemoryProxy → CachedProxy → ServerRemoteProxy
 * Stack client:  InMemoryProxy → CachedProxy → ClientRemoteProxy
 *
 * I transport sono mock sincroni che instradano i messaggi direttamente
 * tra i proxy, simulando la comunicazione WebSocket.
 */

import { ArrayDataProxy } from "../InMemoryProxy.js"
import { CachedProxy } from "../CachedProxy.js"
import { ServerRemoteProxy } from "../ServerRemoteProxy.js"
import { ClientRemoteProxy } from "../ClientRemoteProxy.js"
import { RemoteTransport } from "../RemoteTransport.js"
import { MESSAGE_TYPE } from "../Message.js"
import { TYPE_JSON_COMMAND } from "../../update.js"

type Room = { id: string; name: string; revision?: number }

function buildPipeline() {

	const serverSource: Room[] = [
		{ id: 'room-1', name: 'General' },
		{ id: 'room-2', name: 'Random' },
	]

	// --- server stack ---
	const serverProxy = new ServerRemoteProxy<Room>(
		'rooms',
		new CachedProxy(new ArrayDataProxy(serverSource))
	)

	// --- client stacks ---
	const client1Cache = new CachedProxy<Room>(new ArrayDataProxy([]))
	const client1 = new ClientRemoteProxy<Room>('rooms', 'user-1', client1Cache)

	const client2Cache = new CachedProxy<Room>(new ArrayDataProxy([]))
	const client2 = new ClientRemoteProxy<Room>('rooms', 'user-2', client2Cache)

	// --- transport mock ---
	// client → server
	const clientTransport: RemoteTransport = {
		sendMessage: (msg) => serverProxy.onMessage(msg as any)
	}
	// server → tutti i client
	const serverTransport: RemoteTransport = {
		sendMessage: (msg) => {
			client1.onMessage(msg as any)
			client2.onMessage(msg as any)
		}
	}

	client1.setTransport(clientTransport)
	client2.setTransport(clientTransport)
	serverProxy.setTransport(serverTransport)

	return { serverProxy, serverSource, client1, client1Cache, client2, client2Cache }
}

describe('Pipeline - integrazione completa', () => {

	// --- subscribe / snapshot ---

	test('subscribe - il client riceve uno snapshot con i dati corretti', async () => {
		const { client1 } = buildPipeline()
		client1.subscribe('room-1')
		// il transport è sincrono ma onMessage è async: attendiamo il tick
		await Promise.resolve()
		const item = await client1.load('room-1')
		expect(item).toBeDefined()
		expect(item!.name).toBe('General')
	})

	// test('subscribe - due client ricevono snapshot indipendenti', async () => {
	// 	const { client1, client1Cache, client2, client2Cache } = buildPipeline()
	// 	client1.subscribe('room-1')
	// 	client2.subscribe('room-2')
	// 	await Promise.resolve()
	// 	expect(client1Cache.getItem('room-1')).toBeDefined()
	// 	expect(client2Cache.getItem('room-2')).toBeDefined()
	// })

	// test('subscribe - client non riceve dati di item a cui non è iscritto', async () => {
	// 	const { client1, client1Cache } = buildPipeline()
	// 	client1.subscribe('room-1')
	// 	await Promise.resolve()
	// 	expect(client1Cache.getItem('room-2')).toBeUndefined()
	// })

	// // --- unsubscribe ---

	// test('unsubscribe - dopo unsubscribe il client non riceve più aggiornamenti', async () => {
	// 	const { serverProxy, client1 } = buildPipeline()
	// 	client1.subscribe('room-1')
	// 	await Promise.resolve()
	// 	client1.unsubscribe('room-1')

	// 	// Il server ora non deve inviare nulla a client1 per room-1
	// 	const sentMessages: any[] = []
	// 	serverProxy.setTransport({
	// 		sendMessage: (msg) => sentMessages.push(msg)
	// 	})
	// 	;(serverProxy as any).sendMessage({ type: MESSAGE_TYPE.SNAPSHOT, itemId: 'room-1', item: {} })
	// 	expect(sentMessages.filter(m => m.to === 'user-1')).toHaveLength(0)
	// })

	// // --- broadcast server → clients ---

	// test('il server broadcaster raggiunge solo i client iscritti all\'item', async () => {
	// 	const { serverProxy, client1Cache, client2Cache } = buildPipeline()

	// 	// solo client1 si iscrive a room-1
	// 	serverProxy.addListenerInItem('room-1', 'user-1')

	// 	const receivedByClient1: any[] = []
	// 	const receivedByClient2: any[] = []

	// 	// intercettiamo onMessage dei client per verificare cosa arriva
	// 	const origOnMsg1 = client1Cache.load.bind(client1Cache)
	// 	client1Cache.getItem = jest.fn(client1Cache.getItem.bind(client1Cache))
	// 	client2Cache.getItem = jest.fn(client2Cache.getItem.bind(client2Cache))

	// 	;(serverProxy as any).sendMessage({
	// 		type: MESSAGE_TYPE.SNAPSHOT,
	// 		itemId: 'room-1',
	// 		item: { id: 'room-1', name: 'General' }
	// 	})

	// 	await Promise.resolve()

	// 	// client1 ha ricevuto lo snapshot (la cache viene aggiornata via create)
	// 	// verifichiamo indirettamente: solo client1 ha room-1 in cache
	// 	expect(client2Cache.getItem('room-1')).toBeUndefined()
	// })

	// // --- pipeline CRUD completa ---

	// test('create sul server → loadAll dal client mostra il nuovo item', async () => {
	// 	const { serverProxy, client1, client1Cache } = buildPipeline()

	// 	await serverProxy.create({ id: 'room-3', name: 'New Room' })

	// 	// il client fa loadAll direttamente sul server (simulando una chiamata HTTP)
	// 	const items = await client1.loadAll()
	// 	expect(items.some(i => i.id === 'room-3')).toBe(true)
	// })

	// test('delete sul server → item non più disponibile tramite load', async () => {
	// 	const { serverProxy, client1 } = buildPipeline()

	// 	await serverProxy.delete('room-1')
	// 	const item = await client1.load('room-1')
	// 	expect(item).toBeUndefined()
	// })

	// test('update sul server con SET → valore aggiornato visibile dal client', async () => {
	// 	const { serverProxy, client1 } = buildPipeline()

	// 	await serverProxy.update('room-1', [
	// 		{ type: TYPE_JSON_COMMAND.SET, path: 'name', value: 'General Updated' }
	// 	])

	// 	const item = await client1.load('room-1')
	// 	expect(item!.name).toBe('General Updated')
	// })

	// // --- disconnessione simulata ---

	// test('removeListenerInAllItems pulisce il client disconnesso', () => {
	// 	const { serverProxy } = buildPipeline()
	// 	serverProxy.addListenerInItem('room-1', 'user-1')
	// 	serverProxy.addListenerInItem('room-2', 'user-1')

	// 	serverProxy.removeListenerInAllItems('user-1')

	// 	const sent: any[] = []
	// 	serverProxy.setTransport({ sendMessage: (m) => sent.push(m) })
	// 	;(serverProxy as any).sendMessage({ type: MESSAGE_TYPE.SNAPSHOT, itemId: 'room-1', item: {} })
	// 	;(serverProxy as any).sendMessage({ type: MESSAGE_TYPE.SNAPSHOT, itemId: 'room-2', item: {} })
	// 	expect(sent).toHaveLength(0)
	// })
})
