import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Settings,
  Shield,
  Bell,
  X,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle, 
} from "lucide-react";
import { api, type UserProfile as UserProfileData } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface UserProfileProps {
  onBack: () => void;
}

interface EditableProfileData {
  name: string;
  email: string;
}

interface ProfileSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  portfolioVisibility: boolean;
  shareActivity: boolean;
  dataAnalytics: boolean;
}

interface PortfolioStats {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalInvested: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface ActivityItem {
  id: string;
  type: 'trade' | 'alert' | 'watchlist' | 'login';
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: 'paid' | 'pending' | 'failed';
}

interface SubscriptionState {
  showManageModal: boolean;
  selectedPlan: string | null;
  billingHistory: BillingHistory[];
  availablePlans: SubscriptionPlan[];
}

export const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { user } = useAuth();
  
  // Initialize profile state with localStorage persistence
  const [profile, setProfile] = useState<UserProfileData | null>(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditableProfileData>({ name: '', email: '' });
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'activity' | 'settings'>('overview');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Subscription management state with localStorage persistence
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(() => {
    const savedSubscription = localStorage.getItem('subscriptionState');
    if (savedSubscription) {
      try {
        return JSON.parse(savedSubscription);
      } catch (error) {
        console.error('Error parsing saved subscription:', error);
      }
    }
    return {
      showManageModal: false,
      selectedPlan: null,
      billingHistory: [],
      availablePlans: []
    };
  });

  // Settings state with localStorage persistence
  const [settings, setSettings] = useState<ProfileSettings>(() => {
    const savedSettings = localStorage.getItem('profileSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    return {
      emailNotifications: true,
      pushNotifications: true,
      smsAlerts: false,
      portfolioVisibility: true,
      shareActivity: false,
      dataAnalytics: true,
    };
  });

  // Mock portfolio and activity data
  const [portfolioStats] = useState<PortfolioStats>({
    totalValue: 2875420,
    dayChange: 15420,
    dayChangePercent: 0.54,
    totalInvested: 2500000,
    gainLoss: 375420,
    gainLossPercent: 15.02,
  });

  const [activityItems] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'trade',
      description: 'Bought 100 shares of TCS at ₹3,245',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'completed',
    },
    {
      id: '2',
      type: 'alert',
      description: 'Price alert triggered for RELIANCE at ₹2,850',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: 'completed',
    },
    {
      id: '3',
      type: 'watchlist',
      description: 'Added INFY to watchlist',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      status: 'completed',
    },
    {
      id: '4',
      type: 'login',
      description: 'Logged in from Chrome browser',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      status: 'completed',
    },
  ]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If user is available from Supabase auth, use that data first
        if (user) {
          const userProfile: UserProfileData = {
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || 'user@example.com',
            memberSince: user.created_at || new Date().toISOString(),
            membership: 'Standard',
            subscription: {
              plan: 'Free',
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          };
          setProfile(userProfile);
          setEditData({ name: userProfile.name, email: userProfile.email });
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }
        
        // Try to load from API first (database)
        try {
          console.log('🔄 Loading user profile from database API...');
          const data = await api.user.getProfile();
          console.log('✅ Profile data received from database:', data);
          setProfile(data);
          setEditData({ name: data.name, email: data.email });
          
          // Cache in localStorage for offline access
          localStorage.setItem('userProfile', JSON.stringify(data));
          console.log('💾 Profile cached in localStorage');
          
          // Load settings from database
          try {
            console.log('🔄 Loading settings from database...');
            const settingsData = await api.user.getSettings();
            console.log('✅ Settings loaded from database:', settingsData);
            setSettings(settingsData);
            localStorage.setItem('profileSettings', JSON.stringify(settingsData));
          } catch (settingsError) {
            console.warn('⚠️ Failed to load settings from database, using cached:', settingsError);
          }
          
        } catch (apiError) {
          console.warn('⚠️ Database API unavailable, using cached data:', apiError);
          
          // Fallback to cached data
          const cachedProfile = localStorage.getItem('userProfile');
          if (cachedProfile) {
            try {
              const parsedProfile = JSON.parse(cachedProfile);
              setProfile(parsedProfile);
              setEditData({ name: parsedProfile.name, email: parsedProfile.email });
              console.log('Loaded profile from localStorage cache');
            } catch (error) {
              console.error('Error parsing cached profile:', error);
            }
          }
          
          // If no cached data, create default profile from Supabase user
          if (!profile && !cachedProfile && user) {
            const defaultProfile: UserProfileData = {
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email || 'user@example.com',
              memberSince: user.created_at || new Date().toISOString(),
              membership: 'Standard',
              subscription: {
                plan: 'Free',
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }
            };
            setProfile(defaultProfile);
            setEditData({ name: defaultProfile.name, email: defaultProfile.email });
            localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
          }
        }
        
        // Initialize subscription data
        setSubscriptionState(prev => ({
          ...prev,
          selectedPlan: profile?.subscription.plan || 'Free',
          availablePlans: getAvailablePlans(),
          billingHistory: getMockBillingHistory()
        }));
      } catch (err) {
        console.error("Error loading profile:", err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load profile - ${errorMessage}. Make sure backend is running on port 5004.`);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('profileSettings', JSON.stringify(settings));
  }, [settings]);

  // Save subscription state to localStorage whenever it changes (excluding showManageModal)
  useEffect(() => {
    const persistentState = { ...subscriptionState, showManageModal: false };
    localStorage.setItem('subscriptionState', JSON.stringify(persistentState));
  }, [subscriptionState]);

  // Save profile data to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      console.log('🔄 Saving profile to database...', { name: editData.name, email: editData.email });
      
      if (profile) {
        // Prepare profile data for API
        const profileUpdateData = {
          name: editData.name,
          email: editData.email,
          membership: profile.membership
        };

        console.log('📤 Sending to API:', profileUpdateData);

        // Save to backend database
        const updatedProfile = await api.user.updateProfile(profileUpdateData);
        console.log('✅ Profile updated in database:', updatedProfile);
        
        setProfile(updatedProfile);
        
        // Also save to localStorage as backup
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        
        console.log('✅ Profile saved successfully to database');
      }
    } catch (error) {
      console.error('❌ Error saving profile to database:', error);
      // Fallback to localStorage if API fails
      if (profile) {
        const updatedProfile = { ...profile, name: editData.name, email: editData.email };
        setProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        console.log('⚠️ Profile saved to localStorage as fallback');
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Save settings to backend database
      await api.user.updateSettings(settings);
      
      // Also save to localStorage as backup
      localStorage.setItem('profileSettings', JSON.stringify(settings));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      console.log('Settings saved successfully to database');
    } catch (error) {
      console.error('Error saving settings to database:', error);
      // Fallback to localStorage if API fails
      localStorage.setItem('profileSettings', JSON.stringify(settings));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      console.log('Settings saved to localStorage as fallback');
    }
  };

  const handleResetSettings = () => {
    const defaultSettings: ProfileSettings = {
      emailNotifications: true,
      pushNotifications: true,
      smsAlerts: false,
      portfolioVisibility: true,
      shareActivity: false,
      dataAnalytics: true,
    };
    setSettings(defaultSettings);
    localStorage.removeItem('profile-settings');
  };

  const updateSetting = (key: keyof ProfileSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="w-4 h-4" />;
      case 'alert': return <Bell className="w-4 h-4" />;
      case 'watchlist': return <BarChart3 className="w-4 h-4" />;
      case 'login': return <User className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAvailablePlans = (): SubscriptionPlan[] => {
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'monthly',
        features: ['5 Watchlist items', 'Basic alerts', 'Limited market data']
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 999,
        period: 'monthly',
        features: ['Unlimited watchlist', 'Advanced alerts', 'Real-time data', 'Portfolio analytics'],
        isPopular: true
      },
      {
        id: 'pro',
        name: 'Professional',
        price: 1999,
        period: 'monthly',
        features: ['Everything in Premium', 'API access', 'Advanced charts', 'Priority support', 'Custom indicators']
      }
    ];
  };

  const getMockBillingHistory = (): BillingHistory[] => {
    return [
      {
        id: '1',
        date: '2025-08-15',
        amount: 999,
        plan: 'Premium',
        status: 'paid'
      },
      {
        id: '2', 
        date: '2025-07-15',
        amount: 999,
        plan: 'Premium',
        status: 'paid'
      },
      {
        id: '3',
        date: '2025-06-15',
        amount: 999,
        plan: 'Premium', 
        status: 'paid'
      }
    ];
  };

  const handleManageSubscription = () => {
    setSubscriptionState(prev => ({ ...prev, showManageModal: true }));
  };

  const handleUpgradePlan = (planId: string) => {
    setSubscriptionState(prev => ({ ...prev, selectedPlan: planId }));
    // In a real app, this would call the billing API
    alert(`Upgrading to ${subscriptionState.availablePlans.find(p => p.id === planId)?.name} plan`);
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      setSubscriptionState(prev => ({ ...prev, selectedPlan: 'free' }));
      alert('Subscription cancelled. You will retain access until the end of your billing period.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {error || "Profile not found"}
          </h2>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your account settings and view your trading activity
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center relative">
                    <User className="w-10 h-10 text-white" />
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-blue-600">
                      <User className="w-3 h-3 text-blue-600" />
                    </button>
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Full Name"
                        />
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Email Address"
                        />
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handleSaveProfile}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Save Changes</span>
                          </button>
                          {saveSuccess && (
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm">Saved!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {profile?.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{profile?.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {profile?.membership}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Member Since
                      </label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {profile && new Date(profile.memberSince).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Account Status
                      </label>
                      <p className="text-green-600 dark:text-green-400 font-medium">Verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Portfolio Value</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(portfolioStats.totalValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Today's P&L</span>
                  <span className={`font-semibold ${portfolioStats.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(portfolioStats.dayChange)} ({portfolioStats.dayChangePercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total P&L</span>
                  <span className={`font-semibold ${portfolioStats.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(portfolioStats.gainLoss)} ({portfolioStats.gainLossPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Account Settings</span>
                </button>
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">View Portfolio</span>
                </button>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <Activity className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Trading Activity</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Subscription
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Plan</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {profile?.subscription.plan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Next Billing</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {profile && new Date(profile.subscription.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
                <button 
                  onClick={handleManageSubscription}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Manage Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Summary</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(portfolioStats.totalValue)}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Total Portfolio Value</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(portfolioStats.totalInvested)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Invested</p>
                </div>
                <div>
                  <p className={`text-lg font-semibold ${portfolioStats.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(portfolioStats.gainLoss)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">P&L</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Performance</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${portfolioStats.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioStats.dayChange >= 0 ? '+' : ''}{formatCurrency(portfolioStats.dayChange)}
                </p>
                <p className={`${portfolioStats.dayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioStats.dayChangePercent >= 0 ? '+' : ''}{portfolioStats.dayChangePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Allocation</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Stocks</span>
                <span className="font-medium text-gray-900 dark:text-white">65%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Crypto</span>
                <span className="font-medium text-gray-900 dark:text-white">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Cash</span>
                <span className="font-medium text-gray-900 dark:text-white">10%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activityItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(item.timestamp)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(item.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Settings</h3>
            {saveSuccess && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Settings saved!</span>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Preferences
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={settings.emailNotifications}
                      onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Email notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={settings.pushNotifications}
                      onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Push notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={settings.smsAlerts}
                      onChange={(e) => updateSetting('smsAlerts', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">SMS alerts</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Privacy Settings
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={settings.portfolioVisibility}
                      onChange={(e) => updateSetting('portfolioVisibility', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Portfolio visibility</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={settings.shareActivity}
                      onChange={(e) => updateSetting('shareActivity', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Share trading activity</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      checked={settings.dataAnalytics}
                      onChange={(e) => updateSetting('dataAnalytics', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Data analytics</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
              <button 
                onClick={handleResetSettings}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Management Modal */}
      {subscriptionState.showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Subscription</h2>
              <button
                onClick={() => setSubscriptionState(prev => ({ ...prev, showManageModal: false }))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Current Plan */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Plan</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">{profile?.subscription.plan}</h4>
                      <p className="text-blue-700 dark:text-blue-300">Next billing: {profile && new Date(profile.subscription.nextBillingDate).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={handleCancelSubscription}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Cancel Plan
                    </button>
                  </div>
                </div>
              </div>

              {/* Available Plans */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subscriptionState.availablePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-6 relative ${
                        plan.isPopular
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-4">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₹{plan.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                        </div>
                      </div>
                      
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        onClick={() => handleUpgradePlan(plan.id)}
                        disabled={subscriptionState.selectedPlan === plan.id}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          subscriptionState.selectedPlan === plan.id
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : plan.isPopular
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                        }`}
                      >
                        {subscriptionState.selectedPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing History</h3>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Plan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {subscriptionState.billingHistory.map((bill) => (
                          <tr key={bill.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(bill.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {bill.plan}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              ₹{bill.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                bill.status === 'paid'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : bill.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {bill.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
