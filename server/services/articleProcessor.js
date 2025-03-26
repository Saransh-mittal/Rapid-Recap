// services/articleProcessor.js

const { makeGPTRequest } = require('../utils/openai')
const { decode } = require('html-entities')
const asyncHandler = require('express-async-handler')

const validateHindiResult = result => {
  console.log('\n🔍 Validating Hindi result...')

  // Check if translation exists
  if (!result.translation) {
    throw new Error('Missing translation structure in response')
  }

  // Validate translation fields
  if (
    !result.translation.title ||
    !result.translation.author ||
    !result.translation.paragraphs
  ) {
    throw new Error('Missing required fields in translation')
  }

  // Validate paragraphs
  if (
    !Array.isArray(result.translation.paragraphs) ||
    result.translation.paragraphs.length < 2
  ) {
    throw new Error('Translation must have atleast 2 paragraphs')
  }

  // Validate that paragraphs are not empty
  if (
    result.translation.paragraphs.some(
      para => !para || para.trim().length === 0,
    )
  ) {
    throw new Error('Translation paragraphs cannot be empty')
  }

  console.log('✅ Hindi validation passed')
  return true
}

const processEnglishContent = asyncHandler(
  async (articleData, retryCount = 0) => {
    const MAX_RETRIES = 1
    const startTime = Date.now()
    console.log(`\n📝 Processing English content for: "${articleData.title}"`)

    try {
      // Step 1: Generate Content First
      const contentInstructions = `You are a professional news analyst and writer. Your goal is to create insightful and concise analysis based on the provided news article.

    **Content Length:** The final content (within "mainText") MUST be between 800 and 1800 characters. This is a critical requirement.

    **Analysis Focus:** Combine the following aspects in your analysis:
    - How this news impacts the local area or community.
    - The effects or changes it might bring to the relevant industry.
    - Any noticeable trends in the market related to this news.
    - Important historical context that helps understand the news.
    - What this news might mean for the future.

    **Writing Style:**
    - Include only one or two short, factual quotes from the original article. Make sure to attribute the quotes properly.
    - Concentrate on the bigger picture, explaining the broader context and implications.
    - Include relevant statistics or data points if they strengthen the analysis.
    - Add insights from experts or informed sources (you can invent these if necessary, but make them sound plausible).
    - Connect the news to current trends happening in the industry.
    - Use **bold text** to highlight key terms or ideas.
    - Write using varied sentence structures and avoid repeating the same phrasing.
    - Think of adding a few short sections, each exploring a different angle of the analysis.

    **Output Format:** Return your response as a JSON object with the following structure:
    \`\`\`json
    {
      "processedContent": {
        "title": "Your insightful title here",
        "mainText": "Your well-analyzed content here, between 800 and 1800 characters."
      }
    }
    \`\`\``

      const contentResult = await makeGPTRequest({
        messages: [
          { role: 'system', content: contentInstructions },
          {
            role: 'user',
            content: JSON.stringify({
              title: articleData.title,
              mainText: decode(articleData.mainText),
              category: articleData.category,
            }),
          },
        ],
        temperature: retryCount > 0 ? 0.5 : 0.3,
      })

      // Validate content
      if (
        !contentResult.processedContent?.title ||
        !contentResult.processedContent?.mainText
      ) {
        throw new Error('Missing required fields in processedContent')
      }

      const contentLength = contentResult.processedContent.mainText.length
      if (contentLength < 800 || contentLength > 2000) {
        // Keep the upper bound slightly higher for retries
        throw new Error(
          `Content length (${contentLength}) outside acceptable range (800-1800)`,
        )
      }

      // Step 2: Generate SEO separately
      const seoResult = await generateSEO({
        title: contentResult.processedContent.title,
        mainText: contentResult.processedContent.mainText,
        category: articleData.category,
      })

      const result = {
        processedContent: contentResult.processedContent,
        seo: seoResult,
      }

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`✅ English processing completed in ${processingTime}s`)

      return result
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(`⚠️ Retrying English content processing: ${error.message}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return processEnglishContent(articleData, retryCount + 1)
      }
      console.error('❌ English processing failed:', error.message)
      throw error
    }
  },
)

const generateSEO = asyncHandler(async (articleData, retryCount = 0) => {
  const MAX_RETRIES = 2 // More retries for SEO as it's smaller and faster
  console.log('\n🎯 Generating SEO metadata...')

  try {
    const seoInstructions = `You are an SEO expert. Generate SEO metadata for this article to improve its search engine visibility.

    **Requirements:**
    1. Create a list of 5 to 8 relevant keywords that people might use to search for this article.
    2. Write a concise and engaging description of the article, making sure it's under 150 characters long. This description should encourage people to click on the search result.
    3. Ensure the keywords and description are directly related to the main topics and themes of the article.
    4. The description should be informative and accurately represent the article's content.

    **Output Format:** Return ONLY a JSON structure like this:
    \`\`\`json
    {
      "keywords": ["keyword1", "keyword2", ...],
      "description": "Your short and informative description here"
    }
    \`\`\``

    const result = await makeGPTRequest({
      messages: [
        { role: 'system', content: seoInstructions },
        {
          role: 'user',
          content: JSON.stringify({
            title: articleData.title,
            mainText: articleData.mainText.substring(0, 1000), // Send shorter text for SEO
            category: articleData.category,
          }),
        },
      ],
      temperature: 0.3,
      max_tokens: 300, // Smaller context for faster, more focused response
    })

    // Validate SEO result
    if (!Array.isArray(result.keywords) || !result.description) {
      throw new Error('Invalid SEO structure')
    }

    if (result.keywords.length < 5 || result.keywords.length > 8) {
      throw new Error('Keywords count must be between 5 and 8')
    }

    if (result.description.length > 150) {
      throw new Error('Description length exceeds 150 characters')
    }

    console.log('✅ SEO generation successful')
    return result
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`⚠️ Retrying SEO generation: ${error.message}`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return generateSEO(articleData, retryCount + 1)
    }

    // If all retries fail, return a basic SEO structure based on the title
    console.log('⚠️ Using fallback SEO generation')
    return {
      keywords: [
        articleData.category,
        ...articleData.title
          .toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 3)
          .slice(0, 5),
      ],
      description: articleData.title,
    }
  }
})

