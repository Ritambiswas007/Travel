import { PDFDocument } from 'pdf-lib';
import { config } from '../config/env';
import { logger } from './logger';

export interface ChecklistItem {
  label: string;
  checked: boolean;
}

export async function generateChecklistPdf(
  title: string,
  items: ChecklistItem[]
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const font = await doc.embedFont('Helvetica');
  const fontSize = 12;
  const lineHeight = 18;

  page.drawText(title, {
    x: 50,
    y: height - 50,
    size: 18,
    font,
  });

  let y = height - 80;
  for (const item of items) {
    const text = `${item.checked ? '[X]' : '[ ]'} ${item.label}`;
    page.drawText(text, {
      x: 50,
      y,
      size: fontSize,
      font,
    });
    y -= lineHeight;
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

export async function generatePdfViaService(
  template: string,
  data: Record<string, unknown>
): Promise<Buffer | null> {
  if (!config.pdf.enabled || !config.pdf.serviceUrl) {
    logger.warn('PDF service disabled or URL not set');
    return null;
  }
  try {
    const res = await fetch(`${config.pdf.serviceUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, data }),
    });
    if (!res.ok) {
      throw new Error(`PDF service returned ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (e) {
    logger.error('PDF service error', e);
    return null;
  }
}
