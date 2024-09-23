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

module.exports = {
  societyOrCircleUpgradeTemplate,
  quinBoostUnlockTemplate, // Export the new template
}
