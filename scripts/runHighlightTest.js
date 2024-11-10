// const Article = require('../model/articleSchema')
const { decode } = require('html-entities')
const OpenAI = require('openai')
const processExtractedNews = async (news, category) => {
  const initialInstructions = `
   You are a professional news analyst and writer.

    Key Instructions:
    1. Create original analysis by combining insights from multiple viewpoints:
       - Local implications
       - Industry impact
       - Market trends
       - Historical context
       - Future implications

    2. Content Guidelines:
       - Use only 1-2 short factual quotes from the source (with attribution)
       - Focus on broader context and implications
       - Add relevant statistics or data from public sources
       - Include industry expert perspectives
       - Connect to related industry trends

    3. Structure Requirements:
       - Keep content between 800-1800 characters
       - Use unique phrasing and structure
       - Vary sentence patterns
       - Add subsections with unique angles
       - If you want to make a phrase or a word bold, use the markdown syntax ** on both sides of the word or phrase without space in between.

    4. Enhancement Guidelines:
       - Add relevant background information
       - Connect to broader industry trends
       - Discuss potential future impacts
       - Include market analysis where relevant
       - Connect to local or regional implications

    5. Remove irrelevant content like:
       - Social media share buttons
       - Advertisement text
       - Navigation elements
       - Website-specific elements
       - Unnecessary formatting
       - any irrelevant content or lines from the mainText that are not related to the article or title. This includes sections like "Also read," "Loading...," "Share to Facebook," "Share to Twitter," "Share to LinkedIn," "All rights reserved" "terms of use" "HT" "Any other news websites name or nav items related to those websites" and unanswered questions.

       Critical : The new article length should be same or less than the original article.Ensure that the returned JSON object includes all original fields.
  `

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const processedOutput = []

  for (let newsItem of news) {
    try {
      if (!newsItem || !newsItem.title || !newsItem.text) {
        throw new Error('Invalid news item structure')
      }

      const existingArticle = await Article.findOne({ title: newsItem.title })
      if (existingArticle) continue

      if (newsItem.text.length < 800) throw new Error('Text is too short')

      const decodedText = decode(newsItem.text)
      const decodedTitle = decode(newsItem.title)
      const promptPayload = {
        url: newsItem.url,
        dateTime: newsItem.publish_date,
        author: Array.isArray(newsItem.author)
          ? newsItem.author[0]
          : newsItem.author,
        title: decodedTitle,
        mainText: decodedText,
        imgURL: [newsItem.image],
        category: category,
      }
      const prompt = JSON.stringify(promptPayload)

      let output = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: initialInstructions },
          { role: 'user', content: prompt },
        ],
      })

      let res = JSON.parse(output.choices[0].message.content)

      res = {
        url: res.url || newsItem.url,
        dateTime: res.dateTime || newsItem.publish_date,
        author:
          res.author ||
          (Array.isArray(newsItem.author)
            ? newsItem.author[0]
            : newsItem.author),
        title: res.title || decodedTitle,
        mainText: res.mainText || decodedText,
        imgURL: res.imgURL || [newsItem.image],
        category: res.category || category,
      }

      if (res.mainText.length > 2000) {
        let lenOfInitialOutput = res.mainText.length
        const summarizationInstructions = `
    You are a summarizer summarize the news between 800 chars to 1800chars. Try to retain all the important information. Right now its ${lenOfInitialOutput} chars
  `
        output = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: summarizationInstructions },
            { role: 'user', content: res.mainText },
          ],
        })

        let mainText = output.choices[0].message.content

        res = {
          url: res.url || newsItem.url,
          dateTime: res.dateTime || newsItem.publish_date,
          author:
            res.author ||
            (Array.isArray(newsItem.author)
              ? newsItem.author[0]
              : newsItem.author),
          title: res.title || decodedTitle,
          mainText: mainText || decodedText,
          imgURL: res.imgURL || [newsItem.image],
          category: res.category || category,
        }
      }

      if (res.mainText.length < 800)
        throw new Error(`Text is too short : ${res.mainText.length} characters`)

      const articleCheck = await Article.findOne({ title: res.title })
      if (articleCheck) continue

      const avgReadTime = averageReadTime(res.mainText)
      res.avgReadTime = avgReadTime
      if (res.category !== 'top')
        try {
          const predictedCategory = await newsClassifierService.classifyNews(
            res.mainText,
          )
          res.category = predictedCategory || res.category
        } catch (error) {
          console.error(
            `Error classifying news item titled "${res.title}": ${error.message}`,
          )
        }

      const newArticle = new Article(res)
      await newArticle.save()
      hindiConverter(newArticle._id.toString())
        .then(() =>
          generateHighlightForArticle({
            articleId: newArticle._id.toString(),
            lang: 'hi',
          }).catch(error => {
            console.error('Generation failed:', error)
          }),
        )
        .catch(error => {
          console.error('Hindi conversion failed:', error)
        })

      generateHighlightForArticle({
        articleId: newArticle._id.toString(),
        lang: 'en',
      })
        .then(() => {
          generateKeywordsAndDescription(newArticle._id.toString()).catch(
            error => console.error('Generation failed:', error),
          )
        })
        .catch(error => {
          console.error('Generation failed:', error)
        })
      processedOutput.push(newArticle)
    } catch (error) {
      console.error(
        `Error processing news item titled "${newsItem.title}": ${error.message}`,
      )
    }
  }
  console.log('Processed news')
  return processedOutput
}

// {
//   url: newsItem.url,
//   dateTime: newsItem.publish_date,
//   author: Array.isArray(newsItem.author)
//     ? newsItem.author[0]
//     : newsItem.author,
//   title: decodedTitle,
//   mainText: decodedText,
//   imgURL: [newsItem.image],
//   category: category,
// }
const news = [
  {
    title:
      'Virat Kohli suffers major setback, falls behind Babar Azam and Mohammad Rizwan in latest ICC Rankings',
    url: '',
    publish_date: '2022-02-01',
    author: 'John Doe',
    image: '',
    category: 'top',
    text: `NEW DELHI: Top Indian batter Virat Kohli has faced a major setback after a lacklustre performance in the recent Test series against New Zealand.
Kohli struggled throughout the series, registering scores of 0, 70, 1, 17, 4, and 1 across six innings. This underwhelming performance played a significant role in India's crushing 3-0 series defeat to New Zealand.
As a result, Kohli has seen his position slide eight places further in the ICC Men's Test Batter Rankings.
More concerning is the fact that Kohli, currently ranked 22nd, is now finding himself below Pakistan's underperforming Babar Azam (ranked 17th) and Mohammad Rizwan (ranked 20th).
As the Border-Gavaskar Trophy approaches, Kohli's form will be pivotal.
Historically, he has been a force against Australia, with numerous standout performances that have defined his career.
His experience in Australian conditions and his aggressive style have often been instrumental in countering Australia's formidable bowling attack, but he'll need to rediscover that spark to give India a fighting chance.
While Kohli's ranking may have dipped, Rishabh Pant offers a glimmer of hope, having risen to No. 6 following his powerful innings in the third Test against New Zealand.
Yashasvi Jaiswal, despite a slight drop, remains in the top five at No. 4, suggesting that India's young guns may help bolster the batting lineup if Kohli continues to struggle.
Shubman Gill, too, moved up four places after his recent contributions, showing promise ahead of the Australian series.
Kohli's experience and past performances in the Border-Gavaskar Trophy will be critical to India's hopes, especially given the pace and spin threats posed by Australia on home turf.
However, it would be interesting to see how he manages to turn the tide.`,
  },
]
processExtractedNews(news, 'top')
