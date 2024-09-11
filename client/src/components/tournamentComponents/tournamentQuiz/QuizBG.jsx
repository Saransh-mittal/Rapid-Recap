import React from 'react'
import quizBg from '/images/tourBGDark.jpeg' // Adjust the path as necessary

const QuizBG = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${quizBg})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        zIndex: -1,
      }}
    />
  )
}

export default QuizBG
