import React, { useRef, useState, useEffect } from "react";
import { BoundingBox } from "../types";
import { Crop, Sparkles, Scale } from "lucide-react";

interface InteractiveCropperProps {
  imageSrc: string;
  stampBox: BoundingBox;
  signatureBox: BoundingBox;
  activeEntity: "stamp" | "signature";
  onChangeStampBox: (box: BoundingBox) => void;
  onChangeSignatureBox: (box: BoundingBox) => void;
  onDetectAI: () => void;
  isDetecting: boolean;
}

type DragAction = {
  type: "move" | "resize";
  direction?: "n" | "s" | "e" | "w" | "nw" | "ne" | "se" | "sw";
  startBox: BoundingBox;
  startX: number;
  startY: number;
};

export const InteractiveCropper: React.FC<InteractiveCropperProps> = ({
  imageSrc,
  stampBox,
  signatureBox,
  activeEntity,
  onChangeStampBox,
  onChangeSignatureBox,
  onDetectAI,
  isDetecting,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragAction, setDragAction] = useState<DragAction | null>(null);

  const activeBox = activeEntity === "stamp" ? stampBox : signatureBox;
  const setBox = activeEntity === "stamp" ? onChangeStampBox : onChangeSignatureBox;

  // Track window resizing so we can keep layout aligned
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (
    e: React.PointerEvent,
    actionType: "move" | "resize",
    direction?: DragAction["direction"]
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    containerRef.current.setPointerCapture(e.pointerId);
    
    setDragAction({
      type: actionType,
      direction,
      startBox: { ...activeBox },
      startX: e.clientX,
      startY: e.clientY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragAction || !containerRef.current) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Calculate mouse delta in normalized percentage coordinates (0.0 - 1.0)
    const deltaX = (e.clientX - dragAction.startX) / rect.width;
    const deltaY = (e.clientY - dragAction.startY) / rect.height;

    let { x, y, width, height } = dragAction.startBox;

    if (dragAction.type === "move") {
      x = Math.max(0, Math.min(1 - width, x + deltaX));
      y = Math.max(0, Math.min(1 - height, y + deltaY));
    } else {
      const minSize = 0.04;
      const dir = dragAction.direction;

      // Vertical resizing
      if (dir?.includes("n")) {
        const originalBottom = y + height;
        const newY = Math.max(0, Math.min(originalBottom - minSize, y + deltaY));
        height = originalBottom - newY;
        y = newY;
      } else if (dir?.includes("s")) {
        height = Math.max(minSize, Math.min(1 - y, height + deltaY));
      }

      // Horizontal resizing
      if (dir?.includes("w")) {
        const originalRight = x + width;
        const newX = Math.max(0, Math.min(originalRight - minSize, x + deltaX));
        width = originalRight - newX;
        x = newX;
      } else if (dir?.includes("e")) {
        width = Math.max(minSize, Math.min(1 - x, width + deltaX));
      }
    }

    setBox({
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
      width: Number(width.toFixed(4)),
      height: Number(height.toFixed(4)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragAction && containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe fallback in case lock is not acquired
      }
    }
    setDragAction(null);
  };

  const renderResizableBox = (box: BoundingBox, isStamp: boolean) => {
    const isActive = (isStamp && activeEntity === "stamp") || (!isStamp && activeEntity === "signature");
    
    // Style settings
    const borderColor = isStamp ? "border-blue-600" : "border-purple-600";
    const bgOverlay = isStamp ? "bg-blue-500/10" : "bg-purple-500/10";
    const tagBg = isStamp ? "bg-blue-600 text-white" : "bg-purple-600 text-white";

    // Style variables for absolute layout
    const style: React.CSSProperties = {
      position: "absolute",
      left: `${box.x * 100}%`,
      top: `${box.y * 100}%`,
      width: `${box.width * 100}%`,
      height: `${box.height * 100}%`,
      touchAction: "none",
    };

    if (!isActive) {
      // Inactive outline
      return (
        <div
          key={isStamp ? "inactive-stamp" : "inactive-sig"}
          style={style}
          className={`border-2 border-dashed ${isStamp ? "border-blue-400/40" : "border-purple-400/40"} rounded transition-all duration-300 pointer-events-none`}
        >
          <span className={`absolute top-1 left-1 px-1.5 py-0.5 text-[9px] rounded font-medium opacity-60 ${isStamp ? "bg-blue-100/70 text-blue-800" : "bg-purple-100/70 text-purple-800"}`}>
            {isStamp ? "مهر" : "امضا"}
          </span>
        </div>
      );
    }

    const resizeHandles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

    return (
      <div
        key={isStamp ? "active-stamp" : "active-sig"}
        style={style}
        className={`border-[2.5px] ${borderColor} ${bgOverlay} rounded shadow-[0_0_15px_rgba(37,99,235,0.15)] select-none z-10`}
        onPointerDown={(e) => handlePointerDown(e, "move")}
      >
        {/* Label Tag inside Box */}
        <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded-t text-[11px] font-medium flex items-center gap-1.5 shadow ${tagBg}`}>
          <Crop className="w-3.5 h-3.5" />
          <span>محدوده {isStamp ? "مهر" : "امضا"} (قابل جابجایی)</span>
        </div>

        {/* Dynamic coordinate readout bottom left */}
        <div className="absolute -bottom-6 left-0 text-[10px] bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-mono select-none pointer-events-none opacity-80 shadow">
          {Math.round(box.width * 100)}% × {Math.round(box.height * 100)}%
        </div>

        {/* Grab-move indicator at the center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-950/40 backdrop-blur-[1px] text-white px-2 py-1 rounded text-xs flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity duration-200">
            <Scale className="w-3.5 h-3.5" />
            <span>بکشید و تنظیم کنید</span>
          </div>
        </div>

        {/* Resize Handles */}
        {resizeHandles.map((dir) => {
          // Absolute class placement coordinates
          let placementClass = "";
          switch (dir) {
            case "nw": placementClass = "-top-1.5 -left-1.5 cursor-nwse-resize"; break;
            case "n": placementClass = "-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize"; break;
            case "ne": placementClass = "-top-1.5 -right-1.5 cursor-nesw-resize"; break;
            case "e": placementClass = "top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize"; break;
            case "se": placementClass = "-bottom-1.5 -right-1.5 cursor-nwse-resize"; break;
            case "s": placementClass = "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize"; break;
            case "sw": placementClass = "-bottom-1.5 -left-1.5 cursor-nesw-resize"; break;
            case "w": placementClass = "top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize"; break;
          }

          return (
            <div
              key={dir}
              className={`absolute w-3.5 h-3.5 bg-white border-2 ${isStamp ? "border-blue-600" : "border-purple-600"} rounded-full shadow-sm z-20 hover:scale-125 transition-transform ${placementClass}`}
              onPointerDown={(e) => handlePointerDown(e, "resize", dir)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
      {/* Selector and AI button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 text-blue-600 p-1.5 rounded">
            <Crop className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">برش دستی سند</h3>
            <p className="text-[11px] text-slate-500">برای خروجی بهتر، کادرهای رنگی را جابه‌جا کنید</p>
          </div>
        </div>

        <button
          onClick={onDetectAI}
          disabled={isDetecting}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
            isDetecting
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow active:scale-[0.98]"
          }`}
        >
          {isDetecting ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
          )}
          <span>{isDetecting ? "در حال پردازش..." : "تشخیص خودکار با هوش مصنوعی"}</span>
        </button>
      </div>

      {/* Main Image Stage area wrapped in relative sandbox */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative bg-slate-900 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center max-h-[500px] select-none"
        style={{ touchAction: "none" }}
      >
        {/* Document Image */}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Document Viewer"
            draggable={false}
            className="max-h-[500px] w-auto h-auto object-contain select-none pointer-events-none"
          />
        ) : null}

        {/* Overlay Bounding Boxes */}
        {renderResizableBox(stampBox, true)}
        {renderResizableBox(signatureBox, false)}
      </div>

      {/* Visual Instruction Tips */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 mt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
          <span>مهر آبی / رنگی</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
          <span>امضا قلم مشکی / آبی</span>
        </div>
        <span>جهت جابجایی بکشید و از لنگرها برای تغییر سایز استفاده کنید.</span>
      </div>
    </div>
  );
};
