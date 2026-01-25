// src/components/Navigation.jsx
import React from "react";

export default function Navigation({ currentView, setCurrentView, setQuizMode }) {
  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "lessons", label: "Lessons", icon: "📖" },
    { id: "dialogs", label: "Dialogs", icon: "💬" },
    { id: "progress", label: "Progress", icon: "📊" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];

  const handleNavClick = (itemId) => {
    setCurrentView(itemId);
    setQuizMode(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-blue-600 bg-blue-50 scale-105"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className={`text-2xl mb-1 transition-transform ${
                  isActive ? "scale-110" : ""
                }`}>
                  {item.icon}
                </span>
                <span className={`text-xs font-medium ${
                  isActive ? "font-semibold" : ""
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}