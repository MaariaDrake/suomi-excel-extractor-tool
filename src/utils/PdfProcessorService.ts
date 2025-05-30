
import { ProcessResult } from '../types/pdf-processor';
import { PdfTextExtractor } from './PdfTextExtractor';
import { CompanyDataParser } from './CompanyDataParser';
import { ExcelGenerator } from './ExcelGenerator';

export class PdfProcessorService {
  static async convertPdfToExcel(): Promise<ProcessResult> {
    try {
      console.log('Aloitetaan PDF:n lataus Euroclear-sivustolta...');
      
      // Käytetään CORS-proxya PDF:n hakemiseen
      const pdfUrl = 'https://www.euroclear.com/dam/EFi/Statistics/Shareholders/Shareholders_20250430.pdf';
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(pdfUrl)}`;
      
      console.log('Haetaan PDF:ää proxy:n kautta:', proxyUrl);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf, */*',
          'Content-Type': 'application/pdf'
        }
      });
      
      if (!response.ok) {
        console.error('HTTP virhe:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const pdfArrayBuffer = await response.arrayBuffer();
      console.log('PDF ladattu onnistuneesti, koko:', pdfArrayBuffer.byteLength, 'tavua');
      
      if (pdfArrayBuffer.byteLength === 0) {
        throw new Error('PDF-tiedosto on tyhjä');
      }
      
      // Käsitellään PDF ja poimitaan tiedot
      const extractedData = await this.extractDataFromPdf(pdfArrayBuffer);
      
      console.log('Extraktoitu data:', extractedData.length, 'riviä');
      
      if (extractedData.length === 0) {
        throw new Error('PDF:stä ei löytynyt käsiteltävää dataa');
      }
      
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
      
      // Yritetään vaihtoehtoinen proxy jos ensimmäinen ei toimi
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.log('Yritetään vaihtoehtoista proxy-palvelua...');
        return await this.tryAlternativeProxy();
      }
      
      return {
        success: false,
        error: 'PDF:n käsittely epäonnistui: ' + (error as Error).message
      };
    }
  }

  private static async tryAlternativeProxy(): Promise<ProcessResult> {
    try {
      const pdfUrl = 'https://www.euroclear.com/dam/EFi/Statistics/Shareholders/Shareholders_20250430.pdf';
      const alternativeProxyUrl = `https://cors-anywhere.herokuapp.com/${pdfUrl}`;
      
      console.log('Yritetään vaihtoehtoista proxy:ä:', alternativeProxyUrl);
      
      const response = await fetch(alternativeProxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf, */*',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Alternative proxy failed: ${response.status}`);
      }
      
      const pdfArrayBuffer = await response.arrayBuffer();
      console.log('PDF ladattu vaihtoehtoisella proxy:llä, koko:', pdfArrayBuffer.byteLength, 'tavua');
      
      const extractedData = await this.extractDataFromPdf(pdfArrayBuffer);
      const excelBlob = await ExcelGenerator.createExcelFile(extractedData);
      const downloadUrl = URL.createObjectURL(excelBlob);
      
      return {
        success: true,
        downloadUrl
      };
      
    } catch (error) {
      console.error('Vaihtoehtoinen proxy epäonnistui:', error);
      return {
        success: false,
        error: 'PDF:n lataus epäonnistui kaikilla menetelmillä. Tarkista verkkoyhteytesi tai yritä myöhemmin uudelleen.'
      };
    }
  }

  private static async extractDataFromPdf(pdfArrayBuffer: ArrayBuffer) {
    try {
      const { text, date } = await PdfTextExtractor.extractTextFromPdf(pdfArrayBuffer);
      
      if (!text || text.trim().length === 0) {
        throw new Error('PDF:stä ei voitu lukea tekstiä');
      }
      
      const companies = CompanyDataParser.parseCompanyData(text, date);
      
      console.log('Parsittu yhtiöitä:', companies.length);
      
      if (companies.length === 0) {
        console.warn('Ei löytynyt yhtiötietoja. PDF-sisältö:', text.substring(0, 1000));
      }
      
      return companies;
    } catch (error) {
      console.error('Virhe PDF:n tekstin käsittelyssä:', error);
      throw error;
    }
  }
}
