const fs = require('fs');
const path = require('path');

const GROUPS = {
  "A": [
    { name: "Mexique", flag: "mx", players: ["R. Jiménez", "J. Quiñones", "L. Romo", "H. Lozano", "S. Giménez"] },
    { name: "Afrique du Sud", flag: "za", players: ["T. Mokoena", "P. Tau", "T. Zwane", "E. Makgopa"] },
    { name: "Corée du Sud", flag: "kr", players: ["Son Heung-min", "Hwang In-beom", "Oh Hyeon-gyu", "Lee Kang-in"] },
    { name: "Tchéquie", flag: "cz", players: ["L. Krejčí", "M. Sadílek", "P. Schick", "T. Souček"] }
  ],
  "B": [
    { name: "Canada", flag: "ca", players: ["C. Larin", "J. David", "N. Saliba", "A. Davies", "T. Buchanan"] },
    { name: "Bosnie-Herzégovine", flag: "ba", players: ["J. Lukić", "E. Mahmić", "E. Džeko", "M. Pjanic"] },
    { name: "Qatar", flag: "qa", players: ["Akram Afif", "Almoez Ali", "H. Al-Haydos"] },
    { name: "Suisse", flag: "ch", players: ["B. Embolo", "J. Manzambi", "R. Vargas", "G. Xhaka", "X. Shaqiri"] }
  ],
  "C": [
    { name: "Brésil", flag: "br", players: ["Vinicius Jr", "Neymar Jr", "Rodrygo", "Raphinha", "Endrick"] },
    { name: "Maroc", flag: "ma", players: ["Y. En-Nesyri", "H. Ziyech", "A. Hakimi", "B. Diaz"] },
    { name: "Haïti", flag: "ht", players: ["F. Pierrot", "D. Nazon", "C. Arcus"] },
    { name: "Écosse", flag: "gb-sct", players: ["S. McTominay", "J. McGinn", "L. Shankland", "A. Robertson"] }
  ],
  "D": [
    { name: "États-Unis", flag: "us", players: ["C. Pulisic", "T. Weah", "F. Balogun", "W. McKennie"] },
    { name: "Paraguay", flag: "py", players: ["M. Almirón", "J. Enciso", "A. Sanabria", "R. Sosa"] },
    { name: "Australie", flag: "au", players: ["M. Duke", "J. Irvine", "C. Goodwin", "H. Souttar"] },
    { name: "Turquie", flag: "tr", players: ["A. Güler", "B. Yılmaz", "H. Çalhanoğlu", "K. Aktürkoğlu"] }
  ],
  "E": [
    { name: "Allemagne", flag: "de", players: ["F. Wirtz", "J. Musiala", "K. Havertz", "N. Füllkrug", "L. Sané"] },
    { name: "Curaçao", flag: "cw", players: ["J. Bacuna", "G. Kastaneer", "R. Martina"] },
    { name: "Côte d'Ivoire", flag: "ci", players: ["S. Haller", "S. Adingra", "F. Kessié", "I. Sangaré"] },
    { name: "Équateur", flag: "ec", players: ["E. Valencia", "K. Páez", "P. Estupiñán", "M. Caicedo"] }
  ],
  "F": [
    { name: "Pays-Bas", flag: "nl", players: ["C. Gakpo", "M. Depay", "X. Simons", "D. Malen", "V. van Dijk"] },
    { name: "Japon", flag: "jp", players: ["K. Mitoma", "T. Kubo", "A. Ueda", "W. Endo"] },
    { name: "Suède", flag: "se", players: ["A. Isak", "V. Gyökeres", "D. Kulusevski", "E. Forsberg"] },
    { name: "Tunisie", flag: "tn", players: ["Y. Msakni", "E. Skhiri", "A. Laidouni"] }
  ],
  "G": [
    { name: "Belgique", flag: "be", players: ["K. De Bruyne", "R. Lukaku", "J. Doku", "L. Trossard"] },
    { name: "Égypte", flag: "eg", players: ["M. Salah", "O. Marmoush", "M. Mohamed", "Trézéguet"] },
    { name: "Iran", flag: "ir", players: ["M. Taremi", "S. Azmoun", "A. Jahanbakhsh"] },
    { name: "Nouvelle-Zélande", flag: "nz", players: ["C. Wood", "M. Garbett", "K. Barbarouses"] }
  ],
  "H": [
    { name: "Espagne", flag: "es", players: ["Lamine Yamal", "Nico Williams", "Dani Olmo", "A. Morata", "Rodri"] },
    { name: "Cap-Vert", flag: "cv", players: ["Ryan Mendes", "Garry Rodrigues", "Bebé"] },
    { name: "Arabie saoudite", flag: "sa", players: ["Salem Al-Dawsari", "Firas Al-Buraikan", "Saleh Al-Shehri"] },
    { name: "Uruguay", flag: "uy", players: ["D. Núñez", "L. Suárez", "F. Valverde", "R. Bentancur"] }
  ],
  "I": [
    { name: "France", flag: "fr", players: ["K. Mbappé", "A. Griezmann", "O. Dembélé", "M. Thuram", "B. Barcola"] },
    { name: "Sénégal", flag: "sn", players: ["Sadio Mané", "N. Jackson", "I. Sarr", "P. Sarr"] },
    { name: "Irak", flag: "iq", players: ["Aymen Hussein", "Ali Jasim", "I. Al-Amari"] },
    { name: "Norvège", flag: "no", players: ["E. Haaland", "M. Ødegaard", "A. Sørloth", "O. Bobb"] }
  ],
  "J": [
    { name: "Argentine", flag: "ar", players: ["L. Messi", "L. Martínez", "J. Álvarez", "A. Mac Allister", "E. Fernández"] },
    { name: "Algérie", flag: "dz", players: ["R. Mahrez", "B. Bounedjah", "A. Gouiri", "H. Aouar"] },
    { name: "Autriche", flag: "at", players: ["M. Sabitzer", "M. Gregoritsch", "C. Baumgartner", "K. Laimer"] },
    { name: "Jordanie", flag: "jo", players: ["Mousa Al-Tamari", "Yazan Al-Naimat"] }
  ],
  "K": [
    { name: "Portugal", flag: "pt", players: ["Cristiano Ronaldo", "Bruno Fernandes", "Rafael Leão", "Bernardo Silva"] },
    { name: "RD Congo", flag: "cd", players: ["Yoane Wissa", "C. Bakambu", "M. Elia", "Chancel Mbemba"] },
    { name: "Ouzbékistan", flag: "uz", players: ["E. Shomurodov", "A. Fayzullaev", "O. Urunov"] },
    { name: "Colombie", flag: "co", players: ["Luis Díaz", "James Rodríguez", "J. Arias", "J. Durán"] }
  ],
  "L": [
    { name: "Angleterre", flag: "gb-eng", players: ["H. Kane", "J. Bellingham", "P. Foden", "B. Saka", "C. Palmer"] },
    { name: "Croatie", flag: "hr", players: ["L. Modrić", "A. Kramarić", "I. Perišić", "M. Kovačić"] },
    { name: "Ghana", flag: "gh", players: ["M. Kudus", "J. Ayew", "I. Williams", "A. Semenyo"] },
    { name: "Panama", flag: "pa", players: ["J. Fajardo", "A. Carrasquilla", "E. Bárcenas"] }
  ]
};

