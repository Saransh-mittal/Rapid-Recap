import axios from 'axios'
import { fetchCsrfToken } from './csrfService'

const soloDrillService = {
  // Limits & purchase
  getLimits: () => axios.get('/api/solo-drill/limits'),
  purchaseDrills: async () => {
    await fetchCsrfToken()
    return axios.post('/api/solo-drill/purchase')
  },

  // Session
  // Session
  startSession: async (category, loadout) => {
    await fetchCsrfToken()
    return axios.post('/api/solo-drill/start', { category, loadout })
  },
  getSession: (sessionId) => axios.get(`/api/solo-drill/session/${sessionId}`),

  // Forge
  startForge: (sessionId) => axios.post(`/api/solo-drill/session/${sessionId}/forge/start`),
  submitForgeAnswer: (sessionId, data) => axios.post(`/api/solo-drill/session/${sessionId}/forge/answer`, data),
  advanceForge: (sessionId) => axios.post(`/api/solo-drill/session/${sessionId}/forge/next`),

  // Quiz
  getQuizQuestions: (sessionId) => axios.get(`/api/solo-drill/session/${sessionId}/quiz`),
  submitQuiz: (sessionId, responses) => axios.post(`/api/solo-drill/session/${sessionId}/quiz/submit`, { responses }),

  // Meta
  getCategories: () => axios.get('/api/solo-drill/categories'),
  getStats: () => axios.get('/api/solo-drill/stats'),
  getHistory: (page = 1, limit = 10) => axios.get(`/api/solo-drill/history?page=${page}&limit=${limit}`),
}

export default soloDrillService
