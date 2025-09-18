import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSavedOffers } from "@/hooks/useSavedOffers";
import { Edit, Trash2, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function SavedOffersPage() {
  const { savedOffers, loading, deleteSavedOffer } = useSavedOffers();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredOffers = savedOffers.filter(offer => 
    offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (offer.company_name && offer.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSendToCustomerView = (offerId: string) => {
    // Navigate to kundenview with offer parameter
    navigate(`/?offer=${offerId}#kundenview`);
    toast({
      title: "Kundenview geöffnet",
      description: "Zur Kundenansicht gewechselt.",
    });
  };

  const handleDuplicate = async (offer: any) => {
    // This would duplicate the offer with a new name
    toast({
      title: "Funktion in Entwicklung",
      description: "Die Duplizierfunktion wird in einer späteren Version implementiert.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gespeicherte Angebote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Lade Angebote...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gespeicherte Angebote</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Nach Name oder Firma suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Offers Table */}
          {filteredOffers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                {searchTerm ? 'Keine Angebote gefunden.' : 'Noch keine Angebote gespeichert.'}
              </div>
              {!searchTerm && (
                <div className="text-sm text-muted-foreground">
                  Erstellen Sie Ihr erstes Angebot in der Berechnungsseite.
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Konfiguration</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.name}</TableCell>
                    <TableCell>{offer.company_name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {offer.workstations} Arbeitsplätze
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {offer.servers} Server
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {offer.users} Benutzer
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(offer.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendToCustomerView(offer.id)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(offer)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Angebot löschen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sind Sie sicher, dass Sie das Angebot "{offer.name}" löschen möchten? 
                                Diese Aktion kann nicht rückgängig gemacht werden.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteSavedOffer(offer.id)}>
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}