const FRENCH_DAYS = {
  11: "Jeu. 11 juin",
  12: "Ven. 12 juin",
  13: "Sam. 13 juin",
  14: "Dim. 14 juin",
  15: "Lun. 15 juin",
  16: "Mar. 16 juin",
  17: "Mer. 17 juin",
  18: "Jeu. 18 juin",
  19: "Ven. 19 juin",
  20: "Sam. 20 juin",
  21: "Dim. 21 juin",
  22: "Lun. 22 juin",
  23: "Mar. 23 juin",
  24: "Mer. 24 juin",
  25: "Jeu. 25 juin",
  26: "Ven. 26 juin",
  27: "Sam. 27 juin"
};

const SCHEDULE = [];

// Helper to add match to schedule list
function addMatch(group, dayNum, time, teamAIdx, teamBIdx, scores = null) {
  const teams = GROUPS[group];
  const tA = teams[teamAIdx];
  const tB = teams[teamBIdx];
  const dateStr = `2026-06-${dayNum < 10 ? '0' + dayNum : dayNum}`;
  const isFinished = dayNum < 20; // Simulated date is 2026-06-20, so earlier matches are finished.
  
  const match = {
    id: `m_ext_${group.toLowerCase()}_${SCHEDULE.length + 1}`,
    group: `Groupe ${group}`,
    status: isFinished ? "finished" : "scheduled",
    date: FRENCH_DAYS[dayNum],
    rawDate: dateStr,
    time: time,
    teamA: {
      name: tA.name,
      flag: tA.flag,
    },
    teamB: {
      name: tB.name,
      flag: tB.flag,
    }
  };

  if (isFinished) {
    let scoreA = 0;
    let scoreB = 0;
    
    if (scores) {
      scoreA = scores[0];
      scoreB = scores[1];
    } else {
      // Simulate score based on group position/reputation (just random with a slight weight)
      scoreA = Math.floor(Math.random() * 3);
      scoreB = Math.floor(Math.random() * 3);
    }
    
    match.teamA.score = scoreA;
    match.teamB.score = scoreB;
    
    // Generate goals
    match.teamA.goals = [];
    for (let i = 0; i < scoreA; i++) {
      const player = tA.players[Math.floor(Math.random() * tA.players.length)];
      const min = Math.floor(Math.random() * 90) + 1;
      match.teamA.goals.push(`${player} ${min}'`);
    }
    
    match.teamB.goals = [];
    for (let i = 0; i < scoreB; i++) {
      const player = tB.players[Math.floor(Math.random() * tB.players.length)];
      const min = Math.floor(Math.random() * 90) + 1;
      match.teamB.goals.push(`${player} ${min}'`);
    }

    // Generate cards (yellows/reds)
    match.teamA.yellows = [];
    match.teamA.reds = [];
    match.teamB.yellows = [];
    match.teamB.reds = [];
    
    const numYellowsA = Math.floor(Math.random() * 3);
    for (let i = 0; i < numYellowsA; i++) {
      const player = tA.players[Math.floor(Math.random() * tA.players.length)];
      const min = Math.floor(Math.random() * 90) + 1;
      match.teamA.yellows.push(`${player} ${min}'`);
    }
    
    const numYellowsB = Math.floor(Math.random() * 3);
    for (let i = 0; i < numYellowsB; i++) {
      const player = tB.players[Math.floor(Math.random() * tB.players.length)];
      const min = Math.floor(Math.random() * 90) + 1;
      match.teamB.yellows.push(`${player} ${min}'`);
    }
    
    if (Math.random() < 0.08) { // 8% chance of red card
      const player = tA.players[Math.floor(Math.random() * tA.players.length)];
      const min = Math.floor(Math.random() * 90) + 1;
      match.teamA.reds.push(`${player} ${min}'`);
      match.teamA.redCard = true;
    }
    if (Math.random() < 0.08) {
      const player = tB.players[Math.floor(Math.random() * tB.players.length)];
      const min = Math.floor(Math.random() * 90) + 1;
      match.teamB.reds.push(`${player} ${min}'`);
      match.teamB.redCard = true;
    }
  } else {
    // Scheduled matches: empty array for goals, yellows, reds
    match.teamA.goals = [];
    match.teamA.yellows = [];
    match.teamA.reds = [];
    match.teamB.goals = [];
    match.teamB.yellows = [];
    match.teamB.reds = [];
  }

  SCHEDULE.push(match);
}

