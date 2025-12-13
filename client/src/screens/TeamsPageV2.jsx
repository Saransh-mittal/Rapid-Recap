// screens/TeamsPageV2.jsx
// V2 Teams Page - Premium enterprise gaming UI/UX

import React, { memo } from 'react'

// Direct import - V2 component includes its own header
import TeamDashboardV2 from '../components/quickClashComponents/team/TeamDashboardV2'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TeamsPageV2 = () => {
  return (
    <div className="relative z-10 w-full max-w-lg mx-auto pb-20 md:pb-8 md:max-w-4xl">
      {/* Team Dashboard V2 - Premium design with built-in header */}
      <TeamDashboardV2 />
    </div>
  )
}

TeamsPageV2.displayName = 'TeamsPageV2'

export default memo(TeamsPageV2)

