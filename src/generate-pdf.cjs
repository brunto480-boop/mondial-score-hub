const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateDocumentationPDF() {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    bufferPages: true
  });

  const outputPath = path.join(__dirname, '../public/documentation-import-json.pdf');
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Helper for drawing lines
  const drawLine = (y) => {
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, y).lineTo(545, y).stroke();
  };

  // Header Title
  doc.fillColor('#1e3a8a')
     .font('Helvetica-Bold')
     .fontSize(22)
     .text('Documentation Technique - Import JSON', 50, 50, { align: 'center' });
  
  doc.fillColor('#475569')
     .font('Helvetica-Oblique')
     .fontSize(11)
     .text('Mondial Score Hub - Panneau d\'administration', 50, 80, { align: 'center' });

  drawLine(105);

  // Introduction Section
  doc.fillColor('#1e293b')
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('1. Introduction', 50, 120);

  doc.fillColor('#334155')
     .font('Helvetica')
     .fontSize(10.5)
     .text(
       'La fonctionnalité d\'importation JSON permet aux administrateurs de créer ou de modifier des rencontres en lot directement dans la base de données de l\'application. Les données peuvent décrire des matchs programmés, en cours (live), ou terminés (y compris avec prolongations et tirs au but).',
       50,
       140,
       { width: 495, align: 'justify', lineGap: 4 }
     );

  // Structure rules
  doc.fillColor('#1e293b')
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('2. Spécifications des Champs et Règles de Saisie', 50, 200);

  let currentY = 225;

  const fields = [
    { name: 'group', type: 'String', req: 'Oui', desc: 'Le nom du groupe ou de la phase finale (ex: "Groupe A", "Seizièmes de finale").' },
    { name: 'day', type: 'String', req: 'Oui', desc: 'Indicateur de date relative. Valeurs acceptées : "past" (passé), "yesterday" (hier), "today" (aujourd\'hui), "tomorrow" (demain), "later" (plus tard).' },
    { name: 'status', type: 'String', req: 'Oui', desc: 'Statut du match. L\'importateur supporte "Programmé" (scheduled), "Terminé" (finished) et "En cours" (live).' },
    { name: 'date / time', type: 'String', req: 'Oui', desc: 'Heure de la rencontre (ex: "20:00"). format 24h requis.' },
    { name: 'rawDate', type: 'String', req: 'Oui', desc: 'Date réelle du match au format AAAA-MM-JJ (ex: "2026-06-22").' },
    { name: 'venueCity', type: 'String', req: 'Oui', desc: 'La ville où se déroule le match (ex: "Vancouver", "Toronto").' },
    { name: 'venueCountry', type: 'String', req: 'Oui', desc: 'Le pays organisateur de la rencontre (ex: "Canada", "États-Unis", "Mexique").' }
  ];

  fields.forEach(field => {
    doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(10).text(field.name, 55, currentY);
    doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(9).text(`(${field.type} - Requis: ${field.req})`, 130, currentY);
    doc.fillColor('#334155').font('Helvetica').fontSize(9.5).text(field.desc, 235, currentY, { width: 300 });
    
    // Calculate size of text to adjust Y
    const textHeight = doc.heightOfString(field.desc, { width: 300 });
    currentY += Math.max(textHeight, 15) + 8;
  });

  drawLine(currentY);
  currentY += 15;

  // page 2
  doc.addPage();

  doc.fillColor('#1e293b')
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('3. Objets Équipes (teamA & teamB)', 50, 50);

  doc.fillColor('#334155')
     .font('Helvetica')
     .fontSize(10.5)
     .text(
       'Chaque rencontre doit définir un objet "teamA" (équipe à domicile/gauche) et un objet "teamB" (équipe visiteuse/droite) avec la structure suivante :',
       50,
       75,
       { width: 495, align: 'justify' }
     );

  let teamY = 110;
  const teamFields = [
    { name: 'name', type: 'String', req: 'Oui', desc: 'Le nom personnalisé de l\'équipe (ex: "Mexique", "France").' },
    { name: 'flag', type: 'String', req: 'Oui', desc: 'Le code ISO 3166-1 alpha-2 du drapeau en 2 lettres minuscules (ex: "mx", "fr", "es").' },
    { name: 'score', type: 'Number', req: 'Non', desc: 'Le score final du match réglementaire ou des prolongations. Facultatif pour un match programmé.' },
    { name: 'goals', type: 'Array', req: 'Non', desc: 'Tableau contenant les buteurs et leurs minutes de jeu (ex: ["K. Mbappé 12\'", "A. Griezmann 45\'"]).' },
    { name: 'yellows / reds', type: 'Array', req: 'Non', desc: 'Tableau contenant les joueurs avertis ou expulsés avec la minute de jeu (ex: ["N. Kanté 60\'"]).' },
    { name: 'isExtraTime', type: 'Boolean', req: 'Non', desc: 'Indicateur de prolongations (true/false). Par défaut: false.' },
    { name: 'penaltiesScore', type: 'Number', req: 'Non', desc: 'Le score des tirs au but. Si renseigné, le match est automatiquement configuré en mode TAB.' },
    { name: 'penaltiesSequence', type: 'String', req: 'Non', desc: 'La séquence des tirs (o: réussi, x: manqué, .: en attente) (ex: "ooxox"). Si absente mais que penaltiesScore est défini, elle est générée automatiquement.' }
  ];

  teamFields.forEach(field => {
    doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(10).text(field.name, 55, teamY);
    doc.fillColor('#64748b').font('Helvetica-Oblique').fontSize(9).text(`(${field.type} - Requis: ${field.req})`, 140, teamY);
    doc.fillColor('#334155').font('Helvetica').fontSize(9.5).text(field.desc, 235, teamY, { width: 300 });

    const textHeight = doc.heightOfString(field.desc, { width: 300 });
    teamY += Math.max(textHeight, 15) + 8;
  });

  drawLine(teamY);
  teamY += 20;

  // Example title
  doc.fillColor('#1e293b')
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('4. Exemple de Format JSON (Rencontre avec TAB)', 50, teamY);

  const jsonExample = `[
  {
    "group": "Seizièmes de finale",
    "day": "past",
    "status": "Terminé",
    "date": "15:00",
    "time": "15:00",
    "rawDate": "2026-06-18",
    "venueCity": "Los Angeles",
    "venueCountry": "États-Unis",
    "teamA": {
      "name": "Argentine",
      "flag": "ar",
      "score": 1,
      "goals": ["L. Messi 45+2'"],
      "isExtraTime": true,
      "penaltiesScore": 4,
      "penaltiesSequence": "ooxo"
    },
    "teamB": {
      "name": "Brésil",
      "flag": "br",
      "score": 1,
      "goals": ["Vinicius Jr. 80'"],
      "isExtraTime": true,
      "penaltiesScore": 2,
      "penaltiesSequence": "oxox"
    }
  }
]`;

  // Draw background box for code
  doc.rect(50, teamY + 25, 495, 290).fill('#f8fafc');

  doc.fillColor('#0f172a')
     .font('Courier')
     .fontSize(8.5)
     .text(jsonExample, 60, teamY + 35, { lineGap: 2 });

  // Footer on each page
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    const oldBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 10;
    
    doc.fillColor('#94a3b8')
       .font('Helvetica')
       .fontSize(8)
       .text(`Page ${i + 1} sur ${pageCount}`, 50, doc.page.height - 35, { align: 'right', width: 495 });
       
    doc.page.margins.bottom = oldBottom;
  }

  doc.end();
  console.log("PDF documentation generated successfully at:", outputPath);
}

generateDocumentationPDF();
