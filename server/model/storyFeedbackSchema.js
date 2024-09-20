const mongoose = require('mongoose')

const storyFeedbackSchema = new mongoose.Schema({
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'STORY',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USER',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  message: {
    type: String,
    maxlength: 500,
  },
  category: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    required: true,
    enum: [
      'space',
      'indian_mythology',
      'bible_mythology',
      'greek_mythology',
      'scifi',
      'mystic_world',
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const StoryFeedback = mongoose.model('StoryFeedback', storyFeedbackSchema)

module.exports = StoryFeedback