// Map the matches chronologically/grouped
// -------------------------------------------------------------
// GROUP A: Mexico, South Africa, South Korea, Czechia
addMatch("A", 11, "13:00", 0, 1, [2, 0]); // Mexico vs South Africa
addMatch("A", 11, "20:00", 2, 3, [2, 1]); // South Korea vs Czechia
addMatch("A", 18, "12:00", 3, 1, [1, 1]); // Czechia vs South Africa
addMatch("A", 18, "19:00", 0, 2, [1, 0]); // Mexico vs South Korea
addMatch("A", 24, "19:00", 3, 0);       // Czechia vs Mexico
addMatch("A", 24, "19:00", 1, 2);       // South Africa vs South Korea

// GROUP B: Canada, Bosnia, Qatar, Switzerland
addMatch("B", 12, "15:00", 0, 1, [1, 1]); // Canada vs Bosnia
addMatch("B", 13, "12:00", 2, 3, [1, 1]); // Qatar vs Switzerland
addMatch("B", 18, "12:00", 3, 1, [4, 1]); // Switzerland vs Bosnia
addMatch("B", 18, "15:00", 0, 2, [6, 0]); // Canada vs Qatar
addMatch("B", 24, "19:00", 1, 2);       // Bosnia vs Qatar
addMatch("B", 24, "19:00", 3, 0);       // Switzerland vs Canada

