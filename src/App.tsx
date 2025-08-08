import { PDFCombiner } from "./components/PDFCombiner";
import { useState } from "react";

import logo from "./assets/logo.svg";
import reactLogo from "./assets/react.svg";

export function App() {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'pdf-combiner',
      name: 'PDF スライド結合',
      description: 'PDFスライドを2-in-1や8-in-1形式で結合',
      icon: '📄',
      component: <PDFCombiner />
    }
  ];

  if (currentTool) {
    const tool = tools.find(t => t.id === currentTool);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto p-8 relative z-10">
          {/* 戻るボタン */}
          <div className="mb-6">
            <button
              onClick={() => setCurrentTool(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700 hover:text-gray-900"
            >
              ← ツール一覧に戻る
            </button>
          </div>

          {/* ツールコンポーネント */}
          {tool?.component}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-8 relative z-10">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-8 mb-8">
            <img
              src={logo}
              alt="Bun Logo"
              className="h-16 p-4 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
            />
            <img
              src={reactLogo}
              alt="React Logo"
              className="h-16 p-4 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] animate-[spin_20s_linear_infinite]"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔬 研究支援ツール
          </h1>
          <p className="text-gray-600 text-lg">
            研究活動を効率化するためのWebツール集
          </p>
        </div>

        {/* ツール一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setCurrentTool(tool.id)}
            >
              <div className="text-4xl mb-4 text-center">{tool.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                {tool.name}
              </h3>
              <p className="text-gray-600 text-center text-sm">
                {tool.description}
              </p>
              <div className="mt-4 text-center">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  開く →
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* フッター */}
        <div className="text-center mt-12 text-sm text-gray-500">
          Built with Bun + React • Made for research productivity
        </div>
      </div>
    </div>
  );
}

export default App;
