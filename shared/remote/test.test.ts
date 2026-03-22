import { InMemoryProxy } from "./InMemoryProxy.js"
import { CachedProxy } from "./CachedProxy.js"
import { ServerRemoteProxy } from "./ServerRemoteProxy.js"
import { ClientRemoteProxy } from "./ClientRemoteProxy.js"
import { RemoteTransport } from "./RemoteTransport.js"


describe('general test', () => {

	let source: any = [
		{ id: "1", name: "Item 1", details: { description: "First item", tags: ["a", "b"] } },
		{ id: "2", name: "Item 2", details: { description: "Second item", tags: ["b", "c"] } },
	]

	beforeEach(() => {
	});

	//#region SET tests




	test('should SET a nested object property', () => {


		const client1RemoteProxy = new ClientRemoteProxy(
			"rooms",
			"user-1",
			new CachedProxy(new InMemoryProxy(source))
		)
		const client2RemoteProxy = new ClientRemoteProxy(
			"rooms",
			"user-2",
			new CachedProxy(new InMemoryProxy(source))
		)
		const serverRemoteProxy = new ServerRemoteProxy(
			"rooms",
			new CachedProxy(new InMemoryProxy(source))
		)


		const clientTransport: RemoteTransport = {
			sendMessage: (message) => {
				serverRemoteProxy.onMessage(message)
			},
		}
		const serverTransport: RemoteTransport = {
			sendMessage: (message) => {
				client1RemoteProxy.onMessage(message)
				client2RemoteProxy.onMessage(message)
			},
		}

		client1RemoteProxy.setTransport(clientTransport)
		client2RemoteProxy.setTransport(clientTransport)
		serverRemoteProxy.setTransport(serverTransport)


	});


});