// GROUP C: Brazil, Morocco, Haiti, Scotland
addMatch("C", 12, "18:00", 3, 1, [0, 1]); // Scotland vs Morocco
addMatch("C", 13, "15:00", 0, 2, [3, 0]); // Brazil vs Haiti
addMatch("C", 19, "18:00", 3, 0, [1, 2]); // Scotland vs Brazil
addMatch("C", 19, "21:00", 1, 2, [2, 0]); // Morocco vs Haiti
addMatch("C", 25, "15:00", 2, 3);       // Haiti vs Scotland
addMatch("C", 25, "15:00", 1, 0);       // Morocco vs Brazil

// GROUP D: USA, Paraguay, Australia, Turkey
addMatch("D", 12, "21:00", 0, 2, [2, 0]); // USA vs Australia
addMatch("D", 13, "18:00", 3, 1, [0, 1]); // Turkey vs Paraguay
addMatch("D", 19, "15:00", 3, 0, [1, 1]); // Turkey vs USA
addMatch("D", 19, "12:00", 1, 2, [2, 1]); // Paraguay vs Australia
addMatch("D", 25, "18:00", 2, 3);       // Australia vs Turkey
addMatch("D", 25, "18:00", 1, 0);       // Paraguay vs USA

// GROUP E: Germany, Curaçao, Ivory Coast, Ecuador
addMatch("E", 14, "15:00", 0, 2, [2, 1]); // Germany vs Ivory Coast
addMatch("E", 14, "18:00", 3, 1, [2, 0]); // Ecuador vs Curaçao
addMatch("E", 20, "15:00", 1, 2);       // Curaçao vs Ivory Coast (live today)
addMatch("E", 20, "18:00", 3, 0);       // Ecuador vs Germany (live today)
addMatch("E", 26, "15:00", 2, 3);       // Ivory Coast vs Ecuador
addMatch("E", 26, "15:00", 1, 0);       // Curaçao vs Germany

// GROUP F: Netherlands, Japan, Sweden, Tunisia
addMatch("F", 14, "21:00", 0, 2, [2, 1]); // Netherlands vs Sweden
addMatch("F", 14, "12:00", 3, 1, [0, 2]); // Tunisia vs Japan
addMatch("F", 20, "21:00", 1, 2);       // Japan vs Sweden (live today)
addMatch("F", 20, "12:00", 3, 0);       // Tunisia vs Netherlands (live today)
addMatch("F", 26, "18:00", 2, 3);       // Sweden vs Tunisia
addMatch("F", 26, "18:00", 1, 0);       // Japan vs Netherlands

