try {
  let rawText = $('Basic LLM Chain').first().json.text;
  rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  let plan = JSON.parse(rawText);
  return plan.map(dzien => ({ json: dzien }));
} catch (error) {
  throw new Error("BŁĄD KODU: " + error.message);
}