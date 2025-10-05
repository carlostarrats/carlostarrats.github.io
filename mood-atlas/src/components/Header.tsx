import React from 'react';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';

interface HeaderProps {
  onHomeClick?: () => void;
  onSyncClick?: () => void;
  isAuthorized?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onHomeClick, 
  onSyncClick, 
  isAuthorized = false 
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
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

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="font-mono">
                {isAuthorized ? 'Connected' : 'Offline'}
              </span>
            </div>
            
            <div 
              onClick={onSyncClick}
              className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white">
                <Music className="w-4 h-4" />
                <span>{isAuthorized ? 'Sync Library' : 'Connect Apple Music'}</span>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