const processHindiContent = asyncHandler(
  async (articleData, retryCount = 0) => {
    const MAX_RETRIES = 1
    const startTime = Date.now()
    console.log(
      `\n🔄 Processing Hindi translation for: "${articleData.processedContent.title}"`,
    )

    try {
      const instructions = `You are a professional Hindi translator. Your task is to translate English news content into Hindi that sounds natural and is easy for daily speakers to understand.

    **Translation Guidelines:**
    1. Translate the provided title and main text into Hindi. The Hindi should sound like everyday spoken language.
    2. Transliterate the author's name into Hindi.
    3. Divide the translated main text into exactly 3 distinct paragraphs.
    4. Ensure that all the information from the original English text is present in the translation.
    5. Keep the meaning of the original text intact during the translation process.
    6. Translate complete sentences rather than just individual words or phrases.

    **Output Format:** Return your translation as a JSON object with the following structure:
    \`\`\`json
    {
      "translation": {
        "title": "Hindi title here",
        "author": "Hindi author name here",
        "paragraphs": ["Paragraph 1 in Hindi", "Paragraph 2 in Hindi", "Paragraph 3 in Hindi"]
      }
    }
    \`\`\``

      const result = await makeGPTRequest({
        messages: [
          { role: 'system', content: instructions },
          {
            role: 'user',
            content: `Title: ${articleData.processedContent.title}\n Author: ${articleData.author}\n\n MainText: ${articleData.processedContent.mainText}\n\n`,
          },
        ],
        temperature: retryCount > 0 ? 0.5 : 0.3,
      })

      // Validate the result
      validateHindiResult(result)

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`✅ Hindi translation completed in ${processingTime}s`)

      return result
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(`⚠️ Retrying Hindi translation: ${error.message}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return processHindiContent(articleData, retryCount + 1)
      }
      console.error('❌ Hindi translation failed:', error.message)
      throw error
    }
  },
)

const processArticle = asyncHandler(async newsItem => {
  const startTime = Date.now()
  console.log('\n🚀 Starting article processing...')
  console.log(`📰 Article: "${newsItem.title}"`)

  // Initial validation
  if (!newsItem || !newsItem.title || !newsItem.text) {
    throw new Error('Invalid news item structure')
  }

  try {
    // Decode text content
    const decodedText = decode(newsItem.text)
    const decodedTitle = decode(newsItem.title)

    // Process English content
    const englishResult = await processEnglishContent({
      title: decodedTitle,
      mainText: decodedText,
      category: newsItem.category,
    })

    // Process Hindi content
    const hindiResult = await processHindiContent({
      processedContent: englishResult.processedContent,
      author: Array.isArray(newsItem.author)
        ? newsItem.author[0]
        : newsItem.author,
    })

    console.log('\n💾 Saving article to database...')

    // Prepare article data
    const articleData = {
      url: newsItem.url,
      dateTime: newsItem.publish_date || new Date().toISOString(),
      author: Array.isArray(newsItem.author)
        ? newsItem.author[0]
        : newsItem.author,
      title: englishResult.processedContent.title,
      mainText: englishResult.processedContent.mainText,
      hindiTitle: hindiResult.translation.title,
      hindiAuthor: hindiResult.translation.author,
      hindiMainText: hindiResult.translation.paragraphs,
      imgURL: [newsItem.image],
      category: newsItem.category,
      keywords: englishResult.seo.keywords,
      description: englishResult.seo.description,
    }
    console.log('✅ Article made successfully')

    console.log('\n🔍 Generating highlights asynchronously...')

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(
      `\n✨ Article processing completed in ${totalTime}s\n${'='.repeat(50)}`,
    )

    return articleData
  } catch (error) {
    console.error(`❌ Error processing article "${newsItem.title}":`, error)
    throw error
  }
})

module.exports = {
  processArticle,
}
