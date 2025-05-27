
export interface ProcessResult {
  success: boolean;
  error?: string;
  downloadUrl?: string;
}

export interface CompanyData {
  'Päivämäärä': string;
  'Yhtiö': string;
  'Omistajia': string;
  'Muutos edellinen kuukausi': string;
}
