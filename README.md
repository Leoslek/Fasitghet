# Fasitghet
-- Sidstruktur
1. INDEX (Startsida)
• 	Kort presentation av föreningen
• 	Snabblänkar: Felanmälan, Boka tvättid, Mina sidor
• 	Driftinfo / viktiga meddelanden
• 	Kontaktinfo i sidfot

2. INLOGGNING
• 	E‑post + lösenord
• 	BankID (om du vill vara modern)
• 	“Glömt lösenord”
• 	Rollbaserad redirect (boende → Min sida, styrelse → Admin, fastighetsskötare → Ärenden)

3. MIN SIDA (Boendeportal)
3.1 Pågående ärenden
• 	Felanmälningar
• 	Status (registrerad → pågående → åtgärdad)
• 	Kommunikation med fastighetsskötare
• 	Bilagor (bilder, dokument)
3.2 Mina bokningar
• 	Tvättstuga
• 	Föreningslokal / bastu / gästlägenhet (om ni lägger till det senare)
• 	Avbokning / ombokning
• 	Historik

4. FELANMÄLAN
• 	Formulär med kategori (el, vatten, hiss, allmänt, störning, lägenhet)
• 	Möjlighet att bifoga bilder
• 	Automatisk routing till fastighetsskötare eller styrelse
• 	Notiser vid statusändring

5. BOKA TVÄTTID
• 	Kalender
• 	Regler (max X bokningar, avbokning senast X timmar innan)
• 	Bekräftelse via e‑post eller intern notis

6. MEDDELANDEN
• 	Utskick från styrelsen
• 	Driftinfo
• 	Arkiv för tidigare meddelanden (Krav för arkivering: 1 månad plus upplöst problem)
• 	Push‑notiser (om du bygger det)

7. KONTAKT
• 	Styrelsen
• 	Fastighetsskötare
• 	Ekonomisk förvaltare
• 	Journummer
• 	Kontaktformulär

 8. ADMIN – Hyresvärd / Fastighetsskötare / Styrelse
8.1 Dashboard
• 	Översikt över inkomna ärenden
• 	Snabbstatistik (antal felanmälningar, bokningar, olösta ärenden)
8.2 Ärendehantering
• 	Lista över felanmälningar
• 	Statusändring
• 	Interna anteckningar
• 	Kommunikation med boende
• 	Bilagor
8.3 Bokning Administration
• 	Lägga till/ta bort bokningsbara resurser
• 	Blockera tider (t.ex. service i tvättstugan) (Vid blockering skickas meddelande automatiskt till hyresgästerna om varför och preliminär tidsplan)
• 	Se historik
8.4 Meddelanden
• 	Skicka meddelanden till alla boende
• 	Skicka till specifika lägenheter
• 	Schemalägga utskick
8.5 Dokument
• 	Ladda upp stadgar, protokoll, årsredovisningar
• 	Hantera mappar och åtkomst
8.6 Boendehantering
• 	Lägg till / ta bort boende
• 	Koppla lägenheter
• 	Återställ lösenord
• 	Tilldela roller
9.0 ROLLER
Boende
Kan se sina egna ärenden
Kan boka tvättid
Kan läsa meddelanden
Kan uppdatera sin profil
Kan göra felanmälan
Styrelse
Allt boende kan göra
Kan se alla ärenden
Kan skicka meddelanden
Kan hantera dokument
Kan administrera boende
Fastighetsskötare / Hyresvärd
Ser endast felanmälningar
Kan ändra status
Kan kommunicera med boende
Kan ladda upp bilder/rapporter
Kan markera ärenden som åtgärdade
Admin (superuser)
Full åtkomst
Hanterar roller
Hanterar systeminställningar
Hanterar bokningssystemet
Hanterar alla dokument
Flöde: 

Felanmälan boende: 
Boende → Felanmälan → Skicka → Ärende skapas → 
→ Fastighetsskötare får notis → 
→ Uppdaterar status → 
→ Boende får uppdatering
1. Boende (Initiering)
Processen inleds av den boende som har ett behov av hjälp eller service.
Skapa ärende: Den boende fyller i nödvändiga uppgifter om felet eller önskemålet.
Skicka ärende: Ärendet skickas iväg digitalt.
2. System (Automatisering)
När ärendet har skickats tar systemet över för att säkerställa att informationen hanteras korrekt.
Spara i DB: Ärendet loggas och sparas i databasen för spårbarhet.
Skicka notis: Systemet skickar automatiskt en avisering till ansvarig fastighetsskötare.
3. Fastighetsskötare (Hantering)
Fastighetsskötaren tar emot och åtgärdar ärendet.
Öppna ärende: Skötaren granskar detaljerna i det inkomna ärendet.
Uppdatera status: Under arbetets gång ändras status (t.ex. till "Pågående").
Kommunicera med boende: Vid behov sker dialog mellan skötare och boende för att klargöra detaljer eller boka tid.
Markera klart: När felet är åtgärdat markeras ärendet som avslutat i systemet.
4. Boende (Avslut)
Cirkeln sluts hos den boende.
Ser avslutat ärende: Den boende får bekräftelse på att arbetet är utfört och kan se det färdigställda ärendet i sin vy.


Boka tvättid: 
Boende → Boka tvättid → Välj tid → Bekräfta → 
→ Tid sparas → 
→ Visas under "Mina bokningar"
Skicka meddelande: Styrelse → Skapa meddelande → Publicera → 
→ Boende ser i "Meddelanden" → 
→ (Valfritt) Notis skickas

Affärsregler & Systemlogik
1. Autentisering & Åtkomst
Rollbaserad omdirigering: Vid lyckad inloggning ska systemet automatiskt skicka boende till "Min sida", styrelse till "Adminpanel" och fastighetsskötare till "Ärendelista".
Behörighetskontroll: Ingen användare får ha åtkomst till vyer eller data som ligger utanför deras tilldelade roll (se Roll Matris).
Lösenordshantering: Systemet ska erbjuda en "Glömt lösenord"-funktion och administratörer ska kunna återställa lösenord för användare.
2. Ärendehantering (Felanmälan)
Kategorisering: Varje felanmälan måste tilldelas en kategori (el, vatten, hiss, allmänt, störning eller lägenhet) för korrekt sortering.
