import { BoundingBox, FilterMode, ElementConfig } from "../types";

/**
 * Helper to crop an image, apply advanced background keying and color isolation,
 * then render any manual eraser strokes to output a transparent PNG base64 string.
 */
export async function processDocumentElement(
  imageSrc: string,
  config: ElementConfig,
  isStamp: boolean
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const { box, threshold, colorMatchStrength, filterMode, strokeDensityBoost, eraserPaths } = config;

        // Create temporary canvas for calculations
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to get 2D context"));
          return;
        }

        // Calculate absolute pixel boundaries
        const sourceX = box.x * img.width;
        const sourceY = box.y * img.height;
        const sourceWidth = box.width * img.width;
        const sourceHeight = box.height * img.height;

        // Set dimensions of the cropped output
        canvas.width = Math.max(1, Math.round(sourceWidth));
        canvas.height = Math.max(1, Math.round(sourceHeight));

        // Draw cropped region of the source document
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Fetch pixel buffer
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Loop pixels
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          let a = data[i + 3];

          if (a === 0) continue;

          // 1. Calculate Average Luminance / Gray value
          const avg = (r + g + b) / 3;

          // 2. Smooth White Background Keying (with feathering margin of 16 levels)
          const featherRange = 16;
          const maxThreshold = threshold;
          const minThreshold = Math.max(0, threshold - featherRange);

          if (avg > maxThreshold) {
            a = 0;
          } else if (avg > minThreshold) {
            const ratio = (maxThreshold - avg) / (maxThreshold - minThreshold);
            a = Math.floor(a * ratio);
          }

          // If pixel survived white keying, apply specific color-isolation filters
          if (a > 0) {
            if (filterMode === "blue_stamp") {
              // Target blue stamp ink while ignoring black lines/texts and red notes
              // Blue stamps have high Blue (b) channel relative to Red (r) or Green (g)
              const maxOther = Math.max(r, g);
              // Calculate difference
              const blueAdvantage = b - maxOther;
              // Threshold based on custom strength (range 1 to 10)
              const requiredDiff = 12 * (11 - colorMatchStrength);

              if (blueAdvantage < requiredDiff) {
                // If it doesn't clearly display a blue-purple hue, fade it
                a = 0;
              } else {
                // Boost blue color saturation for corporate feel, darken red/green
                const boostFactor = 1.3;
                data[i] = Math.max(0, Math.round(r * 0.7)); // Darken Red
                data[i + 1] = Math.max(0, Math.round(g * 0.85)); // Keep slight green for natural cyan
                data[i + 2] = Math.min(255, Math.round(b * boostFactor)); // Amplify Blue
              }
            } else if (filterMode === "red_stamp") {
              // Target red stamp ink
              const maxOther = Math.max(g, b);
              const redAdvantage = r - maxOther;
              const requiredDiff = 12 * (11 - colorMatchStrength);

              if (redAdvantage < requiredDiff) {
                a = 0;
              } else {
                const boostFactor = 1.3;
                data[i] = Math.min(255, Math.round(r * boostFactor)); // Amplify Red
                data[i + 1] = Math.max(0, Math.round(g * 0.7));
                data[i + 2] = Math.max(0, Math.round(b * 0.7));
              }
            } else if (filterMode === "dark_stroke") {
              // Hand inked strokes - usually darker colors (low avg luminance)
              // We remove pixels with color tints that don't look like dark ink, 
              // or enhance ink lines directly
              if (avg > threshold - 20) {
                a = 0;
              } else {
                // Stretch contrast of ink
                const contrastFactor = 1.4;
                const newGray = Math.max(0, Math.round((avg - 40) * contrastFactor));
                
                // Keep the color profile but deepen the shade
                const ratio = avg > 0 ? newGray / avg : 0;
                data[i] = Math.max(0, Math.round(r * ratio));
                data[i + 1] = Math.max(0, Math.round(g * ratio));
                data[i + 2] = Math.max(0, Math.round(b * ratio));
              }
            } else if (filterMode === "monochrome") {
              // Output clean solid ink (ideal for digitizing signature cleanly to use on templates)
              // We convert all ink pixels to black
              const shadowThreshold = threshold - 30;
              if (avg > shadowThreshold) {
                a = 0;
              } else {
                // Black ink
                data[i] = 20;
                data[i + 1] = 27;
                data[i + 2] = 38;
              }
            }

            // Apply Ink Density/Contrast Boost
            if (a > 0 && strokeDensityBoost > 0) {
              const boostVal = strokeDensityBoost * 8;
              // Make ink darker by reducing RGB integers
              data[i] = Math.max(0, data[i] - boostVal * 2);
              data[i + 1] = Math.max(0, data[i + 1] - boostVal * 2);
              data[i + 2] = Math.max(0, data[i + 2] - boostVal * 2);
              // Amplify alpha
              a = Math.min(255, Math.round(a * (1 + strokeDensityBoost * 0.15)));
            }
          }

          data[i + 3] = a;
        }

        // Write filtered pixels back to temporary canvas
        ctx.putImageData(imageData, 0, 0);

        // 3. APPLY MANUAL ERASER OVERLAYS
        // Draw the recorded manual erase lines on top with 'destination-out' blend mode
        if (eraserPaths.length > 0) {
          ctx.save();
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          for (const path of eraserPaths) {
            if (path.points.length === 0) continue;
            ctx.beginPath();
            ctx.lineWidth = path.brushSize;

            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (let j = 1; j < path.points.length; j++) {
              ctx.lineTo(path.points[j].x, path.points[j].y);
            }
            ctx.stroke();
          }
          ctx.restore();
        }

        // Return clean png as base64 string
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      reject(new Error("Failed to load source image into processor"));
    };
    img.src = imageSrc;
  });
}
