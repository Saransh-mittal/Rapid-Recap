import axios from 'axios'

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const response = await axios.put(
      `/api/user/${userId}/preferences`,
      preferences,
    )
    return response.data
  } catch (error) {
    throw error
  }
}

export const completeOnboarding = async userId => {
  try {
    const response = await axios.put(`/api/user/${userId}/complete-onboarding`)
    return response.data
  } catch (error) {
    throw error
  }
}
