import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Trash2, Play, Pause, Bell } from "lucide-react";
import { useData } from "../contexts/DataContext";

interface AlertsPanelProps {
  onBack: () => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ onBack }) => {
  const { alerts, deleteAlert } = useData();
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      const remaining: Record<string, string> = {};

      alerts.forEach((alert) => {
        if (alert.expiresAt) {
          const expiryDate =
            typeof alert.expiresAt === "string"
              ? new Date(alert.expiresAt)
              : alert.expiresAt;
          const timeLeft = expiryDate.getTime() - now.getTime();
          if (timeLeft > 0) {
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor(
              (timeLeft % (1000 * 60 * 60)) / (1000 * 60),
            );
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            remaining[alert.id] =
              `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
          } else {
            remaining[alert.id] = "Expired";
          }
        } else {
          remaining[alert.id] = "No expiry";
        }
      });

      setTimeRemaining(remaining);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [alerts]);

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
            Price Alerts
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your active alerts and notifications
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No alerts set up yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create alerts from individual stock pages to get notified of price
            changes and sentiment shifts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {alert.ticker}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {alert.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {alert.condition}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        Created:{" "}
                        {typeof alert.createdAt === "string"
                          ? new Date(alert.createdAt).toLocaleDateString()
                          : alert.createdAt.toLocaleDateString()}
                      </span>
                    </span>
                    {timeRemaining[alert.id] && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {timeRemaining[alert.id] === "Expired"
                            ? "Expired"
                            : timeRemaining[alert.id] === "No expiry"
                              ? "No expiry"
                              : `Expires in: ${timeRemaining[alert.id]}`}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
