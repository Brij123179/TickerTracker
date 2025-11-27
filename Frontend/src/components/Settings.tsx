import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  Shield,
  Trash2,
  Activity,
  RefreshCw,
  Volume,
  FileText,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useData } from "../contexts/DataContext";
import { ApiStatus } from "./ApiStatus";
import { NotificationSystem, useNotifications } from "./NotificationSystem";
import jsPDF from 'jspdf';
import { api } from '../services/api';

interface SettingsProps {
  onBack: () => void;
}

interface UserPreferences {
  priceAlerts: boolean;
  newsUpdates: boolean;
  sentimentAlerts: boolean;
  soundEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultMarket: string;
  compactMode: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { isDark, toggleTheme } = useTheme();
  const { watchlist, alerts, refreshData } = useData();
  const [showApiStatus, setShowApiStatus] = useState(false);
  const { notifications, addNotification, removeNotification } = useNotifications();
  
  // User preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    priceAlerts: true,
    newsUpdates: true,
    sentimentAlerts: false,
    soundEnabled: true,
    autoRefresh: false,
    refreshInterval: 30,
    defaultMarket: 'US',
    compactMode: false,
  });

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('tickertracker-preferences');
    if (savedPrefs) {
      setPreferences({ ...preferences, ...JSON.parse(savedPrefs) });
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem('tickertracker-preferences', JSON.stringify(updated));
    
    // Show success notification
    const settingNames = Object.keys(newPrefs).join(', ');
    addNotification('success', 'Settings Saved', `Updated: ${settingNames}`);
  };

  // Export data as PDF functionality
  const exportDataAsPDF = async () => {
    try {
      // Get user profile
      const profile = await api.user.getProfile();
      
      // Create new PDF document
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;
      
      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text('TickerTracker User Data Export', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // User Profile Section
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text('User Profile', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Name: ${profile.name}`, 25, yPosition);
      yPosition += 7;
      pdf.text(`Email: ${profile.email}`, 25, yPosition);
      yPosition += 7;
      pdf.text(`Membership: ${profile.membership}`, 25, yPosition);
      yPosition += 7;
      pdf.text(`Member Since: ${new Date(profile.memberSince).toLocaleDateString()}`, 25, yPosition);
      yPosition += 7;
      pdf.text(`Subscription Plan: ${profile.subscription.plan}`, 25, yPosition);
      yPosition += 15;
      
      // Watchlist Section
      if (watchlist.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 40);
        pdf.text('Watchlist', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        watchlist.forEach((symbol, index) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`${index + 1}. ${symbol}`, 25, yPosition);
          yPosition += 7;
        });
        yPosition += 10;
      }
      
      // Alerts Section
      if (alerts.length > 0) {
        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 40);
        pdf.text('Active Alerts', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        alerts.forEach((alert, index) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`${index + 1}. ${alert.ticker} - ${alert.condition}`, 25, yPosition);
          yPosition += 5;
          if (alert.targetPrice) {
            pdf.text(`   Target Price: ₹${alert.targetPrice.toLocaleString('en-IN')}`, 25, yPosition);
            yPosition += 5;
          }
          pdf.text(`   Created: ${new Date(alert.createdAt).toLocaleDateString()}`, 25, yPosition);
          yPosition += 5;
          pdf.text(`   Status: ${alert.isActive ? 'Active' : 'Inactive'}`, 25, yPosition);
          yPosition += 10;
        });
      }
      
      // Portfolio Stats Section (Mock data)
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Portfolio Summary', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text('Total Portfolio Value: ₹28,75,420', 25, yPosition);
      yPosition += 7;
      pdf.text('Total Invested: ₹25,00,000', 25, yPosition);
      yPosition += 7;
      pdf.text('Total P&L: ₹3,75,420 (+15.02%)', 25, yPosition);
      yPosition += 7;
      pdf.text("Today's P&L: ₹15,420 (+0.54%)", 25, yPosition);
      yPosition += 15;
      
      // Settings Section
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text('User Preferences', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      Object.entries(preferences).forEach(([key, value]) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        pdf.text(`${formattedKey}: ${value}`, 25, yPosition);
        yPosition += 7;
      });
      
      // Footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('TickerTracker - Personal Finance Dashboard', pageWidth / 2, footerY, { align: 'center' });
      
      // Save the PDF
      const fileName = `tickertracker-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      addNotification('success', 'PDF Generated', 'Your user data report has been downloaded');
    } catch (error) {
      console.error('Error generating PDF:', error);
      addNotification('error', 'Export Failed', 'Could not generate PDF report');
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('tickertracker-preferences');
      localStorage.removeItem('theme');
      // Clear watchlist and alerts would be handled by API calls in a real app
      addNotification('info', 'Data Cleared', 'All local data has been reset');
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  // Refresh data
  const handleRefreshData = async () => {
    try {
      await refreshData();
      addNotification('success', 'Data Refreshed', 'Market data updated successfully');
    } catch (error) {
      addNotification('error', 'Refresh Failed', 'Could not update market data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Customize your TickerTracker experience
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDark ? (
                  <Moon className="w-5 h-5 text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDark ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Price Alerts
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when prices hit your targets
                  </p>
                </div>
              </div>
              <button
                onClick={() => savePreferences({ priceAlerts: !preferences.priceAlerts })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.priceAlerts ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.priceAlerts ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    News Updates
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Breaking news for your watchlist
                  </p>
                </div>
              </div>
              <button
                onClick={() => savePreferences({ newsUpdates: !preferences.newsUpdates })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.newsUpdates ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.newsUpdates ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Sentiment Changes
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI-detected sentiment shifts
                  </p>
                </div>
              </div>
              <button
                onClick={() => savePreferences({ sentimentAlerts: !preferences.sentimentAlerts })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.sentimentAlerts ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.sentimentAlerts ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {preferences.soundEnabled ? (
                  <Bell className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Sound Notifications
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Play sounds for alerts
                  </p>
                </div>
              </div>
              <button
                onClick={() => savePreferences({ soundEnabled: !preferences.soundEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.soundEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Application Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Auto Refresh
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically refresh market data
                  </p>
                </div>
              </div>
              <button
                onClick={() => savePreferences({ autoRefresh: !preferences.autoRefresh })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.autoRefresh ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.autoRefresh ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            
            {preferences.autoRefresh && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Refresh Interval (seconds)
                </label>
                <select
                  value={preferences.refreshInterval}
                  onChange={(e) => savePreferences({ refreshInterval: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Market
              </label>
              <select
                value={preferences.defaultMarket}
                onChange={(e) => savePreferences({ defaultMarket: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="US">US Market</option>
                <option value="Indian">Indian Market</option>
                <option value="Crypto">Cryptocurrency</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Compact Mode
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show more data in less space
                </p>
              </div>
              <button
                onClick={() => savePreferences({ compactMode: !preferences.compactMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.compactMode ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.compactMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{watchlist.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Watchlist Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{alerts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {alerts.filter(alert => alert.isActive).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(localStorage).filter(key => key.startsWith('tickertracker')).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Saved Settings</div>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Privacy & Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Local Data Storage
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your data is stored locally and never sent to third parties
                  </p>
                </div>
              </div>
              <span className="text-sm text-green-600">Secure</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    API Connections
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Secure HTTPS connections to financial data providers
                  </p>
                </div>
              </div>
              <span className="text-sm text-blue-600">Encrypted</span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Data Management
          </h2>
          <div className="space-y-4">
            <button 
              onClick={exportDataAsPDF}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Export Data as PDF
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download your complete user data report as PDF ({watchlist.length} symbols, {alerts.length} alerts)
                  </p>
                </div>
              </div>
              <span className="text-sm text-blue-600">Export</span>
            </button>
            
            <button 
              onClick={handleRefreshData}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Refresh All Data
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update market data, watchlist, and alerts
                  </p>
                </div>
              </div>
              <span className="text-sm text-blue-600">Refresh</span>
            </button>
            
            <button 
              onClick={clearAllData}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div className="text-left">
                  <p className="font-medium text-red-600">Clear All Data</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reset app to default state (watchlist, alerts, preferences)
                  </p>
                </div>
              </div>
              <span className="text-sm text-red-600">Clear</span>
            </button>
          </div>
        </div>

        {/* Developer Tools */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Developer Tools
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    API Health Check
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor backend API status and connectivity
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApiStatus(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Check Status
              </button>
            </div>
          </div>
        </div>
      </div>

      {showApiStatus && <ApiStatus onClose={() => setShowApiStatus(false)} />}
      <NotificationSystem 
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  );
};
