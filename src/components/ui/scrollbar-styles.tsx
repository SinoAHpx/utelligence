import React from "react";

/**
 * Custom scrollbar styles for the application
 * Provides consistent styling for scrollbars across the app
 */
export const ScrollbarStyles = () => (
  <style jsx global>{`
    .scrollbar-thin::-webkit-scrollbar {
      width: 6px;
    }

    .scrollbar-thumb-transparent::-webkit-scrollbar-thumb {
      background-color: transparent;
      transition: background-color 0.3s;
    }

    .hover\\:scrollbar-thumb-gray-300:hover::-webkit-scrollbar-thumb {
      background-color: rgba(209, 213, 219, 0.5);
    }

    .dark
      .dark\\:hover\\:scrollbar-thumb-gray-700:hover::-webkit-scrollbar-thumb {
      background-color: rgba(55, 65, 81, 0.5);
    }

    .scrollbar-thumb-rounded::-webkit-scrollbar-thumb {
      border-radius: 3px;
    }

    .scrollbar-track-transparent::-webkit-scrollbar-track {
      background-color: transparent;
    }

    /* Firefox scrollbar styles */
    .scrollbar-thin {
      scrollbar-width: thin;
      scrollbar-color: transparent transparent;
    }

    .scrollbar-thin:hover {
      scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
    }
  `}</style>
);

export default ScrollbarStyles;
