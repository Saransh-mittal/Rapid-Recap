// components/common/ErrorBoundary.jsx - Converted to Tailwind with backward compatibility
import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

const MotionDiv = motion.div

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 relative">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="flex flex-col items-center space-y-6 max-w-md text-center">
              <MotionDiv
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 rounded-full bg-red-500/10 border-2 border-red-500">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </MotionDiv>

              <div className="space-y-3">
                <h2 className="text-lg font-bold text-red-400">
                  {this.props.title || 'Something went wrong'}
                </h2>
                <p className="text-white/80 text-base">
                  {this.props.fallbackText ||
                    'An unexpected error occurred while loading the battle analysis.'}
                </p>
              </div>

              <div className="flex flex-col space-y-3 w-full">
                <button
                  onClick={this.handleReload}
                  className="
                    flex items-center justify-center gap-2 px-6 py-3
                    bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg
                    transition-colors duration-200 w-full max-w-[200px] mx-auto
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900
                  "
                >
                  <RefreshCw size={16} />
                  Reload Page
                </button>

                {this.props.onReset && (
                  <button
                    onClick={this.props.onReset || this.handleReset}
                    className="
                      px-4 py-2 text-white/70 hover:text-white hover:bg-white/5
                      transition-all duration-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-white/20
                    "
                  >
                    Try Again
                  </button>
                )}
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div
                  className="
                  mt-4 p-3 bg-red-900 rounded-md text-xs text-red-100
                  text-left w-full max-h-[200px] overflow-auto
                "
                >
                  <p className="font-bold mb-2">Error Details:</p>
                  <p className="mb-2">{this.state.error.toString()}</p>
                  {this.state.errorInfo.componentStack && (
                    <>
                      <p className="font-bold mt-2 mb-1">Component Stack:</p>
                      <p className="text-2xs">
                        {this.state.errorInfo.componentStack}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
