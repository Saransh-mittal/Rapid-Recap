import React from 'react'
import './Loading.css'
const Loading = () => {
    return (
        <div className='loading-overlay'>
        <div className="spinner-container">
          <div className="loading-spinner">
          </div>
        </div>
        </div>
      );
}

export default Loading
