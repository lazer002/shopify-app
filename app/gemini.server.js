import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

export async function generateProductContent(productIdea) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
Generate a professional ecommerce product image prompt.

Product Idea: ${productIdea}

Return JSON only:

{
  "title": "",
  "description": "",
  "tags": "",
  "imagePrompt": "",
    "imageUrl": ""  ,
  "price": "",
  "vendor": "",
  "productType": "",
  "seoTitle": "",
  "seoDescription": ""
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  

  return JSON.parse(
    text.replace(/```json/g, "").replace(/```/g, "")
  );
}