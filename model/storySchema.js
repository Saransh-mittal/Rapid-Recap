const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
  originalArticle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ARTICLE',
    required: true,
  },
  theme: {
    type: String,
    enum: [
      'space',
      'indian_mythology',
      'bible_mythology',
      'greek_mythology',
      'scifi',
      'mystic_world',
    ],
    required: true,
  },
  storyContent: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'en',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Story = mongoose.model('STORY', storySchema)

module.exports = Story
