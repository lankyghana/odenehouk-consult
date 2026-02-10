import React from 'react';

// Shared page shell: soft background, centered content with generous padding.
export default function Layout({ children, contentClassName = '' }) {
  return (
    <div className="min-h-screen bg-[#f5f4fb] text-gray-900 font-sans">
      <div
        className={`max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
