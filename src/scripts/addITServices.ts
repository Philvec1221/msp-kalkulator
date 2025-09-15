// Script to add all IT services to the database
import { supabase } from '@/integrations/supabase/client';

const itServices = [
  {
    name: "Telefonische Unterstützung mittels Telefon-Hotline",
    description: "Telefonischer Support und Beratung während der Geschäftszeiten",
    time_in_minutes: 30,
    billing_type: "pro_client",
    package_level: "Basis",
    active: true
  },
  {
    name: "Wartung & Support von Microsoft Windows & Microsoft Office",
    description: "Dienstleistungen per Fernwartung oder durch vor-Ort Einsatz",
    time_in_minutes: 60,
    billing_type: "pro_client", 
    package_level: "Basis",
    active: true
  },
  {
    name: "Wartung & Support Branchenlösungen",
    description: "Dienstleistung per Fernwartung oder durch vor-Ort Einsatz für enthaltene Branchenlösungen mit Wartung, Support & Updates durch vectano (Ausnahme inhaltliche und fachliche Branchensoftware Unterstützung)",
    time_in_minutes: 90,
    billing_type: "pro_client",
    package_level: "Silver",
    active: true
  },
  {
    name: "Unterstützung bei Hersteller Updates & Koordination",
    description: "Unterstützung der Hersteller bei Updates & Koordination bei ihren eingesetzten Branchenlösungen",
    time_in_minutes: 45,
    billing_type: "pro_client",
    package_level: "Silver",
    active: true
  },
  {
    name: "Hardware Migration & Neuinstallation",
    description: "Migrationen von alter auf neue Hardware oder Neuinstallation des Betriebssystems",
    time_in_minutes: 240,
    billing_type: "fix",
    package_level: "Gold",
    active: true
  },
  {
    name: "Unterstützung bei Umzügen",
    description: "Unterstützung bei Umzügen innerhalb des Unternehmens",
    time_in_minutes: 180,
    billing_type: "fix",
    package_level: "Gold",
    active: true
  },
  {
    name: "Hardware Installation & Austausch",
    description: "Dienstleistungen bei Austausch oder Installation von Hardware",
    time_in_minutes: 120,
    billing_type: "fix",
    package_level: "Silver",
    active: true
  },
  {
    name: "Unterstützung bei Einführung neuer Lösungen",
    description: "Unterstützung von Herstellern bei Einführung neuer Lösungen",
    time_in_minutes: 120,
    billing_type: "fix",
    package_level: "Gold",
    active: true
  },
  {
    name: "Telefonanlage Konfiguration",
    description: "Konfiguration Ihrer bei vectano gekauften Telefonanlage (Mitel, Swyx, nfon und inopla)",
    time_in_minutes: 180,
    billing_type: "fix",
    package_level: "Silver",
    active: true
  },
  {
    name: "WLAN Infrastruktur Optimierung",
    description: "Optimierung der WLAN Infrastruktur durch Ausleuchtung des Gebäudes (Erstellung einer Übersichtung und Empfehlung von Standorten)",
    time_in_minutes: 360,
    billing_type: "fix",
    package_level: "Gold",
    active: true
  },
  {
    name: "Jährliche IT-Sensibilisierungen",
    description: "Schulung der Mitarbeiter im sicheren Umgang mit der IT, dem Internet & E-Mails. Erfüllt EU-DSGVO Vorgaben, Umfang ca. 1 Stunde",
    time_in_minutes: 60,
    billing_type: "pro_client",
    package_level: "Gold",
    active: true
  },
  {
    name: "Virtual CIO - IT-Meeting",
    description: "Aktueller Status, Rückblick, Zukunft, Beratung & Begleitung bei ihrer IT-Strategie, Unterstützung bei der Budgetplanung, Umfang ca. 1-2 Stunden",
    time_in_minutes: 90,
    billing_type: "pro_client",
    package_level: "Gold",
    active: true
  },
  {
    name: "IT-Consulting",
    description: "Beratung bei Einführung neuer Software, neuer Funktionen oder Digitalisierung von Prozessen bei bereits bestehender Software, was über den Umfang des Virtual CIO - IT-Meeting hinaus geht",
    time_in_minutes: 120,
    billing_type: "fix",
    package_level: "Platinum",
    active: true
  },
  {
    name: "Express-Einsätze für Systemstillstände",
    description: "Express-Einsätze für Systemstillstände oder Notfälle",
    time_in_minutes: 60,
    billing_type: "fix",
    package_level: "Platinum",
    active: true
  },
  {
    name: "Notfall-Reaktionszeit (Systemstillstand kritisch)",
    description: "z.B. der Server ist ausgefallen, ein wichtiger Arbeitsplatz (ohne Ersatz) ist ausgefallen",
    time_in_minutes: 120,
    billing_type: "fix",
    package_level: "Platinum",
    active: true
  },
  {
    name: "Vor-Ort-Technikereinsatz (Systemstillstand)",
    description: "Vor-Ort-Technikereinsatz bei Systemstillstand mit schneller Reaktionszeit",
    time_in_minutes: 180,
    billing_type: "fix",
    package_level: "Gold",
    active: true
  },
  {
    name: "Reaktionszeit - Priorität Normal",
    description: "z.B. eine Einstellung muss an einem Arbeitsplatz durchgeführt werden, das generelle Arbeiten ist möglich",
    time_in_minutes: 60,
    billing_type: "fix",
    package_level: "Silver",
    active: true
  },
  {
    name: "Reaktionszeit - Priorität Niedrig",
    description: "z.B. ein neuer Benutzer fängt im nächsten Monat an",
    time_in_minutes: 30,
    billing_type: "fix",
    package_level: "Basis",
    active: true
  },
  {
    name: "Dienstleistungs-Stundensatz",
    description: "Unterstützung Vor-Ort, per Telefon und/oder Fernwartung",
    time_in_minutes: 60,
    billing_type: "fix",
    package_level: "Basis",
    active: true
  },
  {
    name: "Fahrtkosten für Vor-Ort-Einsätze",
    description: "Fahrtkosten und Anfahrtszeit für Vor-Ort-Einsätze",
    time_in_minutes: 30,
    billing_type: "fix",
    package_level: "Basis",
    active: true
  },
  {
    name: "HelpDesk (Mo - Fr)",
    description: "HelpDesk Montag bis Freitag, gesetzliche Feiertage ausgeschlossen",
    time_in_minutes: 480,
    billing_type: "pro_client",
    package_level: "Silver",
    active: true
  },
  {
    name: "24/7 Bereitschaft - Reaktionszeit 2 Stunden",
    description: "Upgrade Bereitschaft auf 24/7 - Reaktionszeit 2 Stunden für Priorität 'Systemstillstand' oder 'kritisch'. Abrechnung des Einsatzes zu den normalen Stundensätzen zzgl. Zuschlägen",
    time_in_minutes: 120,
    billing_type: "pro_client",
    package_level: "Platinum",
    active: true
  },
  {
    name: "Office 365 Best Practice Trainings",
    description: "Jährliche Office 365 Best Practice Trainings für alle Mitarbeiter (mindestens 10 Teilnehmer je Training und Dauer ca. 3 Stunden). Mit diesem Training lernen Sie Microsoft Office 365 besser kennen und erhalten einen Überblick über die Produkte. Das Office 365 Best Practices Training fördert die Zusammenarbeit im Unternehmen und unterstützt die Digitalisierung von Prozessen. Gleichzeitig wird der Umgang mit den vectano E-Mail Sicherheits-Diensten geschult.",
    time_in_minutes: 180,
    billing_type: "pro_client",
    package_level: "Gold",
    active: true
  }
];

export async function addAllITServices() {
  console.log('Starting to add IT services...');
  
  for (let i = 0; i < itServices.length; i++) {
    const service = itServices[i];
    
    try {
      // Get the maximum sort_order and add 1
      const { data: maxOrderData } = await supabase
        .from('services')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextSortOrder = (maxOrderData?.[0]?.sort_order || 0) + 1;
      
      const serviceData = {
        ...service,
        min_package_level: service.package_level,
        sort_order: nextSortOrder
      };

      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select()
        .single();

      if (error) {
        console.error(`Error adding service "${service.name}":`, error);
        continue;
      }
      
      console.log(`✅ Added service: ${service.name}`);
      
    } catch (error) {
      console.error(`Error adding service "${service.name}":`, error);
    }
  }
  
  console.log('Finished adding IT services!');
}

// Run the script automatically
addAllITServices().then(() => {
  console.log('All IT services have been added to the database!');
}).catch((error) => {
  console.error('Error running script:', error);
});