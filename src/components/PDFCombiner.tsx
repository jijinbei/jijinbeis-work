import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';

export function PDFCombiner() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [combinationType, setCombinationType] = useState<'2in1' | '8in1'>('2in1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (files.length > 0) {
      setSelectedFiles(files);
    } else {
      alert('PDFファイルのみ選択してください');
    }
  };

  const combineSlides = async () => {
    if (selectedFiles.length === 0) {
      alert('PDFファイルを選択してください');
      return;
    }

    setIsProcessing(true);

    try {
      // 新しいPDFドキュメントを作成
      const pdfDoc = await PDFDocument.create();
      
      // 各PDFファイルを読み込み、ページを取得
      const allPages = [];
      
      for (const file of selectedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(arrayBuffer);
        const pageIndices = sourcePdf.getPageIndices();
        const copiedPages = await pdfDoc.copyPages(sourcePdf, pageIndices);
        allPages.push(...copiedPages);
      }

      // A4サイズの定義（ポイント単位）
      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;

      if (combinationType === '2in1') {
        // 2-in-1: 縦向きA4に2ページを上下に配置
        for (let i = 0; i < allPages.length; i += 2) {
          const newPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]); // 縦向き
          
          // 上側に1ページ目
          if (allPages[i]) {
            const leftPage = allPages[i];
            const leftBounds = leftPage.getSize();
            const leftScale = Math.min(
              (A4_WIDTH - 20) / leftBounds.width,
              (A4_HEIGHT / 2 - 20) / leftBounds.height
            ) * 0.9;
            
            // ページを埋め込んでから描画
            const embeddedLeftPage = await pdfDoc.embedPage(leftPage);
            
            newPage.drawPage(embeddedLeftPage, {
              x: (A4_WIDTH - leftBounds.width * leftScale) / 2,
              y: A4_HEIGHT / 2 + 10,
              width: leftBounds.width * leftScale,
              height: leftBounds.height * leftScale,
            });
          }
          
          // 下側に2ページ目
          if (allPages[i + 1]) {
            const rightPage = allPages[i + 1];
            const rightBounds = rightPage.getSize();
            const rightScale = Math.min(
              (A4_WIDTH - 20) / rightBounds.width,
              (A4_HEIGHT / 2 - 20) / rightBounds.height
            ) * 0.9;
            
            // ページを埋め込んでから描画
            const embeddedRightPage = await pdfDoc.embedPage(rightPage);
            
            newPage.drawPage(embeddedRightPage, {
              x: (A4_WIDTH - rightBounds.width * rightScale) / 2,
              y: 10,
              width: rightBounds.width * rightScale,
              height: rightBounds.height * rightScale,
            });
          }
        }
      } else if (combinationType === '8in1') {
        // 8-in-1: A4に8ページを2×4で配置
        for (let i = 0; i < allPages.length; i += 8) {
          const newPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
          
          const positions = [
            { x: 10, y: A4_HEIGHT * 3/4 + 5 }, // 左上（第1段）
            { x: A4_WIDTH / 2 + 5, y: A4_HEIGHT * 3/4 + 5 }, // 右上（第1段）
            { x: 10, y: A4_HEIGHT * 2/4 + 5 }, // 左中上（第2段）
            { x: A4_WIDTH / 2 + 5, y: A4_HEIGHT * 2/4 + 5 }, // 右中上（第2段）
            { x: 10, y: A4_HEIGHT * 1/4 + 5 }, // 左中下（第3段）
            { x: A4_WIDTH / 2 + 5, y: A4_HEIGHT * 1/4 + 5 }, // 右中下（第3段）
            { x: 10, y: 5 }, // 左下（第4段）
            { x: A4_WIDTH / 2 + 5, y: 5 } // 右下（第4段）
          ];
          
          for (let j = 0; j < 8 && (i + j) < allPages.length; j++) {
            const page = allPages[i + j];
            const pageBounds = page.getSize();
            const scale = Math.min(
              (A4_WIDTH / 2 - 15) / pageBounds.width,
              (A4_HEIGHT / 4 - 10) / pageBounds.height
            ) * 0.9;
            
            // ページを埋め込んでから描画
            const embeddedPage = await pdfDoc.embedPage(page);
            
            newPage.drawPage(embeddedPage, {
              x: positions[j].x,
              y: positions[j].y,
              width: pageBounds.width * scale,
              height: pageBounds.height * scale,
            });
          }
        }
      }

      // PDFをダウンロード
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `combined-slides-${combinationType}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF結合エラー:', error);
      alert('PDF結合中にエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        📄 PDF スライド結合ツール
      </h2>
      
      <div className="space-y-6">
        {/* ファイル選択 */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className={`text-4xl mb-2 transition-all duration-300 ${
              isDragOver ? 'transform scale-110' : ''
            }`}>
              {isDragOver ? '📥' : '📁'}
            </div>
            <div className="text-lg font-medium text-gray-700">
              {isDragOver 
                ? 'ここにPDFファイルをドロップしてください' 
                : 'PDFファイルを選択またはドラッグ&ドロップしてください'
              }
            </div>
            <div className="text-sm text-gray-500 mt-1">
              複数のファイルを選択可能です
            </div>
          </label>
        </div>

        {/* 選択されたファイル一覧 */}
        {selectedFiles.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">
              選択されたファイル ({selectedFiles.length}個):
            </h3>
            <ul className="space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index} className="text-sm text-gray-600">
                  📄 {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 結合タイプ選択 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">結合タイプを選択:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="combinationType"
                value="2in1"
                checked={combinationType === '2in1'}
                onChange={(e) => setCombinationType(e.target.value as '2in1' | '8in1')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-800">2-in-1</div>
                <div className="text-sm text-gray-600">
                  縦向きA4に2ページを上下に配置（読みやすい）
                </div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="combinationType"
                value="8in1"
                checked={combinationType === '8in1'}
                onChange={(e) => setCombinationType(e.target.value as '2in1' | '8in1')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-800">8-in-1</div>
                <div className="text-sm text-gray-600">
                  A4に8ページを2×4で配置（最大用紙節約）
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 結合ボタン */}
        <button
          onClick={combineSlides}
          disabled={selectedFiles.length === 0 || isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              処理中...
            </div>
          ) : (
            `📄 PDF結合 (${combinationType})`
          )}
        </button>

        {/* 使い方説明 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 使い方:</h4>
          <ul className="space-y-1 text-yellow-700">
            <li>• PDFファイルをクリックして選択、またはドラッグ&ドロップしてください</li>
            <li>• 複数のPDFファイルを選択してください</li>
            <li>• 2-in-1: 縦向きA4に2ページを上下に配置（読みやすい）</li>
            <li>• 8-in-1: A4に8ページを2×4で配置（最大用紙節約）</li>
            <li>• 例：16ページのスライド → 2-in-1なら8枚、8-in-1なら2枚のA4用紙</li>
            <li>• 結合後のPDFが自動的にダウンロードされます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
