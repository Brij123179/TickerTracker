import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface CreateAlertProps {
  ticker: string;
  currentPrice: number;
  onClose: () => void;
}

export const CreateAlert: React.FC<CreateAlertProps> = ({ ticker, currentPrice, onClose }) => {
  const { createAlert } = useData();
  const [alertType, setAlertType] = useState<'price' | 'percentage' | 'sentiment'>('price');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState(currentPrice.toString());
  const [percentageChange, setPercentageChange] = useState('5');
  const [sentimentTrigger, setSentimentTrigger] = useState<'positive' | 'negative'>('positive');
  const [duration, setDuration] = useState<'1h' | '1d' | '1w' | 'unlimited'>('1d');
  const [notificationType, setNotificationType] = useState<'browser' | 'email' | 'both'>('browser');
  const [email, setEmail] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expiresAt = duration === 'unlimited' ? undefined : (() => {
      const now = new Date();
      switch (duration) {
        case '1h':
          return new Date(now.getTime() + 60 * 60 * 1000);
        case '1d':
          return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case '1w':
          return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        default:
          return undefined;
      }
    })();

    let conditionText = '';
    let calculatedTargetPrice = undefined;

    if (alertType === 'price') {
      conditionText = `Price ${condition} $${targetPrice}`;
      calculatedTargetPrice = parseFloat(targetPrice);
    } else if (alertType === 'percentage') {
      const percentageNum = parseFloat(percentageChange);
      if (condition === 'above') {
        calculatedTargetPrice = currentPrice * (1 + percentageNum / 100);
        conditionText = `Price increases by ${percentageNum}% (above $${calculatedTargetPrice.toFixed(2)})`;
      } else {
        calculatedTargetPrice = currentPrice * (1 - percentageNum / 100);
        conditionText = `Price decreases by ${percentageNum}% (below $${calculatedTargetPrice.toFixed(2)})`;
      }
    } else {
      conditionText = `Sentiment turns ${sentimentTrigger}`;
    }

    createAlert({
      ticker,
      condition: conditionText,
      targetPrice: calculatedTargetPrice,
      sentimentTrigger: alertType === 'sentiment' ? sentimentTrigger : undefined,
      isActive: true,
      expiresAt: expiresAt?.toISOString()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Alert for {ticker}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Alert Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alert Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAlertType('price')}
                className={`py-2 px-3 rounded-lg border transition-colors text-sm ${
                  alertType === 'price'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Price Alert
              </button>
              <button
                type="button"
                onClick={() => setAlertType('percentage')}
                className={`py-2 px-3 rounded-lg border transition-colors text-sm ${
                  alertType === 'percentage'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                % Change
              </button>
              <button
                type="button"
                onClick={() => setAlertType('sentiment')}
                className={`py-2 px-3 rounded-lg border transition-colors text-sm ${
                  alertType === 'sentiment'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Sentiment
              </button>
            </div>
          </div>

          {/* Price Alert Settings */}
          {alertType === 'price' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="above">Price goes above</option>
                  <option value="below">Price drops below</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Current price: ₹{currentPrice.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Sentiment Alert Settings */}
          {alertType === 'sentiment' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sentiment Trigger
              </label>
              <select
                value={sentimentTrigger}
                onChange={(e) => setSentimentTrigger(e.target.value as 'positive' | 'negative')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="positive">Sentiment turns positive</option>
                <option value="negative">Sentiment turns negative</option>
              </select>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as typeof duration)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">1 Hour</option>
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="unlimited">Until triggered</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Create Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};