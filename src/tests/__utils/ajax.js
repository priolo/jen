import axios from "axios"
axios.defaults.adapter = require('axios/lib/adapters/http')

import { PORT } from "../../config"

function buildAjax( port, baseURL ) {
	if ( !port ) port = PORT
	if ( !baseURL ) baseURL=`http://localhost:${port}/api`
	const axiosIstance = axios.create({ baseURL, withCredentials: true })
	return axiosIstance
}

const ajax = buildAjax()

export {
	ajax,
	buildAjax,
}