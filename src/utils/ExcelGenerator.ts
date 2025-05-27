
import * as XLSX from 'xlsx';
import { CompanyData } from '../types/pdf-processor';

export class ExcelGenerator {
  static async createExcelFile(data: CompanyData[]): Promise<Blob> {
    // Luodaan uusi työkirja
    const workbook = XLSX.utils.book_new();
    
    // Luodaan taulukko datasta
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Lisätään taulukko työkirjaan
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Euroclear Tilastot');
    
    // Luodaan Excel-tiedosto binäärimuodossa
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Luodaan Blob oikealla MIME-tyypillä
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    return blob;
  }
}
