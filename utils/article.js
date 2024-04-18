const natural = require("natural");
const OpenAI = require("openai");

const breakArticleIntoParagraphs = async (mainText) => {
  const tokenizer = new natural.SentenceTokenizer();
  // Use natural language processing to tokenize sentences
  const sentences = tokenizer.tokenize(mainText);

  // Break the sentences into three paragraphs
  const paragraphLength = Math.ceil(sentences.length / 3);
  const paragraphs = [];

  for (let i = 0; i < sentences.length; i += paragraphLength) {
    const paragraph = sentences.slice(i, i + paragraphLength).join(" ");
    paragraphs.push(paragraph);
  }
  return paragraphs;
};

const hindiConverter = async (article) => {
  const { title, author, mainText } = article;
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const prompt = `Title: ${title}\n Author: ${author}\n\n MainText: ${mainText}\n\n`;

    const instructions = `Instructions:
                                1. Translate the given text to Hindi.
                                2. Translate the title to hindi carefully.
                                3. Author is name of the author of the article, translate author name to hindi ,dont write its meaning.
                                4. Be very careful when translating MainText to hindi and it's meaning should be same as in english.
                                5. Break maintext in only 3 paragraphs.
                                6. Make a JSON object containing hindiTitle, hindiAuthor, and hindiMainText.
                                7.  Return the JSON object which contains the translated text and looks like :
                                {
                                  "hindiTitle": "translated title",
                                  "hindiAuthor": "translated author",
                                  "hindiMainText": {
                                    "para1": "translated paragraph1",
                                    "para2": "translated paragraph2",
                                    "para3": "translated paragraph3"
                                  }
                                }
                                `;

    let result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a hindi translator bot. You have to translate an article. You
                    have to follow the given instructions to translate the article.You have to 
                    return the response in the given JSON format.`,
        },
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    let response = JSON.parse(result.choices[0].message.content);
    let cnt = 3;
    while (
      (!response.hindiTitle ||
        !response.hindiAuthor ||
        !response.hindiMainText) &&
      cnt-- > 0
    ) {
      result = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a hindi translator bot. You have to translate an article. You
                    have to follow the given instructions to translate the article.You have to 
                    return the response in the given JSON format.`,
          },
          {
            role: "system",
            content: instructions,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      response = JSON.parse(result.choices[0].message.content);
    }
    return response;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  hindiConverter,
  breakArticleIntoParagraphs,
};
