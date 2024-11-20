import { css } from '@emotion/react'

export const scrollbarStyles = css`
  /* Make scrollbar always visible */
  ::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
    display: block !important;
    background-color: transparent;
  }

  ::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.2);
    border-radius: 4px;
    margin: 2px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(
      135deg,
      rgba(147, 51, 234, 0.6) 0%,
      rgba(236, 72, 153, 0.6) 100%
    );
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-height: 40px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(
      135deg,
      rgba(147, 51, 234, 0.8) 0%,
      rgba(236, 72, 153, 0.8) 100%
    );
  }

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(236, 72, 153, 0.6) rgba(30, 41, 59, 0.2);

  @media (max-width: 768px) {
    ::-webkit-scrollbar {
      width: 4px !important;
    }
  }
`
