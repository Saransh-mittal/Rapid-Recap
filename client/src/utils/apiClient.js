import axios from 'axios'
import i18n from '../i18n' // Import your i18n setup

const apiClient = axios.create({
  baseURL: '/api',
})

apiClient.interceptors.request.use(config => {
  config.headers['Accept-Language'] = i18n.language || 'en'
  return config
})

export default apiClient
