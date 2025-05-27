
import { CompanyData } from '../types/pdf-processor';

export class MockDataService {
  static getMockData(): CompanyData[] {
    return [
      {
        'Päivämäärä': '30.04.2025',
        'Yhtiö': 'NORDEA BANK ABP',
        'Omistajia': '362 672',
        'Muutos edellinen kuukausi': '1 898'
      },
      {
        'Päivämäärä': '30.04.2025',
        'Yhtiö': 'FORTUM OYJ', 
        'Omistajia': '224 604',
        'Muutos edellinen kuukausi': '744'
      },
      {
        'Päivämäärä': '30.04.2025',
        'Yhtiö': 'NOKIA OYJ',
        'Omistajia': '224 148',
        'Muutos edellinen kuukausi': '949'
      },
      {
        'Päivämäärä': '30.04.2025',
        'Yhtiö': 'MANDATUM OYJ',
        'Omistajia': '215 202',
        'Muutos edellinen kuukausi': '778'
      },
      {
        'Päivämäärä': '30.04.2025',
        'Yhtiö': 'NESTE OYJ',
        'Omistajia': '199 204',
        'Muutos edellinen kuukausi': '3 358'
      },
      {
        'Päivämäärä': '30.04.2025',
        'Yhtiö': 'SAMPO OYJ',
        'Omistajia': '195 865',
        'Muutos edellinen kuukausi': '-310'
      }
    ];
  }
}
