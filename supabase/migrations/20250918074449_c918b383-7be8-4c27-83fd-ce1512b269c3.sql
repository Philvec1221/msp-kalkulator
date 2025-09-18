-- Fix billing_type constraint to allow per_tb and pro_site
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_billing_type_check;

-- Add updated constraint with all required billing types
ALTER TABLE services ADD CONSTRAINT services_billing_type_check 
CHECK (billing_type IN ('fix', 'pro_device', 'per_tb', 'pro_site'));

-- Add missing license assignments for services that should have them
-- Based on the pattern, most services should have the two RMM licenses
INSERT INTO service_licenses (service_id, license_id, include_cost)
SELECT 
    s.id,
    l.id,
    false -- Set to false by default like the existing assignments
FROM services s
CROSS JOIN licenses l
WHERE s.name IN (
    'Überwachung aller relevanten Netzwerk- und Peripheriegeräte',
    'Installation & Update von unterstützten Dritt-Hersteller-Anwendungen',
    'Jährliches Auditieren des Microsoft Active Directory Umgebung (OnPremise) & regelmäßige Bereinigung',
    'Erweiterte IT-Sicherheit - Externer Schwachstellenscan',
    'Erweiterte IT-Sicherheit - Interner Schwachstellenscan',
    'Erweiterte IT-Sicherheit - Behebung der Schwachstellen',
    'Online Zugriff auf ihre IT Dokumentation',
    'Privileged Access Management (PAM)',
    'Managed AntiVirus je Arbeitsplatz',
    'Managed AntiVirus je Server',
    'Erweiterte IT-Sicherheit',
    'Identitäts- und Zugriffsverwaltung',
    'Mobile Device Management',
    'Überwachung ihrer Haupt E-Mail Domain im Dark Web um kompromitierte Zugangsdaten ihrer Benutzer aufzuspüren',
    'Passwort Manager',
    'Passwort Manager Pro - inkl. Dark Web Monitoring',
    'vectano Managed Datensicherung Premium 2.0',
    'vectano Cloud Backup - Veeam - Software Lizenzen',
    'vectano Cloud Backup - Veeam - Speicherplatz',
    'vectano Cloud Continuity für PC',
    'Telefonische Unterstützung mittels Telefon-Hotline',
    'Dienstleistungen per Fernwartung oder durch vor-Ort Einsatz',
    'Dienstleistung per Fernwartung oder durch vor-Ort Einsatz',
    'Unterstützung der Hersteller bei Updates & Koordination bei ihren eingesetzten Branchenlösungen',
    'Migrationen von alter auf neue Hardware oder Neuinstallation des Betriebssystems',
    'Unterstützung bei Umzügen innerhalb des Unternehmens'
)
AND l.name IN ('RMM Advanced Software Management', 'RMM Managed Endpoint')
AND NOT EXISTS (
    SELECT 1 FROM service_licenses sl 
    WHERE sl.service_id = s.id AND sl.license_id = l.id
);