/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  FileImage, 
  Upload, 
  CheckCircle, 
  Sparkles, 
  HelpCircle, 
  ArrowLeftRight, 
  RefreshCw,
  Stamp,
  PenTool,
  AlertTriangle,
  Info
} from "lucide-react";
import { BoundingBox, ElementConfig } from "./types";
import { generateSampleInvoice, generateSampleContract, generateSampleLease } from "./utils/documentGenerator";
import { InteractiveCropper } from "./components/InteractiveCropper";
import { ProcessedProduct } from "./components/ProcessedProduct";

export default function App() {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<"invoice" | "contract" | "lease">("invoice");
  
  // Tab control
  const [activeEntity, setActiveEntity] = useState<"stamp" | "signature">("stamp");
  
  // Status reporting
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "info" | "success" | "error"; message: string } | null>({
    type: "info",
    message: "به سامانه تفکیک مهر و امضا خوش آمدید. فاکتور نمونه بارگذاری شده است. می‌توانید موقعیت کادرها را جابجا کنید.",
  });

  // State configurations for our targets
  const [stampConfig, setStampConfig] = useState<ElementConfig>({
    box: { x: 0.18, y: 0.32, width: 0.44, height: 0.27 }, // Coordinates perfectly framing our generated sample stamp
    threshold: 215,
    colorMatchStrength: 7,
    filterMode: "blue_stamp",
    strokeDensityBoost: 2,
    eraserPaths: [],
  });

  const [signatureConfig, setSignatureConfig] = useState<ElementConfig>({
    box: { x: 0.28, y: 0.38, width: 0.49, height: 0.50 }, // Coordinates framing our generated signature
    threshold: 215,
    colorMatchStrength: 5,
    filterMode: "dark_stroke",
    strokeDensityBoost: 3,
    eraserPaths: [],
  });

  // Handle switching document from sidebar presets
  const handleSelectFile = (fileType: "invoice" | "contract" | "lease") => {
    setSelectedFile(fileType);
    setIsDemo(true);
    let dataUrl = "";
    if (fileType === "invoice") {
      dataUrl = generateSampleInvoice();
      setImageSrc(dataUrl);
      setStampConfig({
        box: { x: 0.18, y: 0.32, width: 0.44, height: 0.27 },
        threshold: 215,
        colorMatchStrength: 7,
        filterMode: "blue_stamp",
        strokeDensityBoost: 2,
        eraserPaths: [],
      });
      setSignatureConfig({
        box: { x: 0.28, y: 0.38, width: 0.49, height: 0.50 },
        threshold: 215,
        colorMatchStrength: 5,
        filterMode: "dark_stroke",
        strokeDensityBoost: 3,
        eraserPaths: [],
      });
      setFeedback({
        type: "success",
        message: "سند «فاکتور رسمی خرید» بارگذاری شد. موقعیت کادرهای سبز و بنفش روی آن تنظیم گردید.",
      });
    } else if (fileType === "contract") {
      dataUrl = generateSampleContract();
      setImageSrc(dataUrl);
      setStampConfig({
        box: { x: 0.58, y: 0.65, width: 0.30, height: 0.25 },
        threshold: 215,
        colorMatchStrength: 7,
        filterMode: "red_stamp",
        strokeDensityBoost: 2,
        eraserPaths: [],
      });
      setSignatureConfig({
        box: { x: 0.12, y: 0.65, width: 0.28, height: 0.25 },
        threshold: 215,
        colorMatchStrength: 5,
        filterMode: "dark_stroke",
        strokeDensityBoost: 3,
        eraserPaths: [],
      });
      setFeedback({
        type: "success",
        message: "سند «قرارداد واگذاری امتیاز» بارگذاری شد. فیلتر خودکار به مهر جوهر قرمز تغییر یافت.",
      });
    } else {
      dataUrl = generateSampleLease();
      setImageSrc(dataUrl);
      setStampConfig({
        box: { x: 0.58, y: 0.66, width: 0.30, height: 0.25 },
        threshold: 215,
        colorMatchStrength: 8,
        filterMode: "blue_stamp",
        strokeDensityBoost: 2,
        eraserPaths: [],
      });
      setSignatureConfig({
        box: { x: 0.12, y: 0.66, width: 0.32, height: 0.25 },
        threshold: 215,
        colorMatchStrength: 5,
        filterMode: "dark_stroke",
        strokeDensityBoost: 3,
        eraserPaths: [],
      });
      setFeedback({
        type: "success",
        message: "سند «ملک غیرمنقول تک‌برگ» بارگذاری شد. کادرهای دور مهر و امضا با جزئیات دقیق تراز شدند.",
      });
    }
  };

  // Load sample invoice on initial mount
  useEffect(() => {
    const dataUrl = generateSampleInvoice();
    setImageSrc(dataUrl);
  }, []);

  // Set message timeout
  useEffect(() => {
    if (feedback && feedback.type !== "info") {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle manual image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const loadImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "لطفاً فقط فایل‌های تصویری معتبر انتخاب کنید." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        setImageSrc(event.target.result);
        setIsDemo(false);
        setFeedback({
          type: "success",
          message: "تصویر سند با موفقیت بارگذاری شد. کادرهای برش را روی موقعیت دلخواه قرار دهید.",
        });

        // Reset Crop Frames to standard centered coordinates and clear eraser trails
        setStampConfig((prev) => ({
          ...prev,
          box: { x: 0.15, y: 0.15, width: 0.35, height: 0.35 },
          eraserPaths: [],
        }));
        setSignatureConfig((prev) => ({
          ...prev,
          box: { x: 0.5, y: 0.45, width: 0.35, height: 0.35 },
          eraserPaths: [],
        }));
      }
    };
    reader.onerror = () => {
      setFeedback({ type: "error", message: "در خواندن فایل تصویر مشکلی پیش آمد." });
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop listeners
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  // Auto-detection triggers via Server-side Gemini API
  const handleAutoDetectAI = async () => {
    if (!imageSrc) return;
    setIsDetecting(true);
    setFeedback({ type: "info", message: "در حال بررسی سند با هوش مصنوعی و مدل بینایی Gemini..." });

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "شناسایی موقعیت از سند با شکست مواجه شد.");
      }

      const { stamp, signature } = resData.data;

      let detectedAny = false;

      if (stamp && typeof stamp.x === "number") {
        setStampConfig((prev) => ({
          ...prev,
          box: {
            x: Math.max(0, stamp.x),
            y: Math.max(0, stamp.y),
            width: Math.min(1 - stamp.x, stamp.width),
            height: Math.min(1 - stamp.y, stamp.height),
          },
        }));
        detectedAny = true;
      }

      if (signature && typeof signature.x === "number") {
        setSignatureConfig((prev) => ({
          ...prev,
          box: {
            x: Math.max(0, signature.x),
            y: Math.max(0, signature.y),
            width: Math.min(1 - signature.x, signature.width),
            height: Math.min(1 - signature.y, signature.height),
          },
        }));
        detectedAny = true;
      }

      if (detectedAny) {
        setFeedback({
          type: "success",
          message: "براوو! هوش مصنوعی مهر و امضا را در تصویر پیدا کرد و موقعیت کادرها را خودکار تنظیم نمود.",
        });
      } else {
        setFeedback({
          type: "info",
          message: "هوش مصنوعی نتوانست مهر یا امضایی یافت کند. لطفاً کادرها را به صورت دستی روی تصویر تنظیم نمایید.",
        });
      }

    } catch (err: any) {
      console.error(err);
      setFeedback({
        type: "error",
        message: "قابلیت تشخیص خودکار موقتاً با خطا مواجه شد. بدون مشکل می‌توانید کادرها را به شکل دستی تنظیم کنید.",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  // Reset entirely to the generated invoice
  const handleResetToDemo = () => {
    const dataUrl = generateSampleInvoice();
    setImageSrc(dataUrl);
    setIsDemo(true);
    setStampConfig({
      box: { x: 0.18, y: 0.32, width: 0.44, height: 0.27 },
      threshold: 215,
      colorMatchStrength: 7,
      filterMode: "blue_stamp",
      strokeDensityBoost: 2,
      eraserPaths: [],
    });
    setSignatureConfig({
      box: { x: 0.28, y: 0.38, width: 0.49, height: 0.50 },
      threshold: 215,
      colorMatchStrength: 5,
      filterMode: "dark_stroke",
      strokeDensityBoost: 3,
      eraserPaths: [],
    });
    setFeedback({
      type: "info",
      message: "مجدداً فاکتور شبیه‌سازی‌شده همراه با مهر آبی رنگ و امضای تیره بارگذاری شد.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" dir="rtl">
      
      {/* Top Navigation conforming to Professional Polish Theme */}
      <header className="flex flex-col sm:flex-row items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">سامانه استخراج هوشمند مهر و امضا</h1>
            <p className="text-xs text-slate-400">لیرگذاری، حذف پس‌زمینه سفید و جداسازی مهرهای جوهری و امضاهای اسناد با مدل بینایی سنجی Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md">پردازش فعال</span>
            <span className="text-sm text-slate-500 font-medium">کاربر: مدیریت فنی</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-indigo-600 shadow-inner">
            مدیر
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1600px] w-full mx-auto px-4 py-6 flex-1 flex flex-col gap-6">
        
        {/* Dynamic Context Feedback Bar */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border shadow-sm transition-colors ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : feedback.type === "error"
                ? "bg-rose-50 border-rose-100 text-rose-800"
                : "bg-indigo-50 border-indigo-100 text-indigo-800"
            }`}
          >
            {feedback.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {feedback.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            {feedback.type === "info" && <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
            <span className="leading-relaxed font-semibold">{feedback.message}</span>
          </motion.div>
        )}

        {/* Drag over overlay layout */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl transition-all duration-300 ${
            isDraggingOver ? "outline-4 outline-dashed outline-indigo-500 bg-indigo-50/50 scale-[0.99]" : ""
          }`}
        >
          {/* Three-Column Dashboard Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: Sidebar with Recent items */}
            <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-xl flex flex-col p-4 shadow-sm w-full">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">سندهای فعال و اخیر</h2>
                <span className="text-[10px] bg-slate-100 text-slate-600 py-0.5 px-1.5 rounded-full font-mono">دمو</span>
              </div>
              
              <div className="space-y-2.5 mt-3 my-4">
                <div 
                  onClick={() => handleSelectFile("invoice")}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    selectedFile === "invoice" && isDemo
                      ? "bg-indigo-50/70 border-indigo-200 shadow-sm"
                      : "border-slate-100/80 hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">فاکتور_خرید_رسمی.png</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>۲ دقیقه پیش</span>
                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-sans font-medium">مهر آبی + امضا</span>
                  </div>
                </div>

                <div 
                  onClick={() => handleSelectFile("contract")}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    selectedFile === "contract" && isDemo
                      ? "bg-indigo-50/70 border-indigo-200 shadow-sm"
                      : "border-slate-100/80 hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">قرارداد_شماره_۱۲۸.pdf</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>۱ ساعت پیش</span>
                    <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[9px] font-sans font-medium">مهر سرخ+امضا</span>
                  </div>
                </div>

                <div 
                  onClick={() => handleSelectFile("lease")}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    selectedFile === "lease" && isDemo
                      ? "bg-indigo-50/70 border-indigo-200 shadow-sm"
                      : "border-slate-100/80 hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">سند_مالکیت_واحد_۴.pdf</span>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>امروز، ۱۰:۳۰</span>
                    <span className="bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded text-[9px] font-sans font-medium">مهر کادر دادگستری</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100">
                  <Upload className="w-3.5 h-3.5" />
                  <span>بارگذاری سند جدید</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </aside>

            {/* COLUMN 2: Workspace Viewport (Middle) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Uploader context reporting banner */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileImage className="w-9 h-9 text-indigo-500 shrink-0" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                      {isDemo ? `در حال پردازش سند پیش‌فرض` : "سند شخصی شما با موفقیت لود شده"}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-[280px]">
                      {isDemo ? "می‌توانید کادرهای برش را مستقیماً جابجا یا ابعاد آنها را دستکاری کنید." : "کادرهای رنگی را روی موقعیت مهر و امضا تنظیم کرده تا فیلتر شوند."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoDetectAI}
                  disabled={isDetecting}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-all active:scale-[0.98] shrink-0"
                >
                  {isDetecting ? "در حال پردازش..." : "تشخیص هوشمند AI"}
                </button>
              </div>

              {/* Main Crop Workstage Area */}
              <InteractiveCropper
                imageSrc={imageSrc}
                stampBox={stampConfig.box}
                signatureBox={signatureConfig.box}
                activeEntity={activeEntity}
                onChangeStampBox={(box) => setStampConfig((prev) => ({ ...prev, box }))}
                onChangeSignatureBox={(box) => setSignatureConfig((prev) => ({ ...prev, box }))}
                onDetectAI={handleAutoDetectAI}
                isDetecting={isDetecting}
              />
              
              {/* Help guidelines accordion box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>راهنمای لایه‌برداری تفکیکی مهر و امضا</span>
                </h4>
                <ul className="text-[11px] leading-relaxed text-slate-500 space-y-1.5 list-disc list-inside">
                  <li><strong>تشخیص مدل بینایی Gemini:</strong> با فشردن دکمه <span className="text-indigo-600 font-medium">«تشخیص هوشمند AI»</span> لایه کادرها هوشمندانه روی سند ریپوزیشن خواهند شد.</li>
                  <li><strong>حذف خط کشی و پس‌زمینه:</strong> هر بخش به محض کادربندی با متد ترنسپرنت لایه‌برداری شده و رنگ‌های رقیب مثل جدول‌های سیاه حذف خواهند شد.</li>
                  <li><strong>قلم مخدوش‌گیر دستی:</strong> گزینه‌ی پاک‌کن دستی در بخش پردازش به شما اجازه می‌دهد نقاط مزاحم مجاور را به کلی در خروجی حذف نمائید.</li>
                </ul>
              </div>

            </div>

            {/* COLUMN 3: Filters Board / Outputs Panel (Left or Right) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* Tab Selector Buttons for Stamp & Signature editing */}
              <div className="bg-slate-200/60 p-1 rounded-xl grid grid-cols-2 gap-1 border border-slate-300/40 shadow-inner">
                <button
                  onClick={() => setActiveEntity("stamp")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeEntity === "stamp"
                      ? "bg-white text-indigo-600 shadow-md"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <Stamp className="w-3.5 h-3.5 text-indigo-500" />
                  <span>تنظیم و استخراج مهر</span>
                </button>
                <button
                  onClick={() => setActiveEntity("signature")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeEntity === "signature"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5 text-purple-500" />
                  <span>تنظیم و استخراج امضا</span>
                </button>
              </div>

              {/* Display correct workspace according to selection */}
              {activeEntity === "stamp" ? (
                <ProcessedProduct
                  key="product-stamp"
                  imageSrc={imageSrc}
                  config={stampConfig}
                  isStamp={true}
                  onChangeConfig={setStampConfig}
                />
              ) : (
                <ProcessedProduct
                  key="product-sig"
                  imageSrc={imageSrc}
                  config={signatureConfig}
                  isStamp={false}
                  onChangeConfig={setSignatureConfig}
                />
              )}

            </div>

          </div>

          {/* Drag over file hint badge (Centered) */}
          {isDraggingOver && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 z-50 rounded-2xl">
              <div className="bg-white p-4 rounded-full shadow-lg text-indigo-600 animate-bounce">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-white font-bold text-sm">تصویر سند را همینجا رها کنید تا بارگذاری شود...</p>
            </div>
          )}

        </div>
      </main>

      {/* Footer Stats as specified in the Professional Polish design mock */}
      <footer className="max-w-[1600px] w-full mx-auto px-8 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 font-mono mt-8">
        <div>وضعیت سرور: بهینه (120ms)</div>
        <div>نسخه سیستم: v4.2.1-PRO</div>
        <div>تمامی حقوق برای پردازش هوشمند محفوظ است.</div>
      </footer>

    </div>
  );
}
