import { ProxyServer } from "../ProxyServer.js"
import { ProxyClient } from "../ProxyClient.js"
import { Envelope, Transport } from "../Transport.js"
import { Message } from "../Message.js"
import { Storage } from "../Storage.js"

interface Item {
	id: string
	name: string
	revision: number
}


describe("Test on AGENT router", () => {

	let db: Item[]

	beforeAll(async () => {
		db = [
			{ id: "1", name: "item1", revision: 0 },
			{ id: "2", name: "item2", revision: 0 },
			{ id: "3", name: "item3", revision: 0 },
		]

	})

	afterAll(async () => {


	})



	test("cambio un oggetto", async () => {

		const serverObj = new ProxyServer("test")
		const client1Obj = new ProxyClient("test", "client-1")
		const client2Obj = new ProxyClient("test", "client-2")

		const clientTransport: Transport = {
			sendMessage: envelope => {
				serverObj.onMessage(envelope)
			}
		}
		client1Obj.setTransport(clientTransport)
		client2Obj.setTransport(clientTransport)

		const serverTransport: Transport = {
			sendMessage: envelope => {
				switch ( envelope.to ) {
					case "client-1":
						client1Obj.onMessage(envelope)
						break
					case "client-2":
						client2Obj.onMessage(envelope)
						break
				}
			}
		}
		const serverStorage:Storage<Item> = {
			load: async (id) => db.find(i => i.id == id),
			save: async (item) => {
				const index = db.findIndex(i => i.id == item.id)
				if (index == -1) {
					db.push(item)
				} else {
					db[index] = item
				}
			},
		}
		serverObj.setStorage(serverStorage)
		serverObj.setTransport(serverTransport)



		// il client 1 si si iscrive all'ITEM 1
		await client1Obj.subscribe("1")



	})

})