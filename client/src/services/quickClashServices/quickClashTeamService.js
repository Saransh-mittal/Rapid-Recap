import axios from 'axios'

const toggleToken = (useToken) => {
  if (useToken) {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export const quickClashTeamService = {
  /**
   * Join a team using a invite code
   * @param {string} teamCode - The invite code
   * @returns {Promise<Object>} Response data
   */
  joinTeamByCode: async (teamCode) => {
    // Explicitly get token to ensure we have the latest one
    const token = localStorage.getItem('token')
    const config = {}

    if (token) {
      config.headers = {
        'Authorization': `Bearer ${token}`
      }
    }

    // Also set default as a backup/side-effect
    toggleToken(true)

    const response = await axios.post('/api/quickClash/team/join', {
      teamCode
    }, config)

    return response.data
  }
}
