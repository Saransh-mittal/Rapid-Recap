// services/quickClashServices/quickClashTranslationService.js
const OpenAI = require('openai')
const QuickClashAnalysis = require('../../model/quickClashSchemas/quickClashAnalysisSchema')

/**
 * Translate analysis content from English to Hindi
 * @param {Object} params - Parameters for translation
 * @param {string} params.analysisId - ID of the analysis to translate
 * @returns {Promise<Object>} The translated analysis
 */
const translateAnalysisToHindi = async ({ analysisId }) => {
  try {
    // Find the analysis document
    const analysis = await QuickClashAnalysis.findById(analysisId)

    if (!analysis) {
      throw new Error('Analysis not found')
    }

    // Check if translation is already done
    if (
      analysis.translationStatus === 'completed' &&
      analysis.hindiTranslation &&
      analysis.hindiTranslation.challenger &&
      analysis.hindiTranslation.challenger.analysis &&
      analysis.hindiTranslation.challenger.analysis.strengths &&
      analysis.hindiTranslation.challenger.analysis.strengths.length > 0
    ) {
      console.log('Translation already exists, returning existing data')
      return analysis
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Extract text content to translate
    const contentToTranslate = {
      // Challenger content
      challenger: {
        performance: {
          difficultyInsight:
            analysis.challenger.performance?.difficultyInsight || '',
        },
        analysis: {
          strengths: analysis.challenger.analysis?.strengths || [],
          weaknesses: analysis.challenger.analysis?.weaknesses || [],
          recommendations: analysis.challenger.analysis?.recommendations || [],
        },
        learningPath: {
          focusAreas: analysis.challenger.learningPath?.focusAreas || [],
          topicSuggestions:
            analysis.challenger.learningPath?.topicSuggestions || [],
          nextSteps: analysis.challenger.learningPath?.nextSteps || [],
        },
      },
      // Opponent content
      opponent: {
        performance: {
          difficultyInsight:
            analysis.opponent.performance?.difficultyInsight || '',
        },
        analysis: {
          strengths: analysis.opponent.analysis?.strengths || [],
          weaknesses: analysis.opponent.analysis?.weaknesses || [],
          recommendations: analysis.opponent.analysis?.recommendations || [],
        },
        learningPath: {
          focusAreas: analysis.opponent.learningPath?.focusAreas || [],
          topicSuggestions:
            analysis.opponent.learningPath?.topicSuggestions || [],
          nextSteps: analysis.opponent.learningPath?.nextSteps || [],
        },
      },
      // Engagement content
      engagement: {
        victoryMeme: analysis.engagement?.victoryMeme || '',
        competitiveTaunt: analysis.engagement?.competitiveTaunt || '',
        wittyAnalysis: analysis.engagement?.wittyAnalysis || '',
        topicSuggestions: analysis.engagement?.topicSuggestions || [],
      },
    }

    // Setup prompt for OpenAI
    const prompt = `
    Translate the following Quick Clash analysis content from English to Hindi:

    ${JSON.stringify(contentToTranslate, null, 2)}

    Provide a high-quality, natural-sounding Hindi translation that preserves the meaning,
    sentiment, and educational value of the English text. Keep gaming and educational terminology
    appropriate for Hindi-speaking users.

    Return only the JSON structure with the Hindi translations.
    The response should follow the exact same structure as the input.
    `

    // Make OpenAI request
    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a high-quality English to Hindi translator specializing in educational and gaming content.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more accurate translations
    })

    // Parse the translated content
    const translatedContent = JSON.parse(result.choices[0].message.content)

    // Update the analysis document with translations
    analysis.hindiTranslation = translatedContent
    analysis.translationStatus = 'completed'
    await analysis.save()

    console.log('Successfully translated analysis to Hindi')
    return analysis
  } catch (error) {
    console.error('Error translating analysis to Hindi:', error)

    // Update analysis document with error status
    try {
      const analysis = await QuickClashAnalysis.findById(analysisId)
      if (analysis) {
        analysis.translationStatus = 'failed'
        await analysis.save()
      }
    } catch (updateError) {
      console.error('Error updating analysis status:', updateError)
    }

    throw error
  }
}

module.exports = {
  translateAnalysisToHindi,
}
