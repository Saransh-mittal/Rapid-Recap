// src/components/DeleteArticleAlert.js
import React, { lazy, Suspense, useMemo, useCallback } from 'react'

const LazyAlertDialog = lazy(() =>
  import('@chakra-ui/react').then(module => ({ default: module.AlertDialog })),
)
const LazyAlertDialogBody = lazy(() =>
  import('@chakra-ui/react').then(module => ({
    default: module.AlertDialogBody,
  })),
)
const LazyAlertDialogFooter = lazy(() =>
  import('@chakra-ui/react').then(module => ({
    default: module.AlertDialogFooter,
  })),
)
const LazyAlertDialogHeader = lazy(() =>
  import('@chakra-ui/react').then(module => ({
    default: module.AlertDialogHeader,
  })),
)
const LazyAlertDialogContent = lazy(() =>
  import('@chakra-ui/react').then(module => ({
    default: module.AlertDialogContent,
  })),
)
const LazyAlertDialogOverlay = lazy(() =>
  import('@chakra-ui/react').then(module => ({
    default: module.AlertDialogOverlay,
  })),
)
const LazyButton = lazy(() =>
  import('@chakra-ui/react').then(module => ({ default: module.Button })),
)

const DeleteArticleAlert = React.memo(
  ({ isOpen, cancelRef, onClose, onConfirm }) => {
    const memoizedOverlayStyle = useMemo(
      () => ({
        bg: '#1a1527',
        color: 'white',
        borderRadius: 'lg',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      }),
      [],
    )

    const handleConfirm = useCallback(() => {
      onConfirm()
    }, [onConfirm])

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyAlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <LazyAlertDialogOverlay>
            <LazyAlertDialogContent {...memoizedOverlayStyle}>
              <LazyAlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Article
              </LazyAlertDialogHeader>

              <LazyAlertDialogBody>
                Are you sure you want to delete this article? This action cannot
                be undone.
              </LazyAlertDialogBody>

              <LazyAlertDialogFooter>
                <LazyButton ref={cancelRef} onClick={onClose}>
                  Cancel
                </LazyButton>
                <LazyButton colorScheme="red" onClick={handleConfirm} ml={3}>
                  Delete
                </LazyButton>
              </LazyAlertDialogFooter>
            </LazyAlertDialogContent>
          </LazyAlertDialogOverlay>
        </LazyAlertDialog>
      </Suspense>
    )
  },
)

DeleteArticleAlert.displayName = 'DeleteArticleAlert'

export default DeleteArticleAlert
