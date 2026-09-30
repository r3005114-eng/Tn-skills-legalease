import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

/**
 * Parses uploaded document files (PDF, DOCX, TXT) and returns extracted text and metadata
 */
export async function parseDocumentFile(filePath, fileType, originalName) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    let extractedText = '';
    let pageCount = 1;

    const lowerType = (fileType || '').toLowerCase();
    const lowerName = (originalName || '').toLowerCase();

    if (lowerType.includes('pdf') || lowerName.endsWith('.pdf')) {
      const data = await pdfParse(fileBuffer);
      extractedText = data.text || '';
      pageCount = data.numpages || 1;
    } else if (lowerType.includes('word') || lowerType.includes('docx') || lowerName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value || '';
      // Approximate pages (approx 500 words per page)
      const words = extractedText.split(/\s+/).filter(Boolean).length;
      pageCount = Math.max(1, Math.ceil(words / 450));
    } else {
      // Plain text or markdown
      extractedText = fileBuffer.toString('utf-8');
      const lines = extractedText.split('\n').length;
      pageCount = Math.max(1, Math.ceil(lines / 45));
    }

    // Clean whitespace and sanitise
    const cleanedText = extractedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    return {
      text: cleanedText,
      pageCount,
      characterCount: cleanedText.length,
      wordCount: cleanedText.split(/\s+/).filter(Boolean).length,
    };
  } catch (error) {
    console.error(`[Document Parser] Error reading ${originalName}:`, error.message);
    throw new Error(`Unable to extract text from ${originalName}: ${error.message}`);
  }
}
