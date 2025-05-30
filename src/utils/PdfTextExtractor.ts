
import * as pdfjsLib from 'pdfjs-dist';

// Asetetaan worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export class PdfTextExtractor {
  static async extractTextFromPdf(pdfArrayBuffer: ArrayBuffer): Promise<{ text: string; date: string }> {
    try {
      console.log('Aloitetaan PDF:n parsinta, tiedostokoko:', pdfArrayBuffer.byteLength, 'tavua');
      
      // Tarkistetaan että ArrayBuffer ei ole tyhjä
      if (pdfArrayBuffer.byteLength === 0) {
        throw new Error('PDF ArrayBuffer on tyhjä');
      }
      
      const pdf = await pdfjsLib.getDocument({ 
        data: pdfArrayBuffer,
        verbosity: 0 // Vähennetään pdf.js:n omia logeja
      }).promise;
      
      console.log('PDF ladattu onnistuneesti, sivuja yhteensä:', pdf.numPages);
      
      let allText = '';
      let extractedDate = '';
      
      // Käydään läpi kaikki sivut
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          console.log(`Käsitellään sivu ${pageNum}/${pdf.numPages}...`);
          
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          let pageText = '';
          textContent.items.forEach((item: any) => {
            if ('str' in item && item.str) {
              pageText += item.str + ' ';
            }
          });
          
          console.log(`Sivu ${pageNum} tekstin pituus:`, pageText.length, 'merkkiä');
          
          // Näytetään ensimmäiset 200 merkkiä debuggausta varten
          if (pageText.length > 0) {
            console.log(`Sivu ${pageNum} alkaa:`, pageText.substring(0, 200).replace(/\s+/g, ' '));
          }
          
          // Poimitaan päivämäärä ensimmäiseltä sivulta
          if (pageNum === 1 && !extractedDate) {
            extractedDate = this.extractDateFromText(pageText);
            console.log('Poimittu päivämäärä:', extractedDate);
          }
          
          allText += pageText + '\n';
          
        } catch (pageError) {
          console.error(`Virhe sivun ${pageNum} käsittelyssä:`, pageError);
          // Jatketaan muiden sivujen käsittelyä
        }
      }
      
      console.log('Koko PDF:n tekstin pituus:', allText.length, 'merkkiä');
      
      if (allText.trim().length === 0) {
        throw new Error('PDF:stä ei saatu tekstiä - tiedosto saattaa olla suojattu tai vioittunut');
      }
      
      return { text: allText, date: extractedDate };
      
    } catch (error) {
      console.error('Virhe PDF:n parsinnassa:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF')) {
          throw new Error('Tiedosto ei ole kelvollinen PDF');
        } else if (error.message.includes('password')) {
          throw new Error('PDF on salasanasuojattu');
        } else if (error.message.includes('corrupted')) {
          throw new Error('PDF-tiedosto on vioittunut');
        }
      }
      
      throw error;
    }
  }

  private static extractDateFromText(pdfText: string): string {
    console.log('Etsitään päivämäärää tekstistä...');
    
    // Etsitään päivämäärä eri muodoissa
    const datePatterns = [
      /(\d{1,2}\.\d{1,2}\.\d{4})/,  // pp.kk.vvvv
      /(\d{1,2}\/\d{1,2}\/\d{4})/,  // pp/kk/vvvv
      /(\d{4}-\d{1,2}-\d{1,2})/,    // vvvv-kk-pp
      /(\d{1,2}-\d{1,2}-\d{4})/     // pp-kk-vvvv
    ];
    
    for (const pattern of datePatterns) {
      const match = pdfText.match(pattern);
      if (match) {
        console.log('Löydettiin päivämäärä:', match[1]);
        return match[1];
      }
    }
    
    console.log('Päivämäärää ei löytynyt, käytetään nykyistä päivämäärää');
    
    // Palautetaan nykyinen päivämäärä, jos ei löydy
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  }
}
