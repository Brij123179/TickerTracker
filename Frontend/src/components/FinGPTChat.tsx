import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  TrendingUp,
  Shield,
  FileText,
  Zap,
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import { api } from "../services/api";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface FinGPTChatProps {
  onBack: () => void;
}

export const FinGPTChat: React.FC<FinGPTChatProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hi! I'm FinGPT, your AI-powered financial assistant. I can help you with market analysis, fraud detection, document processing, and financial advisory. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedMarket } = useData();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      icon: TrendingUp,
      label: "Market Analysis",
      action: `Analyze the current ${selectedMarket} market trends`,
    },
    {
      icon: Shield,
      label: "Risk Assessment",
      action: "Assess portfolio risk for a diversified investment",
    },
    {
      icon: FileText,
      label: "Document Review",
      action: "Help me understand a financial statement",
    },
    {
      icon: Zap,
      label: "Quick Insights",
      action: "Give me 3 key market insights for today",
    },
  ];

  const simulateTyping = async (response: string) => {
    // Simulate typing delay for better UX
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000),
    );
    setIsTyping(false);

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await api.chat.sendMessage(userMessage, selectedMarket);
      return response.response;
    } catch (error) {
      console.error("Chat API error:", error);
      return `I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment, or you can:

🔄 **Retry your question**
📊 **Try these alternatives:**
- Check the market overview for current trends
- Browse your watchlist for personalized insights
- View alerts for important updates

If the issue persists, please check your internet connection.`;
    }
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Get AI response from backend
    setIsTyping(true);
    try {
      const response = await generateResponse(messageToSend);
      await simulateTyping(response);
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
            FinGPT Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            AI-powered financial assistant for market insights and analysis
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-3xl">
                <div
                  className={`flex items-start space-x-3 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "bot"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    {message.type === "bot" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`flex-1 px-4 py-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      {message.content.split("\n").map((line, i) => (
                        <p
                          key={i}
                          className="mb-2 last:mb-0 whitespace-pre-wrap"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                    <div
                      className={`text-xs mt-2 ${
                        message.type === "user"
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-3xl">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        FinGPT is typing...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleSendMessage(action.action)}
                  className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input */}
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about market trends, risk analysis, or any financial question..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={2}
                disabled={isTyping}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
