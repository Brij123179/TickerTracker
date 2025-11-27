import React, { useState } from "react";
import {
  Search,
  Moon,
  Sun,
  User,
  Settings,
  Bell,
  Heart,
  MessageCircle,
  LogOut,
  AlignJustify,
  X,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { ViewType } from "../App";

interface EnhancedHeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onTickerSelect: (ticker: string) => void;
}

export const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  currentView,
  onViewChange,
  onTickerSelect,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { stocks, selectedMarket, setSelectedMarket } = useData();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications] = useState(3); // Mock notifications count

  const marketEntities = ["US", "Indian", "Crypto"];

  const filteredStocks = stocks
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 10);

  const handleSearch = (symbol: string) => {
    setSearchQuery("");
    setShowSearchResults(false);
    setShowMobileMenu(false);
    onTickerSelect(symbol);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'watchlist', label: 'Watchlist', icon: Heart },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <AlignJustify className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onViewChange('dashboard')}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    TickerTracker
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pro Trading Platform</p>
                </div>
              </div>
            </div>

            {/* Market Selector - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {marketEntities.map((market) => (
                <button
                  key={market}
                  onClick={() => setSelectedMarket(market)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                    selectedMarket === market
                      ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {market}
                </button>
              ))}
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block flex-1 max-w-md mx-4 xl:mx-8 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-colors"
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && filteredStocks.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 scrollbar-thin">
                  {filteredStocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleSearch(stock.symbol)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {stock.symbol}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {stock.name}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          stock.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stock.change >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as ViewType)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={item.label}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden xl:inline">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-blue rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.email || 'user@example.com'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pro Account</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onViewChange('profile');
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onViewChange('settings');
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden pb-3 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mobile Search Results */}
            {showSearchResults && filteredStocks.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
                {filteredStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSearch(stock.symbol)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {stock.name}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        stock.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stock.change >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Market Selector */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 px-3 py-2">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {marketEntities.map((market) => (
              <button
                key={market}
                onClick={() => setSelectedMarket(market)}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedMarket === market
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {market}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
          <div
            className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">TickerTracker</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Navigation</p>
                </div>
              </div>
            </div>
            
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id as ViewType);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(showSearchResults || showUserMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowSearchResults(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </>
  );
};
