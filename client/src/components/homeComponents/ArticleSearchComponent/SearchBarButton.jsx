import React from 'react'
import SeachIcon from '../../../assets/svg/SearchIcon'

const SearchBarButton = React.memo(({ handleSearch }) => (
  <button
    onClick={handleSearch}
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '9999px',
      padding: '8px',
      marginLeft: '8px',
      border: 'none',
      cursor: 'pointer',
    }}
  >
    <SeachIcon width={'20px'} height={'20px'} />
  </button>
))

export default SearchBarButton
