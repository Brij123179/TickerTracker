import { useState } from 'react';
import { EnhancedHeader } from './components/EnhancedHeader';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import { TickerDetail } from './components/TickerDetail';
import { UserProfile } from './components/UserProfile';
import { Settings } from './components/Settings';
import { AlertsPanel } from './components/AlertsPanel';
import { Watchlist } from './components/Watchlist';
import { FinGPTChat } from './components/FinGPTChat';
import Login from './components/Login';
import Signup from './components/Signup';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

export type ViewType = 'dashboard' | 'ticker' | 'profile' | 'settings' | 'alerts' | 'watchlist' | 'chat' | 'login' | 'signup';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const handleTickerSelect = (ticker: string) => {
    setSelectedTicker(ticker);
    setCurrentView('ticker');
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/signup if not authenticated and trying to access protected routes
  if (!user && currentView !== 'login' && currentView !== 'signup') {
    return <Login onSwitchToSignup={() => setCurrentView('signup')} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <Login onSwitchToSignup={() => setCurrentView('signup')} />;
      case 'signup':
        return <Signup onSwitchToLogin={() => setCurrentView('login')} />;
      case 'dashboard':
        return <EnhancedDashboard onTickerSelect={handleTickerSelect} />;
      case 'ticker':
        return <TickerDetail ticker={selectedTicker} onBack={() => setCurrentView('dashboard')} />;
      case 'profile':
        return <UserProfile onBack={() => setCurrentView('dashboard')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentView('dashboard')} />;
      case 'alerts':
        return <AlertsPanel onBack={() => setCurrentView('dashboard')} />;
      case 'watchlist':
        return <Watchlist onTickerSelect={handleTickerSelect} onBack={() => setCurrentView('dashboard')} />;
      case 'chat':
        return <FinGPTChat onBack={() => setCurrentView('dashboard')} />;
      default:
        return <EnhancedDashboard onTickerSelect={handleTickerSelect} />;
    }
  };

  // Don't show header on login/signup pages
  const showHeader = currentView !== 'login' && currentView !== 'signup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {showHeader && (
        <EnhancedHeader 
          currentView={currentView} 
          onViewChange={setCurrentView}
          onTickerSelect={handleTickerSelect}
        />
      )}
      <main className={showHeader ? "pt-16 sm:pt-20 md:pt-24" : ""}>
        {renderCurrentView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;