// GROUP G: Belgium, Egypt, Iran, New Zealand
addMatch("G", 15, "15:00", 0, 1, [1, 1]); // Belgium vs Egypt
addMatch("G", 15, "18:00", 2, 3, [2, 2]); // Iran vs New Zealand
addMatch("G", 21, "15:00", 0, 2);       // Belgium vs Iran (tomorrow)
addMatch("G", 21, "18:00", 3, 1);       // New Zealand vs Egypt (tomorrow)
addMatch("G", 26, "21:00", 1, 2);       // Egypt vs Iran
addMatch("G", 26, "21:00", 3, 0);       // New Zealand vs Belgium

// GROUP H: Spain, Cape Verde, Saudi Arabia, Uruguay
addMatch("H", 15, "21:00", 0, 1, [2, 0]); // Spain vs Cape Verde
addMatch("H", 15, "12:00", 2, 3, [0, 2]); // Saudi Arabia vs Uruguay
addMatch("H", 21, "21:00", 3, 1);       // Uruguay vs Cape Verde (tomorrow)
addMatch("H", 21, "12:00", 0, 2);       // Spain vs Saudi Arabia (tomorrow)
addMatch("H", 27, "15:00", 1, 2);       // Cape Verde vs Saudi Arabia
addMatch("H", 27, "15:00", 3, 0);       // Uruguay vs Spain

// GROUP I: France, Senegal, Iraq, Norway
addMatch("I", 16, "15:00", 0, 1, [3, 1]); // France vs Senegal
addMatch("I", 16, "18:00", 2, 3, [0, 2]); // Iraq vs Norway
addMatch("I", 22, "18:00", 0, 3);       // France vs Norway
addMatch("I", 22, "21:00", 1, 2);       // Senegal vs Iraq
addMatch("I", 27, "18:00", 3, 1);       // Norway vs Senegal
addMatch("I", 27, "18:00", 2, 0);       // Iraq vs France

// GROUP J: Argentina, Algeria, Austria, Jordan
addMatch("J", 16, "21:00", 0, 1, [3, 0]); // Argentina vs Algeria
addMatch("J", 16, "12:00", 2, 3, [1, 0]); // Austria vs Jordan
addMatch("J", 22, "15:00", 0, 2);       // Argentina vs Austria
addMatch("J", 22, "12:00", 1, 3);       // Algeria vs Jordan
addMatch("J", 27, "21:00", 3, 0);       // Jordan vs Argentina
addMatch("J", 27, "21:00", 1, 2);       // Algeria vs Austria

// GROUP K: Portugal, DR Congo, Uzbekistan, Colombia
addMatch("K", 17, "15:00", 0, 1, [2, 1]); // Portugal vs DR Congo
addMatch("K", 17, "18:00", 2, 3, [1, 3]); // Uzbekistan vs Colombia
addMatch("K", 23, "18:00", 3, 0);       // Colombia vs Portugal
addMatch("K", 23, "15:00", 1, 2);       // DR Congo vs Uzbekistan
addMatch("K", 27, "12:00", 2, 0);       // Uzbekistan vs Portugal
addMatch("K", 27, "12:00", 3, 1);       // Colombia vs DR Congo

// GROUP L: England, Croatia, Ghana, Panama
addMatch("L", 17, "21:00", 0, 1, [4, 2]); // England vs Croatia
addMatch("L", 17, "12:00", 2, 3, [1, 0]); // Ghana vs Panama
addMatch("L", 23, "21:00", 0, 2);       // England vs Ghana
addMatch("L", 23, "12:00", 3, 1);       // Panama vs Croatia
addMatch("L", 27, "12:00", 1, 2);       // Croatia vs Ghana
addMatch("L", 27, "12:00", 3, 0);       // Panama vs England


// Write output to api-matches.json
const destPath = path.join(__dirname, '..', 'public', 'api-matches.json');
fs.writeFileSync(destPath, JSON.stringify(SCHEDULE, null, 2), 'utf-8');
console.log(`Generated ${SCHEDULE.length} matches in ${destPath}`);
