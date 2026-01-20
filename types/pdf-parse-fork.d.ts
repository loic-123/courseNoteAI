declare module 'pdf-parse-fork' {
  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
  }

  interface PDFResult {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer | ArrayBuffer): Promise<PDFResult>;
  export default pdfParse;
}
