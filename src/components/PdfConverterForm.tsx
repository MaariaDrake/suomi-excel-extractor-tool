import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Loader2 } from "lucide-react";
import { PdfProcessorService } from '../utils/PdfProcessorService';

export const PdfConverterForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleConvert = async () => {
    setIsLoading(true);
    setDownloadUrl(null);
    
    try {
      console.log('Aloitetaan PDF:n lataus ja muunnos...');
      
      const result = await PdfProcessorService.convertPdfToExcel();
      
      if (result.success && result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);
        toast({
          title: "Onnistui!",
          description: "PDF muunnettiin onnistuneesti Excel-tiedostoksi",
          duration: 5000,
        });
      } else {
        toast({
          title: "Virhe",
          description: result.error || "PDF:n muunnos epäonnistui",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Virhe PDF:n muunnoksessa:', error);
      toast({
        title: "Virhe",
        description: "PDF:n muunnos epäonnistui. Yritä uudelleen.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `euroclear-tilastot-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          PDF-Excel Muunnin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Lähde:</h4>
          <p className="text-blue-800 text-sm">
            Euroclear Finland - Osakkeenomistajat (huhtikuu 2025)
          </p>
          <p className="text-blue-600 text-xs mt-1 break-all">
            https://www.euroclear.com/dam/EFi/Statistics/Shareholders/Shareholders_20250430.pdf
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Excel-sarakkeet:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
            <div>• Päivämäärä</div>
            <div>• Yhtiö</div>
            <div>• Omistajia</div>
            <div>• Muutos edellinen kuukausi</div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Button
            onClick={handleConvert}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-8 text-lg transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Muunnetaan...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Lataa ja muunna PDF
              </>
            )}
          </Button>

          {downloadUrl && (
            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-8 text-lg transition-all duration-200 transform hover:scale-105"
            >
              <Download className="mr-2 h-5 w-5" />
              Lataa Excel-tiedosto
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Käsitellään PDF:ää...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
