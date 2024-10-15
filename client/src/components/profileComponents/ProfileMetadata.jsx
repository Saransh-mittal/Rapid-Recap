import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

export const ProfileMetadata = ({ profile, userSocietyAndCircle }) => {
  const { t } = useTranslation('Profile')

  return (
    <Helmet>
      <title>
        {t('title', { name: profile?.inGameName, score: profile?.USER_IQ })}
      </title>
      <meta
        name="description"
        content={`Explore ${
          profile?.inGameName
        }'s Rapid Recap profile. IQ score: ${profile?.USER_IQ}, ${
          profile?.solvedQuizzes?.length
        } quizzes solved. Member of ${userSocietyAndCircle?.society} ${
          userSocietyAndCircle?.circle
            ? `and ${userSocietyAndCircle?.circle}`
            : ''
        }. View their progress and achievements!`}
      />
      <meta
        property="og:title"
        content={`${profile?.inGameName}'s Rapid Recap Profile`}
      />
      <meta
        property="og:description"
        content={`Check out ${
          profile?.inGameName
        }'s profile on Rapid Recap. IQ score: ${
          profile?.USER_IQ
        }, quizzes solved: ${
          profile?.solvedQuizzes?.length
        }. See their progress in ${userSocietyAndCircle?.society} ${
          userSocietyAndCircle?.circle
            ? `and ${userSocietyAndCircle?.circle}`
            : ''
        }.`}
      />
      <meta property="og:type" content="profile" />
      <meta
        property="og:url"
        content={`https://www.rapidrecap.co.in/profile/${profile?.inGameName}`}
      />
      <meta
        property="og:image"
        content={
          profile?.pic ||
          'http://res.cloudinary.com/dxstsrnbs/image/upload/v1712729332/ProfilePIcs/p7zujdgjs1m301vsss1q.png'
        }
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content={`${profile?.inGameName}'s Rapid Recap Profile`}
      />
      <meta
        name="twitter:description"
        content={`Explore ${profile?.inGameName}'s Rapid Recap profile. IQ score: ${profile?.USER_IQ}, ${profile?.solvedQuizzes?.length} quizzes solved. View their progress!`}
      />
      <meta
        name="twitter:image"
        content={
          profile?.pic ||
          'http://res.cloudinary.com/dxstsrnbs/image/upload/v1712729332/ProfilePIcs/p7zujdgjs1m301vsss1q.png'
        }
      />
      <link
        rel="canonical"
        href={`https://www.rapidrecap.co.in/profile/${profile?.inGameName}`}
      />
      <script type="application/ld+json">
        {`
        {
          "@context": "http://schema.org",
          "@type": "Person",
          "name": "${profile?.inGameName}",
          "url": "https://www.rapidrecap.co.in/profile/${profile?.inGameName}",
          "image": "${
            profile?.pic ||
            'http://res.cloudinary.com/dxstsrnbs/image/upload/v1712729332/ProfilePIcs/p7zujdgjs1m301vsss1q.png'
          }",
          "description": "Rapid Recap user with an IQ score of ${
            profile?.USER_IQ
          }",
          "affiliation": {
            "@type": "Organization",
            "name": "${userSocietyAndCircle?.society}"
          }
        }
      `}
      </script>
    </Helmet>
  )
}
