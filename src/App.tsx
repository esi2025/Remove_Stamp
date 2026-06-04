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
  Info,
  History,
  Trash2,
  ExternalLink,
  Download
} from "lucide-react";
import { BoundingBox, ElementConfig, HistoryItem } from "./types";
import { generateSampleInvoice, generateSampleContract, generateSampleLease } from "./utils/documentGenerator";
import { InteractiveCropper } from "./components/InteractiveCropper";
import { ProcessedProduct } from "./components/ProcessedProduct";

export default function App() {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<"invoice" | "contract" | "lease">("invoice");
  
  // Windows Desktop integration state
  const [showWindowsModal, setShowWindowsModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log('PWA is installed');
      setDeferredPrompt(null);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Tab control
  const [activeEntity, setActiveEntity] = useState<"stamp" | "signature">("stamp");
  
  // Status reporting
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "info" | "success" | "error"; message: string } | null>({
    type: "info",
    message: "به سامانه تفکیک مهر و امضا خوش آمدید. فاکتور نمونه بارگذاری شده است. می‌توانید موقعیت کادرها را جابجا کنید.",
  });

  // Process history state
  const [historyList, setHistoryList] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("processed_history_v1");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return [];
  });

  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("processed_history_v1", JSON.stringify(historyList));
    } catch (_) {}
  }, [historyList]);

  // State configurations for our targets
  const [stampConfig, setStampConfig] = useState<ElementConfig>({
    box: { x: 0.18, y: 0.32, width: 0.44, height: 0.27 }, // Coordinates perfectly framing our generated sample stamp
    threshold: 215,
    colorMatchStrength: 7,
    filterMode: "blue_stamp",
    strokeDensityBoost: 2,
    eraserPaths: [],
    rotation: 0,
    contrast: 0,
  });

  const [signatureConfig, setSignatureConfig] = useState<ElementConfig>({
    box: { x: 0.28, y: 0.38, width: 0.49, height: 0.50 }, // Coordinates framing our generated signature
    threshold: 215,
    colorMatchStrength: 5,
    filterMode: "dark_stroke",
    strokeDensityBoost: 3,
    eraserPaths: [],
    rotation: 0,
    contrast: 0,
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
        rotation: 0,
        contrast: 0,
      });
      setSignatureConfig({
        box: { x: 0.28, y: 0.38, width: 0.49, height: 0.50 },
        threshold: 215,
        colorMatchStrength: 5,
        filterMode: "dark_stroke",
        strokeDensityBoost: 3,
        eraserPaths: [],
        rotation: 0,
        contrast: 0,
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
        rotation: 0,
        contrast: 0,
      });
      setSignatureConfig({
        box: { x: 0.12, y: 0.65, width: 0.28, height: 0.25 },
        threshold: 215,
        colorMatchStrength: 5,
        filterMode: "dark_stroke",
        strokeDensityBoost: 3,
        eraserPaths: [],
        rotation: 0,
        contrast: 0,
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
        rotation: 0,
        contrast: 0,
      });
      setSignatureConfig({
        box: { x: 0.12, y: 0.66, width: 0.32, height: 0.25 },
        threshold: 215,
        colorMatchStrength: 5,
        filterMode: "dark_stroke",
        strokeDensityBoost: 3,
        eraserPaths: [],
        rotation: 0,
        contrast: 0,
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
          rotation: 0,
          contrast: 0,
        }));
        setSignatureConfig((prev) => ({
          ...prev,
          box: { x: 0.5, y: 0.45, width: 0.35, height: 0.35 },
          eraserPaths: [],
          rotation: 0,
          contrast: 0,
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
      rotation: 0,
      contrast: 0,
    });
    setSignatureConfig({
      box: { x: 0.28, y: 0.38, width: 0.49, height: 0.50 },
      threshold: 215,
      colorMatchStrength: 5,
      filterMode: "dark_stroke",
      strokeDensityBoost: 3,
      eraserPaths: [],
      rotation: 0,
      contrast: 0,
    });
    setFeedback({
      type: "info",
      message: "مجدداً فاکتور شبیه‌سازی‌شده همراه با مهر آبی رنگ و امضای تیره بارگذاری شد.",
    });
  };

  const getDocumentDisplayName = (): string => {
    if (!isDemo) return "سند بارگذاری شده کاربر";
    if (selectedFile === "invoice") return "فاکتور خرید رسمی";
    if (selectedFile === "contract") return "قرارداد رسمی واگذاری";
    return "سند مالکیت تک‌برگ";
  };

  const handleSaveToHistory = (thumbnailUrl: string, type: "stamp" | "signature") => {
    if (!thumbnailUrl) return;
    const documentName = getDocumentDisplayName();
    const filter = type === "stamp" ? stampConfig.filterMode : signatureConfig.filterMode;
    
    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      type,
      thumbnailUrl,
      filterMode: filter,
      documentName,
    };

    setHistoryList((prev) => {
      if (prev.length > 0 && prev[0].thumbnailUrl === thumbnailUrl) {
        return prev;
      }
      return [newItem, ...prev.filter(item => item.thumbnailUrl !== thumbnailUrl)].slice(0, 5);
    });
    
    setFeedback({
      type: "success",
      message: `پردازش اخیر (${type === "stamp" ? "مهر شفاف" : "امضا شفاف"}) به لیست خروجی‌های اخیر در پایین صفحه الحاق گردید.`,
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
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          {/* Windows App Trigger Button */}
          <button
            type="button"
            onClick={() => setShowWindowsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-extrabold transition-all duration-200 shadow-xs cursor-pointer"
            title="تبدیل و نصب به عنوان برنامه مستقل ویندوزی"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span>🖥️ نسخه تحت ویندوز App</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md">پردازش فعال</span>
            <span className="text-sm text-slate-500 font-medium hidden md:inline">کاربر: مدیریت فنی</span>
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
                  onSaveToHistory={(url) => handleSaveToHistory(url, "stamp")}
                />
              ) : (
                <ProcessedProduct
                  key="product-sig"
                  imageSrc={imageSrc}
                  config={signatureConfig}
                  isStamp={false}
                  onChangeConfig={setSignatureConfig}
                  onSaveToHistory={(url) => handleSaveToHistory(url, "signature")}
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

        {/* 📋 Recent Processed History Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-2 text-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">تاریخچه خروجی‌های تفکیک‌شده اخیر (۵ پردازش اخیر)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">مهرها و امضاهای اخیری که با کلیک روی ستاره یا دکمه دانلود ثبت و لایه‌برداری کرده‌اید</p>
              </div>
            </div>
            
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setHistoryList([]);
                  setFeedback({ type: "info", message: "تمامی تاریخچه‌های پردازش اخیر پاک شدند." });
                }}
                className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-red-100 bg-red-50/50 px-3 py-1.5 rounded-lg hover:bg-red-50 self-end sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاک‌سازی تاریخچه</span>
              </button>
            )}
          </div>

          {historyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-3 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="p-3 bg-white rounded-full border border-slate-150 text-slate-300">
                <History className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold">هنوز پردازش یا دانلودی برای ثبت در تاریخچه اخیر وجود ندارد.</p>
              <p className="text-[10px] text-slate-400 max-w-sm text-center leading-relaxed">
                با انجام لایه‌برداری و دانلود خروجی مهر یا امضا (یا کلیک روی آیکون ستاره 🌟 در بخش پیش‌نمایش خروجی)، نسخه‌های ذخیره شده و مستقل اینجا برای دسترسی آسان لیست می‌شوند.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {historyList.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all flex flex-col h-48"
                >
                  {/* Image Canvas with checkerboard background */}
                  <div
                    onClick={() => setSelectedHistoryItem(item)}
                    className="flex-1 min-h-[110px] flex items-center justify-center p-3 cursor-zoom-in relative"
                    style={{
                      backgroundImage: "conic-gradient(#f1f5f9 25%, #ffffff 0, #ffffff 50%, #f1f5f9 0, #f1f5f9 75%, #ffffff 0)",
                      backgroundSize: "12px 12px",
                      backgroundPosition: "0 0"
                    }}
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.type === "stamp" ? "مهر" : "امضا"}
                      className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Hover Inspect Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-[10px] text-white bg-slate-900/90 py-1 px-2.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                        <span>بررسی و دانلود مجدد</span>
                      </span>
                    </div>

                    {/* Badge type */}
                    <span className={`absolute top-2 right-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm ${
                      item.type === "stamp" 
                        ? "bg-indigo-100 text-indigo-800 border border-indigo-200" 
                        : "bg-purple-100 text-purple-800 border border-purple-200"
                    }`}>
                      {item.type === "stamp" ? "🌟 مهر تفکیکی" : "✍️ امضا"}
                    </span>
                  </div>

                  {/* Metadata and Quick download/trash actions */}
                  <div className="bg-white border-t border-slate-150 p-2.5 flex flex-col justify-between select-none">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-extrabold text-slate-800 truncate max-w-[120px]" title={item.documentName}>
                        {item.documentName}
                      </span>
                      <span className="text-[9px] font-mono text-slate-450 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[9px] font-bold text-slate-500 truncate mt-0.5 max-w-[80px]">
                        فیلتر: {
                          item.filterMode === "blue_stamp" ? "مهر آبی" :
                          item.filterMode === "red_stamp" ? "مهر قرمز" :
                          item.filterMode === "dark_stroke" ? "رنگ تیره" :
                          item.filterMode === "monochrome" ? "سیاه سفید" : "رنگ اصلی"
                        }
                      </span>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = item.thumbnailUrl;
                            link.download = item.type === "stamp" ? "extracted_seal.png" : "extracted_signature.png";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="دانلود مستقیم PNG"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHistoryList((prev) => prev.filter((h) => h.id !== item.id));
                            setFeedback({ type: "info", message: "آیتم از تاریخچه پردازش حذف شد." });
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded transition-colors"
                          title="حذف از تاریخچه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🔍 Lightbox / Inspect Modal for Recent Processes */}
        {selectedHistoryItem && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col text-right"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  <h3 className="font-extrabold text-xs sm:text-sm">اطلاعات خروجی تفکیک‌شده ثبت شده</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHistoryItem(null)}
                  className="p-1 px-2 hover:bg-white/10 rounded text-white/95 text-xs font-semibold transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex flex-col items-center justify-center gap-5 text-slate-700">
                {/* Image in large canvas */}
                <div
                  className="w-full h-64 border border-slate-200 rounded-xl overflow-auto flex items-center justify-center p-6 relative"
                  style={{
                    backgroundImage: "conic-gradient(#f1f5f9 25%, #ffffff 0, #ffffff 50%, #f1f5f9 0, #f1f5f9 75%, #ffffff 0)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0"
                  }}
                >
                  <img
                    src={selectedHistoryItem.thumbnailUrl}
                    alt="Extracted Item Large Viewer"
                    className="max-h-full max-w-full object-contain drop-shadow-lg"
                  />
                </div>

                {/* Specs Table */}
                <div className="w-full space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center py-1 border-b border-slate-150">
                    <span className="font-bold">نوع خروجی:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      selectedHistoryItem.type === "stamp" ? "bg-indigo-50 text-indigo-700" : "bg-purple-50 text-purple-700"
                    }`}>
                      {selectedHistoryItem.type === "stamp" ? "مهر ژلاتینی کادردار" : "امضای خودکار یا دستی زنده"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-150">
                    <span className="font-bold">مربوط به سند:</span>
                    <span className="font-semibold text-slate-800">{selectedHistoryItem.documentName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-150">
                    <span className="font-bold">زمان پردازش و ثبت:</span>
                    <span className="font-mono">{selectedHistoryItem.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold">فیلتر کانال رنگی تفکیکی:</span>
                    <span className="font-semibold text-indigo-700">
                      {
                        selectedHistoryItem.filterMode === "blue_stamp" ? "مهر جوهر سورمه‌ای/آبی" :
                        selectedHistoryItem.filterMode === "red_stamp" ? "مهر جوهر زرشکی/سرخ" :
                        selectedHistoryItem.filterMode === "dark_stroke" ? "امضای آبی/سیاه خودکار" :
                        selectedHistoryItem.filterMode === "monochrome" ? "سیاه و سفید کانتراست بالا" : "رنگ پایه تصویر پس‌زمینه"
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = selectedHistoryItem.thumbnailUrl;
                    link.download = selectedHistoryItem.type === "stamp" ? "transparent_seal.png" : "transparent_signature.png";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود مجدد خروجی فاقد پس‌زمینه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHistoryItem(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  بستن پنجره
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </main>

      {/* Footer Stats as specified in the Professional Polish design mock */}
      <footer className="max-w-[1600px] w-full mx-auto px-8 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 font-mono mt-8">
        <div>وضعیت سرور: بهینه (120ms)</div>
        <div>نسخه سیستم: v4.2.1-PRO</div>
        <div>تمامی حقوق برای پردازش هوشمند محفوظ است.</div>
      </footer>

      {/* 🖥️ Windows Desktop Conversion Modal (PWA & Electron packing tool) */}
      {showWindowsModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-xl">🖥️</span>
                <h3 className="font-extrabold text-sm">تبدیل به نرم‌افزار تحت ویندوز (Windows Desktop Application)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWindowsModal(false)}
                className="p-1 px-2 hover:bg-white/10 rounded text-white/90 text-sm font-semibold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5 text-right text-slate-700" dir="rtl">
              <div className="bg-sky-50 border border-sky-100 text-sky-800 p-3.5 rounded-xl text-[11px] leading-relaxed font-semibold">
                ما دو راهکار فوق‌العاده برای اجرای این سامانه به صورت یک نرم‌افزار بومی، مستقل و پرسرعت آفلاین در سیستم‌عامل ویندوز شما قرار داده‌ایم.
              </div>

              {/* Method 1: Instant PWA Install */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                <h4 className="font-extrabold text-xs text-indigo-900 mb-2.5 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">۱</span>
                  <span className="text-xs">روش اول: نصب مستقیم و آنی تحت وب (PWA) — بسیار ساده و سریع</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  فناوری PWA به شما امکان می‌دهد این اپلیکیشن را هم‌اکنون به منوی استارت و نوار وظیفه (Taskbar) ویندوز خود اضافه کنید. پس از نصب، برنامه در یک پنجره مستقل سیستمی، بدون حاشیه‌های مرورگر و کاملا مشابه نرم‌افزارهای بومی ویندوز اجرا خواهد شد.
                </p>

                {deferredPrompt ? (
                  <button
                    type="button"
                    onClick={handleInstallPWA}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>نصب مستقیم نرم‌افزار روی ویندوز شما</span>
                  </button>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-850 p-3 rounded-lg text-[10px] leading-relaxed space-y-1">
                    <p className="font-bold text-amber-900">⚠️ نکات راهنمای نصب مستقیم PWA:</p>
                    <p className="opacity-95 leading-relaxed">
                      به دلیل اینکه اپلیکیشن در حال حاضر در قالب یک فریم شبیه‌ساز (iframe) در استودیو اجرا می‌شود، مرورگرها اجازه شروع نصب مستقیم را به فریم‌های داخلی نمی‌دهند.
                    </p>
                    <p className="font-semibold text-indigo-700 pt-1 leading-relaxed">
                      💡 راه‌حل فوری: کافی است از نوار ابزار بالای استودیو دکمه <span className="font-bold underline">«Open in unit window / tab»</span> را بزنید تا برنامه در تب مجزا بالا بیاید. سپس دکمه نصب فعال شده یا می‌توانید مستقیماً آیکون نصب (علامت مانیتور یا ⊕) در سمت راست آدرس بار Chrome را کلیک کنید!
                    </p>
                  </div>
                )}
              </div>

              {/* Method 2: Pack Native EXE using Electron */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                <h4 className="font-extrabold text-xs text-indigo-900 mb-2.5 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">۲</span>
                  <span className="text-xs">روش دوم: خروجی فایل اجرایی مستقل و بومی دسکتاپ (Windows Desktop .EXE)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
                  ما کدهای رانر بومی **Electron.js** و پکیجر پرتابل ویندوز را مستقیماً در این پروژه قرار داده‌ایم. برای ایجاد فایل نصبی <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600 text-[10px]">Setup.exe</code> مراحل ساده زیر را در سیستم خود انجام دهید:
                </p>

                <div className="bg-slate-900 text-slate-200 p-4.5 rounded-xl font-mono text-left text-xs leading-6 overflow-x-auto space-y-3.5 shadow-inner">
                  <div>
                    <span className="text-slate-450 text-[10px] block"># ۱. ابتدا سورس کد پروژه را از منوی بالا دانلود کرده و از حالت فشرده خارج کنید.</span>
                  </div>
                  <div>
                    <span className="text-slate-450 text-[10px] block"># ۲. ترمینال را در پوشه پروژه باز کنید و دستور نصب وابستگی‌ها را بزنید:</span>
                    <span className="text-teal-400 font-bold">npm</span> install
                  </div>
                  <div>
                    <span className="text-slate-450 text-[10px] block"># ۳. ابزار بومی‌ساز دسکتاپ را نصب کنید:</span>
                    <span className="text-teal-400 font-bold">npm</span> install -D electron electron-builder
                  </div>
                  <div>
                    <span className="text-slate-450 text-[10px] block"># ۴. دستور کامپایل خودکار و پکیج کردن به EXE را کلیک کنید:</span>
                    <span className="text-teal-400 font-bold">npm</span> run build-pc
                  </div>
                </div>

                <p className="text-[10px] text-slate-450 mt-2 leading-relaxed">
                  * فایل نصبی تولید شده نهایی در پوشه <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600 text-[10px]">dist/</code> در ویندوز شما ذخیره خواهد شد و کاملاً بی‌نیاز از اینترنت لایه‌برداری را با کیفیتی بی‌نظیر انجام می‌دهد.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowWindowsModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                متوجه شدم (بستن پنجره)
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
