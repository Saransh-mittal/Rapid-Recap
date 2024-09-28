import * as React from 'react'
const CheckSVG = props => (
  <svg
    fill="#000000"
    width="20px"
    height="20px"
    viewBox="0 0 24 24"
    id="check"
    data-name="Line Color"
    xmlns="http://www.w3.org/2000/svg"
    className="icon line-color"
    {...props}
  >
    <polyline
      id="primary"
      points="5 12 10 17 19 8"
      style={{
        fill: 'none',
        stroke: props.stroke || 'rgb(0, 0, 0)',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 1,
      }}
    />
  </svg>
)
export default CheckSVG
