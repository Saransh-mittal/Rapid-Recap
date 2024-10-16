// notificationTemplates.js

// HTML template for society or circle upgrade notification
const societyOrCircleUpgradeTemplate = (societyOrCircleName, type) => {
  return `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 15px;
            background-color: #1a1a1a;
            font-family: 'Arial', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(145deg, #2d2d2d, #212121);
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            padding: clamp(20px, 5vw, 40px) clamp(15px, 4vw, 30px);
            text-align: center;
        }

        .header h2 {
            color: #ffffff;
            margin: 0;
            font-size: clamp(22px, 4vw, 28px);
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .content {
            padding: clamp(20px, 5vw, 40px) clamp(15px, 4vw, 30px);
            color: #e0e0e0;
        }

        .upgrade-details {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: clamp(15px, 4vw, 20px);
            margin: clamp(15px, 4vw, 20px) 0;
            border-left: 4px solid #4CAF50;
        }

        .highlight {
            color: #4CAF50;
            font-weight: 600;
        }

        .footer {
            background: #1a1a1a;
            padding: clamp(15px, 4vw, 20px);
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer p {
            color: #666;
            margin: 0;
            font-size: clamp(12px, 3.5vw, 14px);
        }

        .celebration-icon {
            font-size: clamp(30px, 6vw, 40px);
            margin-bottom: clamp(15px, 4vw, 20px);
        }

        .upgrade-name {
            font-size: clamp(20px, 5vw, 24px);
            text-align: center;
            padding: 10px 0;
        }

        p {
            font-size: clamp(14px, 3.5vw, 16px);
            line-height: 1.6;
            margin-bottom: 15px;
        }

        @media screen and (max-width: 480px) {
            body {
                padding: 10px;
            }

            .email-container {
                border-radius: 10px;
            }

            .upgrade-details {
                border-left-width: 3px;
            }

            .content {
                padding: 20px 15px;
            }

            p:last-child {
                margin-bottom: 0;
            }
        }

        @media (hover: hover) {
            .email-container {
                transition: transform 0.3s ease;
            }

            .email-container:hover {
                transform: translateY(-5px);
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="celebration-icon">🎉</div>
            <h2>Achievement Unlocked</h2>
        </div>
        <div class="content">
            <div class="upgrade-details">
                <p>Congratulations on your advancement to</p>
                <p class="upgrade-name highlight">${societyOrCircleName}</p>
                <p>Your commitment to excellence has elevated your <span class="highlight">${type}</span> status to new heights. This achievement reflects your dedication and outstanding contributions.</p>
            </div>
            <p style="text-align: center;">Continue your journey of excellence and discover the exclusive benefits that await you.</p>
        </div>
        <div class="footer">
            <p>Powered by Rapid Recap</p>
        </div>
    </div>
</body>
</html>
  `
}

