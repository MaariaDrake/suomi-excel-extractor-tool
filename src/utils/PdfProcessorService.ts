
import { ProcessResult } from '../types/pdf-processor';
import { PdfTextExtractor } from './PdfTextExtractor';
import { CompanyDataParser } from './CompanyDataParser';
import { ExcelGenerator } from './ExcelGenerator';

export class PdfProcessorService {
  static async convertPdfToExcel(): Promise<ProcessResult> {
    try {
      console.log('Aloitetaan PDF:n lataus Euroclear-sivustolta...');
      
      // Haetaan PDF suoraan annetusta linkistä
      const pdfUrl = 'https://www.euroclear.com/dam/EFi/Statistics/Shareholders/Shareholders_20250430.pdf';
      
      const response = await fetch(pdfUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'application/pdf',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pdfArrayBuffer = await response.arrayBuffer();
      console.log('PDF ladattu onnistuneesti, koko:', pdfArrayBuffer.byteLength, 'tavua');
      
      // Käsitellään PDF ja poimitaan tiedot
      const extractedData = await this.extractDataFromPdf(pdfArrayBuffer);
      
      console.log('Extraktoitu data:', extractedData.length, 'riviä');
      
      // Luodaan Excel-tiedosto
      const excelBlob = await ExcelGenerator.createExcelFile(extractedData);
      const downloadUrl = URL.createObjectURL(excelBlob);

      console.log('Excel-tiedosto luotu onnistuneesti, rivejä:', extractedData.length);
      
      return {
        success: true,
        downloadUrl
      };
      
    } catch (error) {
      console.error('Virhe PDF:n käsittelyssä:', error);
      return {
        success: false,
        error: 'PDF:n käsittely epäonnistui: ' + (error as Error).message
      };
    }
  }

  private static async extractDataFromPdf(pdfArrayBuffer: ArrayBuffer) {
    const { text, date } = await PdfTextExtractor.extractTextFromPdf(pdfArrayBuffer);
    const companies = CompanyDataParser.parseCompanyData(text, date);
    
    console.log('Parsittu yhtiöitä:', companies.length);
    
    return companies;
  }
}
