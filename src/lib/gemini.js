// PASTE YOUR REAL API KEY HERE
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const MODEL_NAME = "gemini-2.5-flash-lite";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

// Helper: Convert Image File to Base64
const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Remove the "data:image/jpeg;base64," part
      const base64Data = reader.result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 1. REAL VISUAL SEARCH (Returns JSON Object) - Now accepts dynamic categories
export const analyzeImageForSearch = async (file, categoryTree = null) => {
  try {
    const base64Data = await fileToBase64(file);
    
    // Format categories for the prompt (dynamic or fallback to default)
    let categoryOptions;
    if (categoryTree && Object.keys(categoryTree).length > 0) {
      categoryOptions = Object.entries(categoryTree)
        .map(([cat, subs]) => `- ${cat}: ${subs.join(", ")}`)
        .join("\n");
    } else {
      // Fallback to hardcoded defaults if no categories passed
      categoryOptions = `- Electronics: Smartphones, Laptops, Headsets, Keyboards, Mice, Cameras, Monitors
      - Fashion: Shoes, Men's Clothing, Women's Clothing, Watches, Accessories
      - Home: Furniture, Decor, Kitchen, Lighting`;
    }
    
    // We give the AI the strict list of categories to choose from
    const prompt = `
      Analyze this product image.
      Identify the Main Category and the specific Sub-Category.
      
      Valid Options:
      ${categoryOptions}

      Return ONLY a raw JSON object. Do not write markdown or explanations.
      Format: {"category": "MainCategory", "subCategory": "SubCategory"}
    `;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: file.type,
              data: base64Data
            }
          }
        ]
      }]
    };

    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Clean up markdown if the AI adds it (e.g. ```json ... ```)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Parse the JSON
    const result = JSON.parse(text);
    
    console.log("AI Detected:", result);
    return result; // Returns { category: "...", subCategory: "..." }

  } catch (error) {
    console.error("Visual Search Failed:", error);
    // Fallback if AI fails - use first category from tree or default
    const firstCategory = categoryTree ? Object.keys(categoryTree)[0] : "Electronics";
    const firstSub = categoryTree && categoryTree[firstCategory] ? categoryTree[firstCategory][0] : "Smartphones";
    return { category: firstCategory, subCategory: firstSub }; 
  }
};

// 2. REAL CHATBOT (Context Aware)
export const askRealAI = async (userQuestion, inventoryContext) => {
  try {
    const prompt = `
      You are the AI Assistant for 'NexusStore'.
      
      CURRENT INVENTORY DATA:
      ${inventoryContext}

      USER QUESTION: "${userQuestion}"

      INSTRUCTIONS:
      1. Answer based ONLY on the inventory data above.
      2. If asking for stock of a specific size (e.g. Size M), check the 'sizes' field in the data.
      3. If the product is NOT in the list, say "I am sorry, we don't have that in stock."
      4. Be concise and friendly.
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    return "I am having trouble reading the database. Please try again.";
  }
};

// 3. DESCRIPTION GENERATOR
export const generateDescription = async (productName) => {
    const payload = {
      contents: [{ parts: [{ text: `Write a sophisticated 2-sentence marketing description for: ${productName}. Focus on material and features.` }] }]
    };

    try {
        const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) { return "Manual description required."; }
};