// HTML template for Quin boost unlock notification
const quinBoostUnlockTemplate = boostMultiplier => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                margin: 0;
                padding: 15px;
                background-color: #1a1a1a;
                font-family: 'Arial', sans-serif;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .email-container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(145deg, #2d2d2d, #212121);
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }

            .header {
                background: linear-gradient(135deg, #4a148c, #880e4f);
                padding: clamp(20px, 5vw, 40px) clamp(15px, 4vw, 30px);
                text-align: center;
            }

            .header h2 {
                color: #ffffff;
                margin: 0;
                font-size: clamp(22px, 4vw, 28px);
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
            }

            .content {
                padding: clamp(20px, 5vw, 40px) clamp(15px, 4vw, 30px);
                color: #e0e0e0;
            }

            .boost-details {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: clamp(15px, 4vw, 20px);
                margin: clamp(15px, 4vw, 20px) 0;
                border-left: 4px solid #9c27b0;
            }

            .highlight {
                color: #9c27b0;
                font-weight: 600;
            }

            .footer {
                background: #1a1a1a;
                padding: clamp(15px, 4vw, 20px);
                text-align: center;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .footer p {
                color: #666;
                margin: 0;
                font-size: clamp(12px, 3.5vw, 14px);
            }

            .boost-icon {
                font-size: clamp(30px, 6vw, 40px);
                margin-bottom: clamp(15px, 4vw, 20px);
            }

            .boost-multiplier {
                font-size: clamp(20px, 5vw, 24px);
                text-align: center;
                padding: 10px 0;
            }

            p {
                font-size: clamp(14px, 3.5vw, 16px);
                line-height: 1.6;
                margin-bottom: 15px;
            }

            @media screen and (max-width: 480px) {
                body {
                    padding: 10px;
                }

                .email-container {
                    border-radius: 10px;
                }

                .boost-details {
                    border-left-width: 3px;
                }

                .content {
                    padding: 20px 15px;
                }

                p:last-child {
                    margin-bottom: 0;
                }
            }

            @media (hover: hover) {
                .email-container {
                    transition: transform 0.3s ease;
                }

                .email-container:hover {
                    transform: translateY(-5px);
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="boost-icon">👑⚡</div>
                <h2>Quin Boost Activated!</h2>
            </div>
            <div class="content">
                <div class="boost-details">
                    <p>Congratulations on your exceptional performance!</p>
                    <p class="boost-multiplier highlight">${boostMultiplier}x Boost Unlocked</p>
                    <p>Your next quiz attempt will receive a powerful <span class="highlight">Quin Boost</span>!</p>
                </div>
                <p style="text-align: center;">Harness this power wisely to elevate your RQM score to new heights.</p>
                <p style="text-align: center;">This boost will be applied to your next quiz attempt. Make it count!</p>
            </div>
            <div class="footer">
                <p>Powered by Rapid Recap</p>
            </div>
        </div>
    </body>
    </html>
  `
}

const streakSurgeTemplate = streakCount => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                margin: 0;
                padding: 15px;
                background-color: #1a1a1a;
                font-family: 'Arial', sans-serif;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .email-container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(145deg, #2d2d2d, #212121);
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }

            .header {
                background: linear-gradient(135deg, #ff4e50, #f9d423);
                padding: clamp(20px, 5vw, 40px) clamp(15px, 4vw, 30px);
                text-align: center;
            }

            .header h2 {
                color: #ffffff;
                margin: 0;
                font-size: clamp(22px, 4vw, 28px);
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
            }

            .content {
                padding: clamp(20px, 5vw, 40px) clamp(15px, 4vw, 30px);
                color: #e0e0e0;
            }

            .boost-details {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: clamp(15px, 4vw, 20px);
                margin: clamp(15px, 4vw, 20px) 0;
                border-left: 4px solid #f9d423;
            }

            .highlight {
                color: #f9d423;
                font-weight: 600;
            }

            .footer {
                background: #1a1a1a;
                padding: clamp(15px, 4vw, 20px);
                text-align: center;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .footer p {
                color: #666;
                margin: 0;
                font-size: clamp(12px, 3.5vw, 14px);
            }

            .streak-icon {
                font-size: clamp(30px, 6vw, 40px);
                margin-bottom: clamp(15px, 4vw, 20px);
            }

            .streak-count {
                font-size: clamp(20px, 5vw, 24px);
                text-align: center;
                padding: 10px 0;
            }

            p {
                font-size: clamp(14px, 3.5vw, 16px);
                line-height: 1.6;
                margin-bottom: 15px;
            }

            @media screen and (max-width: 480px) {
                body {
                    padding: 10px;
                }

                .email-container {
                    border-radius: 10px;
                }

                .boost-details {
                    border-left-width: 3px;
                }

                .content {
                    padding: 20px 15px;
                }

                p:last-child {
                    margin-bottom: 0;
                }
            }

            @media (hover: hover) {
                .email-container {
                    transition: transform 0.3s ease;
                }

                .email-container:hover {
                    transform: translateY(-5px);
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="streak-icon">🔥</div>
                <h2>Streak Surge Activated!</h2>
            </div>
            <div class="content">
                <div class="boost-details">
                    <p>Congratulations on your incredible</p>
                    <p class="streak-count highlight">${streakCount}-Day Streak</p>
                    <p>Your dedication has unlocked a special <span class="highlight">Streak Surge</span> boost!</p>
                </div>
                <p style="text-align: center;">Today, all your RQM scores will be boosted by <span class="highlight">1.5x</span>!</p>
                <p style="text-align: center;">Keep up the amazing work and watch your scores soar!</p>
            </div>
            <div class="footer">
                <p>Powered by Rapid Recap</p>
            </div>
        </div>
    </body>
    </html>
  `
}

const userWeeklyReportInboxTemplate = {
  from: 'rapidrecap2k23@gmail.com',
  subject: 'Your Rapid Recap Weekly Report',
  html: ({
    name,
    inGameName,
    society,
    circle,
    iqScore,
    iqChange,
    averageRQM,
    rqmChange,
    experienceLevel,
    ongoingSeason,
    totalQuizzesThisWeek,
    quizDistribution,
    tournamentRank,
    tournamentScore,
    topPlayers,
    categoryPerformance,
    rank,
    participatedInTournament,
  }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapid Recap Weekly Report</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      font-size: 14px;
      line-height: 1.4;
      background-color: #121212;
      color: #ffffff;
    }
    table { border-collapse: collapse; }
    h1, h2, h3 {
      color: #bb86fc;
      margin-top: 0;
      margin-bottom: 10px;
    }
    .container {
      max-width: 100%;
      margin: 0 auto;
      background-color: #1e1e1e;
    }
    .header {
      background: linear-gradient(135deg, #4b0082, #9c27b0);
      color: #ffffff;
      padding: 15px 10px;
      text-align: center;
    }
    .header h1 {
      font-size: 24px;
      margin: 0;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }
    .content { padding: 15px 10px; }
    .section { margin-bottom: 20px; }
    .card {
      background-color: #2c2c2c;
      border: 1px solid #3d3d3d;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric {
      display: inline-block;
      margin-right: 15px;
      margin-bottom: 10px;
    }
    .metric-label {
      font-weight: bold;
      color: #bb86fc;
      font-size: 12px;
    }
    .metric-value {
      font-size: 14px;
      color: #03dac6;
    }
    .chart {
      background-color: #333333;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .footer {
      background-color: #121212;
      color: #ffffff;
      padding: 15px;
      text-align: center;
      font-size: 12px;
    }
    .chart-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 5px;
    }
    .chart-bar {
      background: linear-gradient(to top, #6a1b9a, #9c27b0);
      text-align: center;
      color: #ffffff;
      font-weight: bold;
      border-radius: 4px 4px 0 0;
      position: relative;
    }
    .chart-value {
      position: absolute;
      top: -20px;
      left: 0;
      right: 0;
      color: #03dac6;
      font-size: 10px;
      font-weight: bold;
    }
    .chart-label {
      text-align: center;
      color: #e0e0e0;
      font-size: 10px;
      padding-top: 5px;
    }
    .personal-info { font-size: 14px; }
    .personal-info .name { font-weight: bold; }
    .personal-info .in-game-name {
      color: #bb86fc;
      margin-top: 2px;
    }
    .personal-info .society-circle { color: #03dac6; }
    .top-players-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 5px;
    }
    .top-players-table td { padding: 5px 0; }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" class="container">
    <tr>
      <td class="header">
        <h1>Rapid Recap</h1>
        <p style="font-size: 16px;">Weekly Report Season ${ongoingSeason}</p>
      </td>
    </tr>
    <tr>
      <td class="content">
        <div class="section">
          <h2 style="font-size: 18px;">Main Report</h2>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td width="50%" valign="top">
                <div class="card">
                  <h3 style="font-size: 16px;">Personal Info</h3>
                  <div class="personal-info">
                    <p class="name" style="margin: 0;">${name}</p>
                    <p class="in-game-name" style="margin: 0;">@${inGameName}</p>
                    <p class="society-circle" style="margin: 0;"><strong>Society:</strong> ${society}</p>
                    <p class="society-circle" style="margin: 0;"><strong>Circle:</strong> ${circle}</p>
                  </div>
                </div>
              </td>
              <td width="50%" valign="top">
                <div class="card">
                  <h3 style="font-size: 16px;">Performance Metrics</h3>
                  <div class="metric">
                    <div class="metric-label">IQ Score</div>
                    <div class="metric-value">${iqScore} (${iqChange})</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Avg RQM</div>
                    <div class="metric-value">${averageRQM} (${rqmChange})</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Exp Level</div>
                    <div class="metric-value">${experienceLevel}</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Rank</div>
                    <div class="metric-value">${rank}</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Quizzes</div>
                    <div class="metric-value">${totalQuizzesThisWeek}</div>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div class="section">
          <h2 style="font-size: 18px;">Quiz Distribution</h2>
          <div class="chart">
            <table class="chart-table">
              <tr>
                ${quizDistribution
                  ?.map(
                    item => `
                  <td style="vertical-align: bottom; height: 100px;">

                    <div class="chart-bar" style="height: ${
                      item.height * 0.4
                    }px;"><div class="chart-value">${item.value}</div></div>
                  </td>
                `,
                  )
                  ?.join('')}
              </tr>
              <tr>
                ${quizDistribution
                  ?.map(
                    item => `
                  <td class="chart-label">${item.label}</td>
                `,
                  )
                  ?.join('')}
              </tr>
            </table>
          </div>
        </div>
        <div class="section">
          <h2 style="font-size: 18px;">Tournament Report</h2>
          <div class="card">
            <h3 style="font-size: 16px;">Top 5 Players</h3>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="top-players-table">
              <tr>
                <th align="left" style="font-size: 12px; padding-bottom: 5px;">Rank</th>
                <th align="left" style="font-size: 12px; padding-bottom: 5px;">Player</th>
                <th align="left" style="font-size: 12px; padding-bottom: 5px;">Score</th>
              </tr>
              ${topPlayers
                ?.map(
                  (player, index) => `
                <tr>
                  <td style="font-size: 12px;">${index + 1}</td>
                  <td style="font-size: 12px;">${player.name}<br>@${
                    player.inGameName
                  }</td>
                  <td style="font-size: 12px;">${player.score}</td>
                </tr>
              `,
                )
                ?.join('')}
            </table>
            <p style="font-size: 14px; color: #ffffff; margin: 5px 0;"><strong>Your Rank:</strong> ${tournamentRank}</p>
            <p style="font-size: 14px; color: #ffffff; margin: 5px 0;"><strong>Your Score:</strong> ${tournamentScore}</p>
          </div>
        </div>
        <div class="section">
          <h3 style="font-size: 16px;">Your Performance by Category</h3>
          ${(() => {
            if (!participatedInTournament) {
              return `
              <div class="card" style="text-align: center; padding: 10px;">
                <p style="font-size: 14px; color: #bb86fc; margin: 0;">You didn't participate in this tournament.</p>
                <p style="font-size: 12px; margin: 5px 0;">Join the next tournament to see your performance here!</p>
              </div>
              `
            } else if (categoryPerformance && categoryPerformance.length > 0) {
              return `
              <div class="chart">
                <table class="chart-table">
                  <tr>
                    ${categoryPerformance
                      .map(
                        category => `
                      <td style="vertical-align: bottom; height: 100px;">

                        <div class="chart-bar" style="height: ${
                          category.height * 0.3
                        }px;"><div class="chart-value">RQM: ${
                          category.value
                        }</div></div>
                      </td>
                    `,
                      )
                      .join('')}
                  </tr>
                  <tr>
                    ${categoryPerformance
                      .map(
                        category => `
                      <td class="chart-label">${category.name}</td>
                    `,
                      )
                      .join('')}
                  </tr>
                </table>
              </div>
              `
            } else {
              return `
              <div class="card" style="text-align: center; padding: 10px;">
                <p style="font-size: 14px; color: #bb86fc; margin: 0;">You didn't attempt any category quizzes in this tournament.</p>
                <p style="font-size: 12px; margin: 5px 0;">Try different categories in the next tournament to see your performance here!</p>
              </div>
              `
            }
          })()}
        </div>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p style="font-size: 12px; margin: 0;">Rapid Recap Inc</p>
        <p style="font-size: 10px; margin: 0;">Jaipur, India</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
}

module.exports = {
  societyOrCircleUpgradeTemplate,
  quinBoostUnlockTemplate, // Export the new template
  streakSurgeTemplate,
  userWeeklyReportInboxTemplate,
}
