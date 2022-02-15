import axios from 'axios'
import app from '@/main'

import apiConfig from '@/components/apiConfig'

const ai = axios.create({
	baseURL: apiConfig.apiBasePath
})


const setupApi = async function() {
	const token = await app.config.globalProperties.$auth.getTokenSilently()
	ai.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

setupApi()

export { ai }