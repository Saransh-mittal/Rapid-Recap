// notificationTemplates.js

// HTML template for society or circle upgrade notification
const societyOrCircleUpgradeTemplate = (societyOrCircleName, type) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #4CAF50;">Congratulations on Your ${
        type.charAt(0).toUpperCase() + type.slice(1)
      } Upgrade!</h2>
      <p>You have successfully upgraded your <strong>${type}</strong> to <strong>${societyOrCircleName}</strong>.</p>
      <p>Keep up the great work and continue advancing!</p>
      <footer style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
        <p style="color: #777;">Powered by Our App</p>
      </footer>
    </div>
  `
}

// HTML template for Quin boost unlock notification
const quinBoostUnlockTemplate = boostMultiplier => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quin Boost Notification - Majestic Edition</title>
    <style>
        body {
            background-color: #121212;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .notification-container {
            font-family: 'Trajan Pro', 'Cinzel', serif;
            max-width: 400px;
            padding: 30px;
            border-radius: 12px;
            background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1),
                        inset 0 0 15px rgba(255, 215, 0, 0.1);
            color: #e0e0e0;
            position: relative;
            overflow: hidden;
        }
        .notification-container::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0) 70%);
            opacity: 0.5;
            animation: shimmer 10s infinite linear;
        }
        @keyframes shimmer {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .notification-title {
            color: #FFD700;
            font-size: 28px;
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .notification-content {
            line-height: 1.6;
            text-align: center;
        }
        .boost-highlight {
            font-weight: bold;
            color: #FFD700;
            font-size: 1.2em;
        }
        .notification-footer {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,215,0,0.3);
            font-size: 12px;
            color: #a0a0a0;
            text-align: center;
        }
        .icon-crown {
            display: block;
            font-size: 36px;
            margin-bottom: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="notification-container">
    <span >👑</span>
        <h2 class="notification-title">Quin Boost Activated</h2>
        <div class="notification-content">
            <p>Your exceptional performance has unlocked a <span class="boost-highlight">${boostMultiplier}x Quin Boost</span> for your next quiz attempt!</p>
            <p><em>Harness this power wisely to elevate your RQM score to new heights.</em></p>
        </div>
        <footer class="notification-footer">
            <p>Empowered by Rapid Recap</p>
        </footer>
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
  userWeeklyReportInboxTemplate,
}
