
import React from 'react';
import { PdfConverterForm } from '../components/PdfConverterForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PDF-Excel Muunnin
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Muunna Euroclear-tilastot automaattisesti PDF:stä Excel-taulukoksi. 
            Työkalua voi käyttää kuukausittain uusimpien tilastojen hakemiseen.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <PdfConverterForm />
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Kuinka työkalu toimii?
            </h3>
            <div className="text-gray-600 text-sm space-y-2">
              <p>1. Klikkaa "Lataa ja muunna PDF" -painiketta</p>
              <p>2. Työkalu hakee automaattisesti uusimman PDF:n Euroclear-sivustolta</p>
              <p>3. PDF muunnetaan Excel-taulukoksi määritetyillä sarakkeilla</p>
              <p>4. Lataa valmis Excel-tiedosto</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
