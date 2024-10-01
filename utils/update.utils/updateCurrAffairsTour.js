const TournamentQuestion = require('../../model/tournamentQuestionSchema')

async function updateCurrentAffairsQuestions() {
  try {
    const questions = [
      {
        question:
          "Which country successfully landed its spacecraft on the Moon's south pole in August 2024?",
        hindiQuestion:
          'अगस्त 2024 में किस देश ने चंद्रमा के दक्षिणी ध्रुव पर अपना अंतरिक्ष यान सफलतापूर्वक उतारा?',
        options: {
          a: 'India',
          b: 'China',
          c: 'Russia',
          d: 'Japan',
        },
        hindiOptions: {
          a: 'भारत',
          b: 'चीन',
          c: 'रूस',
          d: 'जापान',
        },
        correctAnswer: 'a',
        category: 'current affairs',
        difficulty: '0.6',
      },
      {
        question:
          'Which global tech company announced its revolutionary AI-powered smart contact lenses in July 2024?',
        hindiQuestion:
          'जुलाई 2024 में किस वैश्विक तकनीकी कंपनी ने अपने क्रांतिकारी AI-संचालित स्मार्ट कॉन्टैक्ट लेंस की घोषणा की?',
        options: {
          a: 'Apple',
          b: 'Google',
          c: 'Microsoft',
          d: 'Meta',
        },
        hindiOptions: {
          a: 'एप्पल',
          b: 'गूगल',
          c: 'माइक्रोसॉफ्ट',
          d: 'मेटा',
        },
        correctAnswer: 'b',
        category: 'current affairs',
        difficulty: '0.7',
      },
      {
        question: 'Which country hosted the 2024 Summer Olympics?',
        hindiQuestion: '2024 के ग्रीष्मकालीन ओलंपिक की मेजबानी किस देश ने की?',
        options: {
          a: 'United States',
          b: 'Japan',
          c: 'France',
          d: 'Australia',
        },
        hindiOptions: {
          a: 'संयुक्त राज्य अमेरिका',
          b: 'जापान',
          c: 'फ्रांस',
          d: 'ऑस्ट्रेलिया',
        },
        correctAnswer: 'c',
        category: 'current affairs',
        difficulty: '0.5',
      },
      {
        question:
          'Which renewable energy source surpassed coal in global electricity production for the first time in 2024?',
        hindiQuestion:
          '2024 में किस नवीकरणीय ऊर्जा स्रोत ने वैश्विक बिजली उत्पादन में पहली बार कोयले को पीछे छोड़ दिया?',
        options: {
          a: 'Solar',
          b: 'Wind',
          c: 'Hydroelectric',
          d: 'Geothermal',
        },
        hindiOptions: {
          a: 'सौर',
          b: 'पवन',
          c: 'जलविद्युत',
          d: 'भूतापीय',
        },
        correctAnswer: 'a',
        category: 'current affairs',
        difficulty: '0.8',
      },
      {
        question:
          'Which African country became the first to completely eradicate malaria in 2024?',
        hindiQuestion:
          '2024 में कौन सा अफ्रीकी देश मलेरिया को पूरी तरह से खत्म करने वाला पहला देश बना?',
        options: {
          a: 'Nigeria',
          b: 'Kenya',
          c: 'Ghana',
          d: 'Rwanda',
        },
        hindiOptions: {
          a: 'नाइजीरिया',
          b: 'केन्या',
          c: 'घाना',
          d: 'रवांडा',
        },
        correctAnswer: 'd',
        category: 'current affairs',
        difficulty: '0.9',
      },
    ]
    const creationDate = new Date('2024-08-01T00:00:00Z')
    for (let questionData of questions) {
      const question = new TournamentQuestion({
        ...questionData,
        options: {
          a: {
            text: questionData.options.a,
            hindiText: questionData.hindiOptions.a,
          },
          b: {
            text: questionData.options.b,
            hindiText: questionData.hindiOptions.b,
          },
          c: {
            text: questionData.options.c,
            hindiText: questionData.hindiOptions.c,
          },
          d: {
            text: questionData.options.d,
            hindiText: questionData.hindiOptions.d,
          },
        },

        difficulty: parseFloat(questionData.difficulty),
        createdAt: creationDate,
      })

      // Set the correctAnswer to the ObjectId of the correct option
      question.correctAnswer = question.options[questionData.correctAnswer]._id

      await question.save()
      console.log(`Added question: ${question.question}`)
    }
    console.log('All questions added successfully')
  } catch (error) {
    console.error('Update failed:', error)
  }
}

updateCurrentAffairsQuestions()
