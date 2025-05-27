
import { CompanyData } from '../types/pdf-processor';

export class CompanyDataParser {
  static parseCompanyData(text: string, date: string): CompanyData[] {
    const companies: CompanyData[] = [];
    
    // Jaetaan teksti riveihin
    const lines = text.split('\n');
    console.log('Käsitellään rivejä yhteensä:', lines.length);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Ohitetaan tyhjät rivit ja otsikot
      if (!line || line.length < 5) continue;
      if (line.includes('Päivämäärä') || line.includes('Yhtiö') || line.includes('Omistajia')) continue;
      if (line.includes('Sivu') || line.includes('Page') || line.includes('www.')) continue;
      if (line.includes('Euroclear') || line.includes('Statistics') || line.includes('Finland')) continue;
      if (line.includes('Total') || line.includes('Yhteensä')) continue;
      
      // Etsitään numerosarjoja riviltä
      const numberMatches = line.match(/\d+/g);
      if (!numberMatches || numberMatches.length < 2) continue;
      
      // Yksinkertaisempi lähestymistapa: etsitään rivejä jotka sisältävät:
      // 1. Tekstiä joka alkaa isolla kirjaimella
      // 2. Vähintään kaksi numerosarjaa
      
      // Etsitään yhtiön nimi (alkaa isolla kirjaimella, sisältää kirjaimia)
      const companyMatch = line.match(/^([A-ZÄÖÅÜ][A-ZÄÖÅÜa-zäöåü\s&.-]+?)(\s+\d+.*)/);
      
      if (companyMatch) {
        let companyName = companyMatch[1].trim();
        let numbersText = companyMatch[2].trim();
        
        // Siivotaan yhtiön nimi
        companyName = companyName.replace(/[.,;:]+$/, '');
        
        // Poimitaan numerot
        const numbers = numbersText.match(/([+-]?\d+(?:\s\d+)*)/g);
        
        if (numbers && numbers.length >= 2) {
          // Ensimmäinen numero on omistajien määrä, toinen on muutos
          let shareholders = numbers[0].replace(/\s+/g, ' ').trim();
          let change = numbers[1].replace(/\s+/g, ' ').trim();
          
          // Validoidaan tiedot
          if (this.isValidCompanyData(companyName, shareholders, change)) {
            companies.push({
              'Päivämäärä': date,
              'Yhtiö': companyName,
              'Omistajia': shareholders,
              'Muutos edellinen kuukausi': change
            });
            
            console.log(`Lisätty yhtiö: "${companyName}" | Omistajia: "${shareholders}" | Muutos: "${change}"`);
          }
        }
      } else {
        // Vaihtoehtoinen tapa: etsitään rivejä joissa on vähintään 2 numerosarjaa
        if (numberMatches.length >= 2 && /[A-ZÄÖÅÜ]/.test(line)) {
          const parsedData = this.parseAlternativeFormat(line, date);
          if (parsedData) {
            companies.push(parsedData);
            console.log(`Lisätty (alt): "${parsedData['Yhtiö']}" | Omistajia: "${parsedData['Omistajia']}" | Muutos: "${parsedData['Muutos edellinen kuukausi']}"`);
          }
        }
      }
    }
    
    console.log(`Yhteensä löydetty ${companies.length} yhtiötä`);
    return companies;
  }

  private static parseAlternativeFormat(line: string, date: string): CompanyData | null {
    // Yritetään jakaa rivi osiin välilyöntien perusteella
    const parts = line.split(/\s+/);
    
    if (parts.length >= 3) {
      // Ensimmäiset osat ovat todennäköisesti yhtiön nimi
      let companyParts = [];
      let numberParts = [];
      
      for (let j = 0; j < parts.length; j++) {
        if (/^\d/.test(parts[j]) || /^[+-]\d/.test(parts[j])) {
          // Tämä on numero, loput ovat numeroita
          numberParts = parts.slice(j);
          break;
        } else {
          companyParts.push(parts[j]);
        }
      }
      
      if (companyParts.length > 0 && numberParts.length >= 2) {
        let companyName = companyParts.join(' ').trim();
        companyName = companyName.replace(/[.,;:]+$/, '');
        
        let shareholders = numberParts[0];
        let change = numberParts[1];
        
        if (this.isValidCompanyData(companyName, shareholders, change)) {
          return {
            'Päivämäärä': date,
            'Yhtiö': companyName,
            'Omistajia': shareholders,
            'Muutos edellinen kuukausi': change
          };
        }
      }
    }
    
    return null;
  }

  private static isValidCompanyData(companyName: string, shareholders: string, change: string): boolean {
    return companyName.length >= 3 && 
           !companyName.includes('Sivu') && 
           !companyName.includes('Page') &&
           !companyName.includes('Statistics') &&
           !companyName.includes('Finland') &&
           !companyName.includes('Euroclear') &&
           shareholders.length > 0 &&
           change.length > 0;
  }
}
