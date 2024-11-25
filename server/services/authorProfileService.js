// File: server/services/authorProfileService.js

const OpenAI = require('openai')
const cache = require('memory-cache')

class AuthorProfileService {
  static async generateAuthorProfile(category) {
    const cacheKey = `author-${category}`
    const cachedProfile = cache.get(cacheKey)
    if (cachedProfile) return cachedProfile

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const prompt = `Generate a brief but credible author bio for a specialized journalist/expert in ${category}. Include:
    1. Full name
    2. Professional title
    3. Years of experience (10-20 years)
    4. Areas of expertise
    5. Relevant educational background

    Format as JSON:
    {
      "name": "Full Name",
      "title": "Professional Title",
      "experience": "Brief experience description",
      "expertise": "Main area of expertise",
      "education": "Relevant degree",
      "yearsInField": "Number of years"
    }

    Keep it factual and professional.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      })

      const profile = JSON.parse(completion.choices[0].message.content)
      cache.put(cacheKey, profile, 7 * 24 * 60 * 60 * 1000) // Cache for 7 days
      return profile
    } catch (error) {
      console.error('Error generating author profile:', error)
      return {
        name: 'Rapid Recap Editorial Team',
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Editor`,
        experience: `Specialized in ${category} coverage`,
        expertise: category,
        education: 'Advanced Degree in Journalism',
        yearsInField: '15',
      }
    }
  }

  static generateAuthorSchema(profile) {
    return {
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.title,
      description: `${profile.experience}. ${profile.yearsInField} years of expertise in ${profile.expertise}.`,
      knowsAbout: [profile.expertise],
      hasCredential: profile.education,
      affiliation: {
        '@type': 'Organization',
        name: 'Rapid Recap',
        url: 'https://www.rapidrecap.co.in',
      },
      worksFor: {
        '@type': 'Organization',
        name: 'Rapid Recap',
      },
    }
  }
}

module.exports = AuthorProfileService
