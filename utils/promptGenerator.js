const generatePrompt = (article, theme) => {
  let themeSpecificInstructions = ''

  switch (theme) {
    case 'indian_mythology':
      themeSpecificInstructions = `
        Prioritize using elements and characters from the Mahabharata and Ramayana epics.
        If possible, draw parallels between the article's content and events or lessons from these epics.
        For example, you could relate leadership concepts to characters like Lord Krishna or Lord Rama,
        or compare challenges to those faced by the Pandavas or Sita.`
      break
    case 'mystic_world':
      themeSpecificInstructions = `
        Prioritize using elements and characters from the Harry Potter series, Marvel Cinematic Universe (MCU),
        and DC Extended Universe (DCEU). For instance, you could relate scientific concepts to magic spells
        from Harry Potter, compare historical figures to superheroes from Marvel or DC, or use the concept of
        different realms or universes to explain complex ideas.`
      break
    case 'space':
      themeSpecificInstructions = `
        Use popular space exploration missions like Apollo, Mars rovers, or the International Space Station
        as reference points. Incorporate characters like astronauts, scientists, or even imagine friendly alien beings
        to explain complex space concepts.`
      break
    case 'greek_mythology':
      themeSpecificInstructions = `
        Prioritize using elements and characters from popular Greek myths such as the Odyssey, the labors of Hercules,
        or the tales of the Olympian gods. Draw parallels between the article's content and these mythological stories or characters.`
      break
    case 'bible_mythology':
      themeSpecificInstructions = `
        Focus on well-known Bible stories such as Noah's Ark, David and Goliath, or the Exodus.
        Use these stories and characters to create analogies that help explain the article's content in a relatable way.`
      break
    case 'scifi':
      themeSpecificInstructions = `
        Incorporate elements from popular science fiction works like Star Wars, Star Trek, or Doctor Who.
        Use concepts like time travel, advanced technology, or alien civilizations to make complex ideas more engaging and understandable.`
      break
  }

  const basePrompt = `Convert the following article into an engaging story for children aged 13+ years old. Remember all articles are current affairs so once upon a time will not look good so try not to use it. Try not to change much names or try to provide the original name if analogical name is used as a quiz is generated on the article and users need to give that quiz so they should know the original information .Use simple English that Indian kids can easily understand. Ensure that all information from the original article is retained. Theme: ${theme}.

Article:
${article.mainText}

Instructions:
1. Start with an attention-grabbing opening.
2. Incorporate elements of the chosen theme (${theme}) to make the story more engaging.
3. Break down complex concepts into simpler terms.
4. Use analogies and examples relevant for good experiences.
5. If (${theme}) has some big stories then if possible use only one story to explain the whole article.
6. Remember to keep the story under ${
    article.mainText.length * 1.1 < 2500 ? article.mainText.length * 1.1 : 2500
  } characters.
7. use ** to bold the important points.
8. If required use numerical numbering to explain the points for example 1,2,3,4,5,6,7,8,9,10 etc.
9. Return the content in the same language as the original article. Its very important if its in hindi than convert in hindi.

${themeSpecificInstructions}

Please provide the story:`

  return basePrompt
}

module.exports = { generatePrompt }
