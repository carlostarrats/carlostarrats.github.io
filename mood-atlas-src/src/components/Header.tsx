import React from 'react';
import { RotateCcw, X, Globe, User } from 'lucide-react';

export type ViewMode = 'personal' | 'discover';

interface HeaderProps {
  onHomeClick?: () => void;
  onResetView?: () => void;
  examineMode?: { emotion: string; color: string } | null;
  onCloseExamine?: () => void;
  hidButtons?: boolean;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  isLoadingCities?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onHomeClick,
  onResetView,
  examineMode,
  onCloseExamine,
  hidButtons = false,
  viewMode = 'personal',
  onViewModeChange,
  isLoadingCities = false,
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
                ? 'text-black hover:text-gray-700'
                : 'text-white hover:text-gray-300'
            }`}
          >
            {examineMode ? `Examining: ${examineMode.emotion}` : "Robert Thayer's model of mood x music"}
          </div>

          {/* Buttons - invisible when song detail is open in examine mode */}
          <div className={`flex items-center gap-2 ${hidButtons ? 'invisible' : ''}`}>
            {/* View Mode Toggle - only show when not in examine mode */}
            {!examineMode && onViewModeChange && (
              <div className="backdrop-blur-md rounded-lg p-1 bg-transparent border border-white/20 flex">
                <div
                  onClick={() => onViewModeChange('personal')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all ${
                    viewMode === 'personal'
                      ? 'bg-white/20 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-xs font-mono">My Music</span>
                </div>
                <div
                  onClick={() => !isLoadingCities && onViewModeChange('discover')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all ${
                    viewMode === 'discover'
                      ? 'bg-white/20 text-white'
                      : 'text-gray-400 hover:text-white'
                  } ${isLoadingCities ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-mono">
                    {isLoadingCities ? 'Loading...' : 'Discover'}
                  </span>
                </div>
              </div>
            )}

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
