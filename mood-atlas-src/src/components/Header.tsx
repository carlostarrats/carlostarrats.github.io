import React from 'react';
import { RotateCcw, X } from 'lucide-react';

interface HeaderProps {
  onHomeClick?: () => void;
  onResetView?: () => void;
  examineMode?: { emotion: string; color: string } | null;
  onCloseExamine?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onHomeClick,
  onResetView,
  examineMode,
  onCloseExamine
}) => {
  const isExamining = !!examineMode;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div
            onClick={onHomeClick}
            className={`text-sm font-mono transition-colors cursor-pointer ${
              isExamining
                ? 'text-black hover:text-gray-700 hover:underline'
                : 'text-white hover:text-gray-300 hover:underline'
            }`}
          >
            {examineMode ? `Examining: ${examineMode.emotion}` : "Robert Thayer's model of mood x music"}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {/* Close Examine Button */}
            {examineMode && onCloseExamine && (
              <div
                onClick={onCloseExamine}
                className={`backdrop-blur-md rounded-lg p-3 cursor-pointer transition-colors ${
                  isExamining
                    ? 'bg-black border border-black hover:bg-gray-800'
                    : 'bg-transparent border border-white/20 hover:border-white/40'
                }`}
              >
                <div className={`flex items-center gap-2 text-xs font-mono ${
                  isExamining ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}>
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </div>
              </div>
            )}

            {/* Reset View Button */}
            <div
              onClick={onResetView}
              className={`backdrop-blur-md rounded-lg p-3 cursor-pointer transition-colors ${
                isExamining
                  ? 'bg-black border border-black hover:bg-gray-800'
                  : 'bg-transparent border border-white/20 hover:border-white/40'
              }`}
            >
              <div className={`flex items-center gap-2 text-xs font-mono ${
                isExamining ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}>
                <RotateCcw className="w-4 h-4" />
                <span>Reset View</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
