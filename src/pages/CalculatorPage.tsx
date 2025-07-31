import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export function CalculatorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Kundenansicht & Kalkulation</h2>
          <p className="text-muted-foreground">Erstellen Sie Angebote für Ihre Kunden</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Vorschau
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            PDF Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Angebotskonfiguration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Konfigurieren Sie Ihr Angebot durch Auswahl von Services und Paketen.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kostenübersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mitarbeiterkosten:</span>
                <span>€ 0,00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lizenzkosten:</span>
                <span>€ 0,00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service-Kosten:</span>
                <span>€ 0,00</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Gesamtkosten:</span>
                <span>€ 0,00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}