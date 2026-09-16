require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json({ limit: "20mb" }));

// Serve your Pictora AI website
app.use(express.static(__dirname));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Test endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Pictora AI backend is running"
  });
});

// ===============================
// ANALYZE STORY
// ===============================
app.post("/api/analyze-story", async (req, res) => {
  try {
    const { title, author, story, style } = req.body;

    if (!story || !story.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please provide a story."
      });
    }

    const prompt = `
You are the story-analysis engine for Pictora AI.

Analyze this story and convert it into a pictorial storybook.

Title: ${title || "Untitled"}
Author: ${author || "Unknown"}
Visual style: ${style || "comic illustration"}

STORY:
${story}

Return ONLY valid JSON in this exact structure:

{
  "summary": "short summary",
  "characters": [
    {
      "name": "character name",
      "description": "detailed physical appearance and personality"
    }
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "scene title",
      "storyText": "the part of the story represented by this scene",
      "imagePrompt": "detailed prompt for generating the illustration"
    }
  ]
}

Important:
- Detect all important characters.
- Keep character appearances consistent.
- Break the story into logical visual scenes.
- Make image prompts detailed.
- Include environment, characters, actions, emotions, lighting and camera composition.
`;

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: prompt
    });

    const text = response.output_text;

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      return res.status(500).json({
        success: false,
        error: "AI returned invalid JSON.",
        raw: text
      });
    }

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("Story analysis error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Story analysis failed."
    });
  }
});

// ===============================
// GENERATE IMAGE
// ===============================
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, style } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Image prompt is required."
      });
    }

    const finalPrompt = `
Create a high-quality pictorial storybook/comic illustration.

Style:
${style || "cinematic comic illustration"}

Scene:
${prompt}

Requirements:
- Strong visual storytelling
- Detailed characters
- Consistent character appearance
- Cinematic composition
- Expressive emotions
- Detailed environment
- Suitable for a storybook
`;

    const result = await client.images.generate({
      model: "gpt-image-2",
      prompt: finalPrompt,
      size: "1024x1024"
    });

    const image = result.data?.[0];

    if (!image) {
      throw new Error("No image was returned.");
    }

    // Depending on the API response, return available image data.
    if (image.b64_json) {
      return res.json({
        success: true,
        image: `data:image/png;base64,${image.b64_json}`
      });
    }

    if (image.url) {
      return res.json({
        success: true,
        image: image.url
      });
    }

    throw new Error("Image data was not returned.");

  } catch (error) {
    console.error("Image generation error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Image generation failed."
    });
  }
});

// ===============================
// UNKNOWN API ROUTES
// ===============================
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Pictora AI server running on port ${PORT}`);
});
