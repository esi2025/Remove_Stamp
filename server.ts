import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON payload size to support base64 images
app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Route to detect stamp and signature using Gemini AI
app.post("/api/detect", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image base64 data is required." });
    }

    // Extract mime type and base64 string
    const regex = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/;
    const matches = image.match(regex);
    let mimeType = "image/png";
    let base64Data = image;

    if (matches) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const ai = getGeminiClient();

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: `Identify the exact bounding boxes of the Stamp (مهر) and the Signature (امضا) in the provided document image.
Return the normalized coordinates (0 to 1, relative to the top-left of the image) of their outer bounding boxes.
- For the Stamp (مهر): This is usually a blue, purple, or red seal/stamp with text/logo and circular or rectangular outer lines.
- For the Signature (امضا): This is a handwritten stroke, pen markings, or written signature.
Return coordinates under 'stamp' and 'signature' keys.
If you do not see a stamp or signature, return null for that key.`,
    };

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        stamp: {
          type: Type.OBJECT,
          description: "Bounding box of the Stamp/Seal if present. Coordinates are in 0 to 1 normalized space of the overall image.",
          properties: {
            x: { type: Type.NUMBER, description: "Normalized X coordinate of the top-left corner of the bounding box (0.0 to 1.0)" },
            y: { type: Type.NUMBER, description: "Normalized Y coordinate of the top-left corner of the bounding box (0.0 to 1.0)" },
            width: { type: Type.NUMBER, description: "Normalized width of the bounding box (0.0 to 1.0)" },
            height: { type: Type.NUMBER, description: "Normalized height of the bounding box (0.0 to 1.0)" },
          },
          required: ["x", "y", "width", "height"],
        },
        signature: {
          type: Type.OBJECT,
          description: "Bounding box of the Handwritten Signature if present. Coordinates are in 0 to 1 normalized space of the overall image.",
          properties: {
            x: { type: Type.NUMBER, description: "Normalized X coordinate of the top-left corner of the bounding box (0.0 to 1.0)" },
            y: { type: Type.NUMBER, description: "Normalized Y coordinate of the top-left corner of the bounding box (0.0 to 1.0)" },
            width: { type: Type.NUMBER, description: "Normalized width of the bounding box (0.0 to 1.0)" },
            height: { type: Type.NUMBER, description: "Normalized height of the bounding box (0.0 to 1.0)" },
          },
          required: ["x", "y", "width", "height"],
        },
      },
    };

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, textPart],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const parsedText = result.text || "{}";
    const detectedData = JSON.parse(parsedText);

    return res.json({ success: true, data: detectedData });

  } catch (error: any) {
    console.error("Gemini Detection Error:", error);
    return res.status(500).json({
      error: "Failed to detect elements using AI.",
      details: error.message || error,
    });
  }
});

// Setup Client Hosting & Vite dev-server integration
async function boot() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for local development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted.");
  } else {
    // Serve static compiled assets in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static client files deployed at /dist");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

boot().catch((err) => {
  console.error("Failed to boot Express server:", err);
});
