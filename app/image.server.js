export async function generateImage(imagePrompt) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    imagePrompt
  )}`;
}