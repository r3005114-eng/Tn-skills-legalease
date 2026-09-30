import PDFDocument from 'pdfkit';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

/**
 * Generates a clean, professionally formatted PDF buffer from legal draft or summary content
 */
export async function generatePdfBuffer(title, content, metadata = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 54, bottom: 54, left: 60, right: 60 },
        info: {
          Title: title,
          Author: 'LegalEase AI Platform',
          Subject: 'First-Pass Legal Draft',
          Keywords: 'LegalEase, Legal Document, India',
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Header watermark/header
      doc.fontSize(8)
         .fillColor('#64748B')
         .text('LEGALEASE | CONFIDENTIAL LEGAL DRAFT', { align: 'right' })
         .moveDown(0.5);

      // Title
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#0F172A')
         .text(title.toUpperCase(), { align: 'center' })
         .moveDown(0.8);

      // Divider line
      doc.strokeColor('#CBD5E1')
         .lineWidth(0.75)
         .moveTo(60, doc.y)
         .lineTo(535, doc.y)
         .stroke()
         .moveDown(1);

      // Body content
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#1E293B')
         .lineGap(3);

      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
          doc.moveDown(0.8)
             .fontSize(13)
             .font('Helvetica-Bold')
             .fillColor('#0F172A')
             .text(trimmed.replace('# ', ''))
             .moveDown(0.4)
             .fontSize(10)
             .font('Helvetica')
             .fillColor('#1E293B');
        } else if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
          doc.moveDown(0.6)
             .fontSize(11)
             .font('Helvetica-Bold')
             .fillColor('#1E293B')
             .text(trimmed.replace(/^#+\s*/, ''))
             .moveDown(0.3)
             .fontSize(10)
             .font('Helvetica');
        } else if (trimmed === '---') {
          doc.moveDown(0.5)
             .strokeColor('#E2E8F0')
             .lineWidth(0.5)
             .moveTo(60, doc.y)
             .lineTo(535, doc.y)
             .stroke()
             .moveDown(0.5);
        } else if (trimmed.length > 0) {
          doc.text(trimmed, { align: 'justify' }).moveDown(0.3);
        } else {
          doc.moveDown(0.4);
        }
      }

      // Legal Disclaimer Footer
      doc.moveDown(2);
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .fillColor('#94A3B8')
         .text('DISCLAIMER: This document was prepared with LegalEase AI assistance for informational and preparatory drafting purposes. It is not a substitute for advice from a qualified advocate or legal practitioner. Prior to execution, ensure proper review, execution on appropriate stamp paper, and registration if required by law.', { align: 'justify' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates a Microsoft Word (.docx) buffer from content
 */
export async function generateDocxBuffer(title, content) {
  const paragraphs = [];

  // Title
  paragraphs.push(
    new Paragraph({
      text: title.toUpperCase(),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace('# ', ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^#+\s*/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 80 },
        })
      );
    } else if (trimmed.length > 0 && trimmed !== '---') {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 22 })],
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  }

  // Disclaimer paragraph
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'DISCLAIMER: Prepared with LegalEase AI assistance for preparatory drafting purposes. Consult a qualified advocate before execution.',
          italics: true,
          size: 18,
          color: '666666',
        })
      ],
      spacing: { before: 400, after: 200 }
    })
  );

  const doc = new DocxDocument({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  return await Packer.toBuffer(doc);
}
