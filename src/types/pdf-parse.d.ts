declare module 'pdf-parse' {
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown> | null;
    version: string;
    text: string;
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFParseResult>;
  
  export = pdfParse;
}
