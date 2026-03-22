import { ProxyClient } from "@shared/proxy/ProxyClient";
import { RoomDTO } from "@shared/types/RoomDTO";
import authSo from "../auth/repo";
import { Transport } from "@shared/proxy/Transport";
import chatWSSo from "../chat/ws";
import { wsConnection } from "@/plugins/session/wsConnection";



const transport: Transport = {

	sendMessage(envelop) {
		wsConnection.send(JSON.stringify(envelop))
	}

}



export class RoomsProxy extends ProxyClient<RoomDTO> {

	private static instance: RoomsProxy = null

	static Get(): RoomsProxy {
		if ( !RoomsProxy.instance) {
			RoomsProxy.instance = new RoomsProxy("rooms", authSo.state.user?.id)
			RoomsProxy.instance.setTransport(transport)
		}
		return RoomsProxy.instance
	}
}

