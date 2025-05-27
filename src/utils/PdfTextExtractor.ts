
import * as pdfjsLib from 'pdfjs-dist';

// Asetetaan worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export class PdfTextExtractor {
  static async extractTextFromPdf(pdfArrayBuffer: ArrayBuffer): Promise<{ text: string; date: string }> {
    try {
      console.log('Aloitetaan PDF:n parsinta...');
      
      const pdf = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;
      console.log('PDF ladattu, sivuja yhteensä:', pdf.numPages);
      
      let allText = '';
      let extractedDate = '';
      
      // Käydään läpi kaikki sivut
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let pageText = '';
        textContent.items.forEach((item: any) => {
          if ('str' in item) {
            pageText += item.str + ' ';
          }
        });
        
        console.log(`Sivu ${pageNum} teksti (ensimmäiset 500 merkkiä):`, pageText.substring(0, 500));
        
        // Poimitaan päivämäärä ensimmäiseltä sivulta
        if (pageNum === 1 && !extractedDate) {
          extractedDate = this.extractDateFromText(pageText);
          console.log('Poimittu päivämäärä:', extractedDate);
        }
        
        allText += pageText + '\n';
      }
      
      return { text: allText, date: extractedDate };
      
    } catch (error) {
      console.error('Virhe PDF:n parsinnassa:', error);
      throw error;
    }
  }

  private static extractDateFromText(pdfText: string): string {
    // Etsitään päivämäärä muodossa pp.kk.vvvv
    const dateRegex = /(\d{1,2}\.\d{1,2}\.\d{4})/;
    const match = pdfText.match(dateRegex);
    
    if (match) {
      return match[1];
    }
    
    // Palautetaan nykyinen päivämäärä, jos ei löydy
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  }
}
