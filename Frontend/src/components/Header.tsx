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
  BarChart3,
  LogOut,
  LogIn,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { ViewType } from "../App";

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onTickerSelect: (ticker: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
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
    onTickerSelect(symbol);
  };

  const generateTopCompanies = () => {
    const marketStocks = stocks.filter((stock) => {
      if (selectedMarket === "US") return stock.exchange === "NASDAQ";
      if (selectedMarket === "Indian") return stock.exchange === "NSE";
      if (selectedMarket === "Crypto") return stock.exchange === "Crypto";
      return false;
    });

    return marketStocks.sort((a, b) => b.marketCap - a.marketCap).slice(0, 50);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              TickerTracker
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks, crypto, or companies..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && filteredStocks.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {filteredStocks.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSearch(stock.symbol)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {stock.symbol}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {stock.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        ₹{stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-sm ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {stock.change >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Market Selector */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {marketEntities.map((market) => (
                <option key={market} value={market}>
                  {market} Market
                </option>
              ))}
            </select>

            {/* Navigation Buttons */}
            <button
              onClick={() => onViewChange("watchlist")}
              className={`p-2 rounded-lg transition-colors ${
                currentView === "watchlist"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Heart className="w-5 h-5" />
            </button>

            <button
              onClick={() => onViewChange("alerts")}
              className={`p-2 rounded-lg transition-colors ${
                currentView === "alerts"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Bell className="w-5 h-5" />
            </button>

            <button
              onClick={() => onViewChange("chat")}
              className={`p-2 rounded-lg transition-colors ${
                currentView === "chat"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Current theme: ${isDark ? 'Dark' : 'Light'} - Click to toggle`}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium hidden md:block">
                    {user.email?.split('@')[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onViewChange("profile");
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onViewChange("settings");
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onViewChange("login")}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
