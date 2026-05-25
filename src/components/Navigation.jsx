// src/components/Navigation.jsx
import React from "react";

export default function Navigation({ currentView, setCurrentView, setQuizMode, isAdmin }) {
  const navItems = [
    { id: "home",      label: "Home",     icon: "🏠" },
    { id: "lessons",   label: "Lessons",  icon: "📚" },
    { id: "dialogs",   label: "Dialogs",  icon: "💬" },
    { id: "ai-tutor",  label: "AI Tutor", icon: "🤖" },
    { id: "progress",  label: "Progress", icon: "📈" },
    { id: "settings",  label: "Settings", icon: "⚙️" },
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
                className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-blue-600 bg-blue-50 scale-105"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className={`text-xl mb-1 transition-transform ${isActive ? "scale-110" : ""}`}>
                  {item.icon}
                </span>
                <span className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Admin tab — visible to admins only */}
          {isAdmin && (
            <button
              onClick={() => handleNavClick("admin")}
              className={`flex flex-col items-center px-2 py-2 rounded-xl transition-all ${
                currentView === "admin"
                  ? "text-red-600 bg-red-50 scale-105"
                  : "text-red-400 hover:bg-red-50"
              }`}
            >
              <span className="text-xl mb-1">🛡️</span>
              <span className="text-xs font-medium">Admin</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
