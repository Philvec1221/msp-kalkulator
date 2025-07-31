import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useEmployees } from "@/hooks/useEmployees";

interface CalculationConfig {
  clients: number;
  servers: number;
  users: number;
}

export function ConfigPage() {
  const [config, setConfig] = useState<CalculationConfig>({
    clients: 10,
    servers: 10,
    users: 10
  });

  const { employees } = useEmployees();
  
  const activeEmployees = employees.filter(emp => emp.active);
  const averageCostPerMinute = activeEmployees.length > 0 
    ? activeEmployees.reduce((sum, emp) => sum + emp.hourly_rate, 0) / activeEmployees.length / 60
    : 0;

  

  return (
    <div className="space-y-6">
      {/* Configuration Inputs */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clients">Anzahl Clients</Label>
              <Input
                id="clients"
                type="number"
                value={config.clients}
                onChange={(e) => setConfig(prev => ({ ...prev, clients: parseInt(e.target.value) || 0 }))}
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servers">Anzahl Server</Label>
              <Input
                id="servers"
                type="number"
                value={config.servers}
                onChange={(e) => setConfig(prev => ({ ...prev, servers: parseInt(e.target.value) || 0 }))}
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="users">Anzahl User</Label>
              <Input
                id="users"
                type="number"
                value={config.users}
                onChange={(e) => setConfig(prev => ({ ...prev, users: parseInt(e.target.value) || 0 }))}
                className="text-center"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <span className="text-sm text-muted-foreground">Clients: </span>
              <span className="font-semibold">{config.clients}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Server: </span>
              <span className="font-semibold">{config.servers}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">User: </span>
              <span className="font-semibold">{config.users}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Berechnungsgrundlagen */}
        <Card>
          <CardHeader>
            <CardTitle>Berechnungsgrundlagen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Durchschnittliche Kosten/Min:</span>
              <span className="font-semibold">{averageCostPerMinute.toFixed(2)}€</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Aktive Mitarbeiter:</span>
              <span className="font-semibold">{activeEmployees.length}</span>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              Diese Werte bilden die Grundlage für alle Berechnungen in der Angebotserstellung.
            </p>
          </CardContent>
        </Card>

        {/* Berechnungshinweise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-yellow-600">💡</span>
              Berechnungshinweise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="text-blue-600">
                • Technikerkosten = Technikzeit × EK/Min × Anzahl (je nach Abrechnungseinheit)
              </div>
              
              <div className="text-blue-600">
                • Lizenzkosten = Lizenz-EK × Anzahl (je nach Abrechnungseinheit)
              </div>
              
              <div className="text-blue-600">
                • EK = Technikerkosten + Lizenzkosten
              </div>
              
              <div className="text-blue-600">
                • VK = EK × (1 + Aufschlag%)
              </div>
              
              <div className="text-blue-600">
                • Marge = VK - EK
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}