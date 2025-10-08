import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-4 bg-transparent">
        <div className="text-sm text-gray-400 font-mono">
          © Carlos Tarrats {currentYear}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
