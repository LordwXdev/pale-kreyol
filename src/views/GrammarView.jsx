// src/views/GrammarView.jsx
import React, { useState } from "react";

export default function GrammarView({ selectedDialog, setCurrentView }) {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!selectedDialog || !selectedDialog.grammar) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No grammar lessons available for this dialog.</p>
        <button
          onClick={() => setCurrentView("dialog")}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl"
        >
          Back to Dialog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setCurrentView("dialog")}
          className="text-2xl hover:scale-110 transition"
        >
          ←
        </button>
        <div>
          <h2 className="text-2xl font-bold">📚 Grammar Lessons</h2>
          <p className="text-sm text-gray-600">{selectedDialog.title}</p>
        </div>
      </div>

      {/* Grammar Sections */}
      <div className="space-y-3">
        {selectedDialog.grammar.map((section, index) => {
          const isExpanded = expandedSection === index;
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Section Header - Clickable */}
              <button
                onClick={() => setExpandedSection(isExpanded ? null : index)}
                className="w-full p-4 text-left hover:bg-gray-50 transition flex items-center justify-between"
              >
                <h3 className="font-bold text-lg text-blue-700">{section.title}</h3>
                <span className={`text-2xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Section Content - Expandable */}
              {isExpanded && (
                <div className="p-4 pt-0 space-y-4 border-t">
                  {/* Explanation */}
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    {section.explanation}
                  </p>

                  {/* Table (if exists) */}
                  {section.table && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {section.table.headers.map((header, i) => (
                              <th key={i} className="p-3 text-left font-semibold">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              {row.map((cell, j) => (
                                <td key={j} className="p-3 border-b border-gray-200">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Examples */}
                  {section.examples && section.examples.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Examples:</h4>
                      {section.examples.map((example, i) => (
                        <div key={i} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-l-4 border-green-500">
                          <div className="space-y-1">
                            <p className="font-bold text-blue-700 text-lg">
                              {example.creole}
                            </p>
                            <p className="text-gray-700">
                              {example.english}
                            </p>
                            {example.explanation && (
                              <p className="text-sm text-gray-600 italic mt-2">
                                💡 {example.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Practice Button */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center">
        <p className="text-gray-700 mb-4">
          Ready to practice what you learned?
        </p>
        <button
          onClick={() => setCurrentView("dialog")}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
        >
          Practice with Exercises
        </button>
      </div>
    </div>
  );
}