
import { CompanyData } from '../types/pdf-processor';

export class CompanyDataParser {
  static parseCompanyData(text: string, date: string): CompanyData[] {
    const companies: CompanyData[] = [];
    
    // Jaetaan teksti riveihin
    const lines = text.split('\n');
    console.log('Käsitellään rivejä yhteensä:', lines.length);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Ohitetaan tyhjät rivit
      if (!line || line.length < 3) continue;
      
      console.log(`Käsitellään rivi ${i}: "${line}"`);
      
      // Etsitään rivejä joissa on sekä tekstiä että numeroita
      const hasLetters = /[A-ZÄÖÅa-zäöå]/.test(line);
      const numbers = line.match(/\d+/g);
      
      if (hasLetters && numbers && numbers.length >= 1) {
        // Yritetään parsia rivi
        const parsedData = this.parseLineToCompanyData(line, date);
        if (parsedData) {
          companies.push(parsedData);
          console.log(`✓ Lisätty: "${parsedData['Yhtiö']}" | Omistajia: "${parsedData['Omistajia']}" | Muutos: "${parsedData['Muutos edellinen kuukausi']}"`);
        } else {
          console.log(`✗ Ei voitu parsia: "${line}"`);
        }
      }
    }
    
    console.log(`Yhteensä löydetty ${companies.length} yhtiötä`);
    return companies;
  }

  private static parseLineToCompanyData(line: string, date: string): CompanyData | null {
    // Yritetään löytää yhtiön nimi ja numerot
    
    // Menetelmä 1: Etsitään yhtiön nimi joka päättyy OYJ:ään tai muuhun yrityspäätteeseen
    let companyMatch = line.match(/^([A-ZÄÖÅÜ][A-ZÄÖÅÜa-zäöåü\s&.-]+(OYJ|ABP|AB|OY|LTD|INC|CORP|GROUP|ASA))\s+(.+)/i);
    
    if (!companyMatch) {
      // Menetelmä 2: Etsitään mikä tahansa teksti jota seuraa numeroita
      companyMatch = line.match(/^([A-ZÄÖÅÜ][A-ZÄÖÅÜa-zäöåü\s&.-]+?)\s+(\d.*)$/);
    }
    
    if (!companyMatch) {
      // Menetelmä 3: Jaetaan välilyöntien perusteella ja etsitään numeroita
      const parts = line.split(/\s+/);
      let companyParts = [];
      let numberParts = [];
      
      for (let j = 0; j < parts.length; j++) {
        if (/^\d/.test(parts[j]) || /^[+-]\d/.test(parts[j])) {
          numberParts = parts.slice(j);
          break;
        } else {
          companyParts.push(parts[j]);
        }
      }
      
      if (companyParts.length > 0 && numberParts.length >= 1) {
        const companyName = companyParts.join(' ').trim();
        const shareholders = numberParts[0] || '';
        const change = numberParts[1] || '0';
        
        return {
          'Päivämäärä': date,
          'Yhtiö': companyName,
          'Omistajia': shareholders,
          'Muutos edellinen kuukausi': change
        };
      }
    } else {
      const companyName = companyMatch[1].trim();
      const numbersText = companyMatch[2] || companyMatch[3] || '';
      
      // Poimitaan numerot
      const numbers = numbersText.match(/([+-]?\d+(?:\s\d+)*)/g) || [];
      
      const shareholders = numbers[0] || '';
      const change = numbers[1] || '0';
      
      return {
        'Päivämäärä': date,
        'Yhtiö': companyName,
        'Omistajia': shareholders,
        'Muutos edellinen kuukausi': change
      };
    }
    
    return null;
  }
}
