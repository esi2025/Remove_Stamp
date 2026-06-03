import React, { useRef, useState, useEffect } from "react";
import { FilterMode, ElementConfig } from "../types";
import { processDocumentElement } from "../utils/imageUtils";
import { 
  Download, 
  Sparkles, 
  Trash2, 
  Eraser, 
  Sliders, 
  Contrast, 
  RotateCcw,
  MousePointerClick
} from "lucide-react";

interface ProcessedProductProps {
  imageSrc: string;
  config: ElementConfig;
  isStamp: boolean;
  onChangeConfig: (newConfig: ElementConfig) => void;
}

export const ProcessedProduct: React.FC<ProcessedProductProps> = ({
  imageSrc,
  config,
  isStamp,
  onChangeConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [outputUrl, setOutputUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEraserActive, setIsEraserActive] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(12);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  // Redraw / Re-process output whenever the configuration parameters changes
  useEffect(() => {
    let active = true;
    const updateOutput = async () => {
      setIsProcessing(true);
      try {
        const url = await processDocumentElement(imageSrc, config, isStamp);
        if (active) {
          setOutputUrl(url);
        }
      } catch (err) {
        console.error("Failed to filter image:", err);
      } finally {
        if (active) setIsProcessing(false);
      }
    };
    
    updateOutput();
    return () => {
      active = false;
    };
  }, [imageSrc, config, isStamp]);

  // Handle pointer draw interactions directly offset onto the display canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isEraserActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    // Re-scale client offsets to actual canvas pixel width/height
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentPath([{ x, y }]);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isEraserActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch (err) { }

    if (currentPath.length > 0) {
      // Append completed curve to eraser paths configurations
      const updatedPaths = [
        ...config.eraserPaths,
        { points: currentPath, brushSize }
      ];
      onChangeConfig({
        ...config,
        eraserPaths: updatedPaths
      });
      setCurrentPath([]);
    }
  };

  const handleResetEraser = () => {
    onChangeConfig({
      ...config,
      eraserPaths: []
    });
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = isStamp ? "transparent_seal.png" : "transparent_signature.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render client-side display canvas backing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !outputUrl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Draw current active path overlay (if holding down brush)
      if (isEraserActive && currentPath.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    };
    img.src = outputUrl;
  }, [outputUrl, currentPath, isEraserActive, brushSize]);

  // Handle configuration state updates easily
  const updateSetting = <K extends keyof ElementConfig>(key: K, value: ElementConfig[K]) => {
    onChangeConfig({
      ...config,
      [key]: value
    });
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
      
      {/* Checkerboard Viewer stage */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>خروجی شفاف {isStamp ? "مهر" : "امضا"}</span>
          </label>
          {isProcessing && (
            <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded-full animate-pulse">
              در حال بهینه‌سازی...
            </span>
          )}
        </div>

        {/* Checkerboard Background canvas board */}
        <div 
          ref={containerRef}
          className="relative min-h-[220px] max-h-[300px] border border-slate-200 rounded-lg overflow-auto flex items-center justify-center p-4 shadow-inner"
          style={{
            backgroundImage: "conic-gradient(#f1f5f9 25%, #ffffff 0, #ffffff 50%, #f1f5f9 0, #f1f5f9 75%, #ffffff 0)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0"
          }}
        >
          {outputUrl ? (
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`max-h-[200px] max-w-full select-none object-contain h-auto shadow-sm touch-none transition-all duration-300 ${
                isEraserActive ? "cursor-crosshair border-2 border-red-500/20" : "cursor-default"
              }`}
            />
          ) : (
            <div className="text-slate-400 text-xs flex flex-col items-center gap-1.5">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
              <span>آماده‌سازی تصویر...</span>
            </div>
          )}

          {isEraserActive && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow flex items-center gap-1 animate-pulse">
              <span>براش پاک‌کن فعال است</span>
            </div>
          )}
        </div>
      </div>

      {/* Editor filter settings */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1 border-b border-slate-200/60 pb-1.5">
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span>تنظیمات فیلترها و روتوش</span>
        </span>

        {/* Filter modes selectors */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-slate-600">نوع فیلتر حذف پس‌زمینه</span>
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            {isStamp ? (
              <>
                <button
                  onClick={() => updateSetting("filterMode", "blue_stamp")}
                  className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                    config.filterMode === "blue_stamp"
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  تفکیک جوهر آبی
                </button>
                <button
                  onClick={() => updateSetting("filterMode", "red_stamp")}
                  className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                    config.filterMode === "red_stamp"
                      ? "bg-red-600 border-red-600 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  تفکیک جوهر قرمز
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => updateSetting("filterMode", "dark_stroke")}
                  className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                    config.filterMode === "dark_stroke"
                      ? "bg-purple-600 border-purple-600 text-white shadow-sm animate-pulse-subtle"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  خودکار تیره
                </button>
                <button
                  onClick={() => updateSetting("filterMode", "monochrome")}
                  className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                    config.filterMode === "monochrome"
                      ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  تک‌رنگ مشکی (دیجیتال)
                </button>
              </>
            )}
            <button
              onClick={() => updateSetting("filterMode", "original_color")}
              className={`py-1.5 px-2 rounded text-xs font-medium border text-center col-span-2 transition-all ${
                config.filterMode === "original_color"
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              رنگ اصلی (حذف سفید محض)
            </button>
          </div>
        </div>

        {/* Sliders for precision editing */}
        <div className="flex flex-col gap-2.5">
          {/* Threshold Slider */}
          <div>
            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
              <span>شدت حذف پس‌زمینه</span>
              <span className="font-mono">{config.threshold} / 255</span>
            </div>
            <input
              type="range"
              min="140"
              max="250"
              value={config.threshold}
              onChange={(e) => updateSetting("threshold", parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
          </div>

          {/* Color match strength slider (only relevant if blue_stamp or red_stamp active) */}
          {(config.filterMode === "blue_stamp" || config.filterMode === "red_stamp") && (
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                <span>شدت تفکیک طول موج رنگ</span>
                <span className="font-mono">سطح {config.colorMatchStrength}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={config.colorMatchStrength}
                onChange={(e) => updateSetting("colorMatchStrength", parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
              />
            </div>
          )}

          {/* Stroke Boost density */}
          <div>
            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
              <span>غلظت رنگ جوهر</span>
              <span className="font-mono">+{config.strokeDensityBoost}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={config.strokeDensityBoost}
              onChange={(e) => updateSetting("strokeDensityBoost", parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Interactive Eraser Brush Section */}
        <div className="border-t border-slate-250/60 pt-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Eraser className="w-3.5 h-3.5 text-red-500" />
              <span>پاک‌کن و روتوش دستی دور زوائد فاکتور</span>
            </span>
            {config.eraserPaths.length > 0 && (
              <button
                onClick={handleResetEraser}
                className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
                title="پاک‌کردن تمامی روتوش‌ها"
              >
                <RotateCcw className="w-3 h-3" />
                <span>شروع مجدد</span>
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEraserActive(!isEraserActive)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                isEraserActive
                  ? "bg-red-600 text-white shadow-sm hover:bg-red-700"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{isEraserActive ? "غیرفعال‌سازی براش" : "فعال‌سازی براش پاک‌کن"}</span>
            </button>

            {isEraserActive && (
              <div className="flex items-center gap-2 flex-grow bg-white px-2 py-1.5 rounded-md border border-slate-200">
                <span className="text-[10px] text-slate-500 whitespace-nowrap">ضخامت: {brushSize}px</span>
                <input
                  type="range"
                  min="4"
                  max="40"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                />
              </div>
            )}
          </div>

          {isEraserActive ? (
            <p className="text-[10px] text-red-500/90 leading-relaxed bg-red-50/50 p-1.5 rounded border border-red-100 flex items-start gap-1">
              <MousePointerClick className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>روی تصویر خروجی کادر شطرنجی کلیک کنید یا لمس کنید و بکشید تا خطوط جدول یا سایه‌های بجامانده را پاک کند.</span>
            </p>
          ) : (
            <p className="text-[10px] text-slate-500/80 leading-relaxed">
              اگر خط فاکتور یا کادر جدول توی کادر برش گیر کرده، براش پاک‌کن را روشن کرده و آنها را با موس تمیز کنید.
            </p>
          )}
        </div>
      </div>

      {/* Dowload block triggers */}
      <button
        onClick={handleDownload}
        disabled={!outputUrl}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow hover:shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-1"
      >
        <Download className="w-4 h-4 text-blue-400" />
        <span>دانلود {isStamp ? "مهر" : "امضا"} تمیز و شفاف (PNG)</span>
      </button>

    </div>
  );
};
