import { Input } from '@chakra-ui/react'
import React from 'react'

const SearchBarInput = React.memo(
  ({ searchTerm, handleInputChange, handleKeyDown, handleClearSearch }) => (
    <div style={{ position: 'relative', flexGrow: 1 }}>
      <Input
        padding={{ base: '5px 45px 5px 15px', lg: '12px 45px 12px 15px' }}
        style={{
          fontFamily: 'condensed',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '9999px',
          color: 'white',
          fontSize: '16px',

          width: '100%',
        }}
        placeholder="Search articles..."
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      {searchTerm && (
        <button
          onClick={handleClearSearch}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      )}
    </div>
  ),
)

export default SearchBarInput
