import { Spinner } from '@chakra-ui/react'
import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react'
import ReactDOM from 'react-dom'

const MODAL_STYLES = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  backgroundColor: 'rgb(34,34,34)',
  transform: 'translate(-50%, -50%)',
  zIndex: 2000,
  minHeight: '90%',
  width: '90%',
}

const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, .7)',
  zIndex: 2000,
}

// Lazy load the modal content component
const ModalContent = lazy(() =>
  import('../components/miscellaneous/ModalContent.jsx'),
)

const Modal = ({ children, onClose }) => {
  const [isHovered, setIsHovered] = useState(false)

  const buttonStyle = useMemo(
    () => ({
      marginLeft: '100%',
      marginTop: '-5px',
      zIndex: 2001,
      position: 'absolute',
      top: '21px',
      right: '10px',
      color: isHovered ? '#f0f0f0' : '#253547',
      backgroundColor: isHovered ? '#37474f' : 'white',
      transition: 'background-color 0.3s, color 0.3s',
    }),
    [isHovered],
  )

  const handleMouseOver = useCallback(() => setIsHovered(true), [])
  const handleMouseOut = useCallback(() => setIsHovered(false), [])

  return ReactDOM.createPortal(
    <>
      <div style={OVERLAY_STYLES} />
      <div style={MODAL_STYLES}>
        <button
          className="btn fs-6"
          style={buttonStyle}
          onClick={onClose}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          X
        </button>
        <Suspense fallback={<Spinner />}>
          <ModalContent>{children}</ModalContent>
        </Suspense>
      </div>
    </>,
    document.getElementById('overlay'),
  )
}

export default Modal
