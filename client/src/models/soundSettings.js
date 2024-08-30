// src/models/soundSettings.js

import noteMessageSound from '../assets/sounds/note-message.mp3'
import milestoneSound from '../assets/sounds/milestone.mp3'

export const SOUND_TYPES = {
  NOTE_MESSAGE: 'NoteMessage',
  MILESTONE: 'Milestone',
  CLICK: 'Click',
  QUIZ_SOUNDS: 'Quiz',
}

export const SOUND_FILES = {
  [SOUND_TYPES.NOTE_MESSAGE]: noteMessageSound,
  [SOUND_TYPES.MILESTONE]: milestoneSound,
}

export const DEFAULT_SOUND_SETTINGS = {
  [SOUND_TYPES.NOTE_MESSAGE]: true,
  [SOUND_TYPES.MILESTONE]: true,
  [SOUND_TYPES.CLICK]: true,
  [SOUND_TYPES.QUIZ_SOUNDS]: true,
}
