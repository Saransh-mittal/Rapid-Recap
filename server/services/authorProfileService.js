// File: server/services/authorProfileService.js

const path = require('path')
const fs = require('fs').promises

class AuthorProfileService {
  static authors = null
  static authorsPath = path.join(__dirname, '../data/authors.json')

  static async loadAuthors() {
    if (!this.authors) {
      try {
        const data = await fs.readFile(this.authorsPath, 'utf8')
        this.authors = JSON.parse(data)
      } catch (error) {
        console.error('Error loading authors:', error)
        // Fallback authors if file read fails
        this.authors = {
          default: {
            name: 'Rapid Recap Editorial Team',
            title: 'Senior Editor',
            experience: 'Extensive experience in digital journalism',
            expertise: 'General News and Current Affairs',
            education: 'Advanced Degree in Journalism',
            yearsInField: '15',
          },
        }
      }
    }
    return this.authors
  }

  static async generateAuthorProfile(category) {
    await this.loadAuthors()

    // Return the dedicated author for this category, or default if none exists
    return this.authors[category] || this.authors.default
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
        url: 'https://rapidrecap.ai',
      },
      worksFor: {
        '@type': 'Organization',
        name: 'Rapid Recap',
      },
    }
  }
}

module.exports = AuthorProfileService
