import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PackagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paket-Konfiguration</h2>
        <p className="text-muted-foreground">Definieren Sie Multiplikatoren für verschiedene Service-Pakete</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Basis
              <Badge variant="secondary">1.0x</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Grundpaket mit Standard-Services ohne Aufschlag
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Standard
              <Badge variant="default">1.5x</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Erweiterte Services mit moderatem Aufschlag
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Premium
              <Badge variant="destructive">2.0x</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Premium-Services mit höchstem Service-Level
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service-Paket Zuordnungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Keine Service-Paket Zuordnungen konfiguriert. Fügen Sie zuerst Services hinzu.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}