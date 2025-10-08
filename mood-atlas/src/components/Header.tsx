import React from 'react';
import { RotateCcw } from 'lucide-react';

interface HeaderProps {
  onHomeClick?: () => void;
  onSyncClick?: () => void;
  onResetView?: () => void;
  isAuthorized?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onHomeClick, 
  onSyncClick, 
  onResetView,
  isAuthorized = false 
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-1">
            <div
              onClick={onHomeClick}
              className="text-sm font-mono font-bold text-white hover:text-gray-300 hover:underline transition-colors cursor-pointer"
            >
              Carlos Tarrats
            </div>
            <div className="hidden md:block text-gray-400 font-mono text-sm">
              / mood-atlas
            </div>
          </div>

          {/* Reset View Button */}
          <div 
            onClick={onResetView}
            className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-3 cursor-pointer hover:border-white/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white">
              <RotateCcw className="w-4 h-4" />
              <span>Reset View</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
