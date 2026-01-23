// client/src/screens/AnalyticsDashboard.jsx
// Quick Clash Validation Analytics Dashboard
// Enterprise-level analytics with Tailwind CSS

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RefreshCw, ArrowLeft, Users, Activity, Target, Zap, DoorOpen, TrendingUp } from 'lucide-react'

import {
  KPICard,
  VerdictBanner,
  RetentionChart,
  ViralTrendChart,
  BounceRateChart,
  FootfallChart,
  StreakDistribution,
  ConversionFunnel,
  DateRangePicker,
} from '../components/analytics'

import analyticsService from '../services/analyticsService'

/**
 * Analytics Dashboard Screen
 * Main dashboard for Quick Clash validation metrics
 */
const AnalyticsDashboard = () => {
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  // State
  const [days, setDays] = useState(30)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Data state
  const [overview, setOverview] = useState(null)
  const [footfall, setFootfall] = useState(null)
  const [retention, setRetention] = useState(null)
  const [engagement, setEngagement] = useState(null)
  const [streaks, setStreaks] = useState(null)
  const [viral, setViral] = useState(null)
  const [viralTrend, setViralTrend] = useState([])
  const [conversion, setConversion] = useState(null)

  // Per-section loading states for progressive loading
  const [loadingStates, setLoadingStates] = useState({
    overview: true,
    footfall: true,
    retention: true,
    engagement: true,
    streaks: true,
    viral: true,
    conversion: true,
  })

  // Helper to update a specific loading state
  const setLoadingState = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }))
  }

  /**
   * Fetch all analytics data progressively
   * Each section loads independently and shows data as it becomes available
   */
  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true)
    }
    setError(null)

    // Reset all loading states
    setLoadingStates({
      overview: true,
      footfall: true,
      retention: true,
      engagement: true,
      streaks: true,
      viral: true,
      conversion: true,
    })

    // Fetch overview (KPI cards) - highest priority
    analyticsService.getAnalyticsOverview(days)
      .then(res => {
        setOverview(res.data)
        setLoadingState('overview', false)
      })
      .catch(err => {
        console.error('[Analytics] Overview error:', err)
        setLoadingState('overview', false)
      })

    // Fetch footfall (Traffic chart)
    analyticsService.getFootfallMetrics(days)
      .then(res => {
        setFootfall(res.data)
        setLoadingState('footfall', false)
      })
      .catch(err => {
        console.error('[Analytics] Footfall error:', err)
        setLoadingState('footfall', false)
      })

    // Fetch retention (Retention chart)
    analyticsService.getRetentionMetrics(days)
      .then(res => {
        setRetention(res.data)
        setLoadingState('retention', false)
      })
      .catch(err => {
        console.error('[Analytics] Retention error:', err)
        setLoadingState('retention', false)
      })

    // Fetch engagement
    analyticsService.getEngagementMetrics(days)
      .then(res => {
        setEngagement(res.data)
        setLoadingState('engagement', false)
      })
      .catch(err => {
        console.error('[Analytics] Engagement error:', err)
        setLoadingState('engagement', false)
      })

    // Fetch streaks
    analyticsService.getStreakMetrics(days)
      .then(res => {
        setStreaks(res.data)
        setLoadingState('streaks', false)
      })
      .catch(err => {
        console.error('[Analytics] Streaks error:', err)
        setLoadingState('streaks', false)
      })

    // Fetch viral coefficient and trend
    Promise.all([
      analyticsService.getViralCoefficient(days),
      analyticsService.getViralTrend(days),
    ])
      .then(([viralRes, trendRes]) => {
        setViral(viralRes.data)
        setViralTrend(trendRes.data || [])
        setLoadingState('viral', false)
      })
      .catch(err => {
        console.error('[Analytics] Viral error:', err)
        setLoadingState('viral', false)
      })

    // Fetch conversion
    analyticsService.getConversionMetrics(days)
      .then(res => {
        setConversion(res.data)
        setLoadingState('conversion', false)
      })
      .catch(err => {
        console.error('[Analytics] Conversion error:', err)
        setLoadingState('conversion', false)
      })

    // Set refreshing to false after a short delay (UI feedback)
    if (showRefresh) {
      setTimeout(() => setRefreshing(false), 500)
    }
  }, [days])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle date range change
  const handleDaysChange = (newDays) => {
    setDays(newDays)
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchData(true)
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-gray-800 rounded-2xl p-8 border border-red-500/30 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🎮</span> Quick Clash Analytics
                </h1>
                <p className="text-gray-500 text-sm">30-Day Validation Dashboard</p>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
              <DateRangePicker value={days} onChange={handleDaysChange} />
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Cards Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="Footfall (Login)"
            value={overview?.footfall?.total?.toLocaleString() || '0'}
            trend={overview?.footfall?.trend || 0}
            icon={Users}
            loading={loadingStates.overview}
            description={`${overview?.footfall?.users || 0} users, ${overview?.footfall?.sessions || 0} sessions`}
          />
          <KPICard
            title="D1 (Battle)"
            value={overview?.d1Retention?.battle?.rate || overview?.d1Retention?.rate || '0'}
            unit="%"
            trend={overview?.d1Retention?.trend || 0}
            target={25}
            status={overview?.d1Retention?.battle?.status || overview?.d1Retention?.status}
            icon={TrendingUp}
            description="Played on Day 1"
            loading={loadingStates.overview}
          />
          <KPICard
            title="D1 (Login)"
            value={overview?.d1Retention?.login?.rate || '0'}
            unit="%"
            trend={0}
            target={25}
            status={overview?.d1Retention?.login?.status}
            icon={TrendingUp}
            description="Logged in on Day 1"
            loading={loadingStates.overview}
          />
          <KPICard
            title="D7 (Battle)"
            value={overview?.d7Retention?.battle?.rate || overview?.d7Retention?.rate || '0'}
            unit="%"
            trend={overview?.d7Retention?.trend || 0}
            target={10}
            status={overview?.d7Retention?.battle?.status || overview?.d7Retention?.status}
            icon={TrendingUp}
            description="Played on Day 7"
            loading={loadingStates.overview}
          />
          <KPICard
            title="D7 (Login)"
            value={overview?.d7Retention?.login?.rate || '0'}
            unit="%"
            trend={0}
            target={10}
            status={overview?.d7Retention?.login?.status}
            icon={TrendingUp}
            description="Active after Day 7"
            loading={loadingStates.overview}
          />
          <KPICard
            title="Bounce Rate"
            value={overview?.bounceRate?.overall?.rate || '0'}
            unit="%"
            trend={overview?.bounceRate?.overall?.trend || 0}
            icon={DoorOpen}
            loading={loadingStates.overview}
          />
        </div>

        {/* Second Row: Battle Footfall, BPU, K-Coefficient, Engagement */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard
            title="Footfall (Battle)"
            value={overview?.footfall?.battle?.total?.toLocaleString() || '0'}
            trend={0}
            icon={Users}
            loading={loadingStates.overview}
            description={`${overview?.footfall?.battle?.users || 0} users, ${overview?.footfall?.battle?.sessions || 0} sessions`}
          />
          <KPICard
            title="BPU/Day"
            value={overview?.bpu?.bpuPerDay || '0'}
            trend={overview?.bpu?.trend || 0}
            target={1.6}
            status={overview?.bpu?.status}
            icon={Activity}
            loading={loadingStates.overview}
          />
          <KPICard
            title="K-Coefficient"
            value={overview?.kCoefficient?.k || '0'}
            trend={overview?.kCoefficient?.trend || 0}
            icon={Zap}
            loading={loadingStates.overview}
          />
          <KPICard
            title="2+ Battles"
            value={engagement?.multiBattle?.twoPlusBattles?.rate || '0'}
            unit="%"
            target={20}
            status={engagement?.multiBattle?.twoPlusBattles?.status}
            icon={Activity}
            loading={loadingStates.overview}
          />
          <KPICard
            title="3+ Battles"
            value={engagement?.multiBattle?.threePlusBattles?.rate || '0'}
            unit="%"
            target={10}
            status={engagement?.multiBattle?.threePlusBattles?.status}
            icon={Activity}
            loading={loadingStates.overview}
          />
        </div>

        {/* Verdict Banner */}
        <VerdictBanner
          verdict={overview?.verdict?.verdict}
          reason={overview?.verdict?.reason}
          recommendation={overview?.verdict?.recommendation}
          loading={loadingStates.overview}
        />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RetentionChart
            data={retention?.curve || []}
            loading={loadingStates.retention}
          />
          <ViralTrendChart
            data={viralTrend}
            breakdown={viral?.breakdown}
            loading={loadingStates.viral}
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FootfallChart
            dau={footfall?.dau || []}
            newVsReturning={footfall?.newVsReturning || {}}
            trafficBySource={footfall?.trafficBySource || {}}
            loading={loadingStates.footfall}
          />
          <BounceRateChart
            data={overview?.bounceRate || {}}
            loading={loadingStates.overview}
          />
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StreakDistribution
            data={streaks || {}}
            day2StreakRate={streaks?.day2StreakRate}
            loading={loadingStates.streaks}
          />
          <ConversionFunnel
            conversion={conversion || {}}
            multiBattle={engagement?.multiBattle || {}}
            loading={loadingStates.conversion}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Quick Clash Validation Analytics • Data updates in real-time
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AnalyticsDashboard
