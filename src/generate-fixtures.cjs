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

const SCHEDULE = [];

// Helper to convert local time + offset to French Time (UTC+2)
function convertToFrenchTime(dayNum, timeStr, offset) {
  // Construct date object for local time
  // World Cup is in June 2026
  const dateStr = `2026-06-${dayNum < 10 ? '0' + dayNum : dayNum}`;
  const localDateTimeStr = `${dateStr}T${timeStr}:00`;
  const date = new Date(localDateTimeStr);
  
  // Calculate difference to French time (UTC+2 CEST)
  // offset is -6, -4, etc.
  const diffHours = 2 - offset;
  date.setHours(date.getHours() + diffHours);
  
  // Format French Date (e.g. "Jeu. 11 juin")
  let frenchDate = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  frenchDate = frenchDate.charAt(0).toUpperCase() + frenchDate.slice(1);
  
  // Remove dots from month (e.g., "juin." -> "juin") and make weekday end with dot
  frenchDate = frenchDate.replace(/([a-zA-Z]{3,4})\.?\s(\d+)\s([a-zA-Zûé]+)\.?/, (match, p1, p2, p3) => {
    // Keep dot only for weekday
    const wkday = p1.endsWith('.') ? p1 : p1 + '.';
    return `${wkday} ${p2} ${p3}`;
  });
  
  // Format French Raw Date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const rawDate = `${year}-${month}-${day}`;
  
  // Format French Time
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  
  return { date: frenchDate, rawDate, time };
}

// Helper to add match to schedule list
function addMatch(group, dayNum, time, offset, teamAIdx, teamBIdx, scores = null) {
  const teams = GROUPS[group];
  const tA = teams[teamAIdx];
  const tB = teams[teamBIdx];
  
  const frenchTimeData = convertToFrenchTime(dayNum, time, offset);
  
  // Simulated present date is 2026-06-20. Matches played before June 20 French Time are finished.
  const isFinished = frenchTimeData.rawDate < "2026-06-20";
  
  const match = {
    id: `m_ext_${group.toLowerCase()}_${SCHEDULE.length + 1}`,
    group: `Groupe ${group}`,
    status: isFinished ? "finished" : "scheduled",
    date: frenchTimeData.date,
    rawDate: frenchTimeData.rawDate,
    time: frenchTimeData.time,
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
    
    if (Math.random() < 0.08) {
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
// Timezone offsets:
// Mexico City, Guadalajara, Monterrey = -6
// Toronto, New York, Boston, Miami, Atlanta, Philadelphia = -4
// Dallas, Houston = -5
// Los Angeles, San Francisco, Seattle, Vancouver = -7

// GROUP A: Mexico, South Africa, South Korea, Czechia
addMatch("A", 11, "13:00", -6, 0, 1, [2, 0]); // Mexico vs South Africa (Mexico City)
addMatch("A", 11, "20:00", -6, 2, 3, [2, 1]); // South Korea vs Czechia (Guadalajara)
addMatch("A", 18, "12:00", -4, 3, 1, [1, 1]); // Czechia vs South Africa (Atlanta)
addMatch("A", 18, "19:00", -6, 0, 2, [1, 0]); // Mexico vs South Korea (Guadalajara)
addMatch("A", 24, "19:00", -6, 3, 0);        // Czechia vs Mexico (Mexico City)
addMatch("A", 24, "19:00", -6, 1, 2);        // South Africa vs South Korea (Monterrey)

// GROUP B: Canada, Bosnia, Qatar, Switzerland
addMatch("B", 12, "15:00", -4, 0, 1, [1, 1]); // Canada vs Bosnia (Toronto)
addMatch("B", 13, "12:00", -7, 2, 3, [1, 1]); // Qatar vs Switzerland (San Francisco)
addMatch("B", 18, "12:00", -7, 3, 1, [4, 1]); // Switzerland vs Bosnia (Los Angeles)
addMatch("B", 18, "15:00", -7, 0, 2, [6, 0]); // Canada vs Qatar (Vancouver)
addMatch("B", 24, "19:00", -4, 1, 2);        // Bosnia vs Qatar (Boston)
addMatch("B", 24, "19:00", -4, 3, 0);        // Switzerland vs Canada (Toronto)

// GROUP C: Brazil, Morocco, Haiti, Scotland
addMatch("C", 12, "18:00", -4, 3, 1, [0, 1]); // Scotland vs Morocco (Boston)
addMatch("C", 13, "15:00", -4, 0, 2, [3, 0]); // Brazil vs Haiti (Miami)
addMatch("C", 19, "18:00", -4, 3, 0, [1, 2]); // Scotland vs Brazil (Boston)
addMatch("C", 19, "21:00", -4, 1, 2, [2, 0]); // Morocco vs Haiti (Miami)
addMatch("C", 25, "15:00", -4, 2, 3);        // Haiti vs Scotland (Miami)
addMatch("C", 25, "15:00", -4, 1, 0);        // Morocco vs Brazil (Boston)

// GROUP D: USA, Paraguay, Australia, Turkey
addMatch("D", 12, "21:00", -4, 0, 2, [2, 0]); // USA vs Australia (Philadelphia)
addMatch("D", 13, "18:00", -4, 3, 1, [0, 1]); // Turkey vs Paraguay (New York)
addMatch("D", 19, "15:00", -4, 3, 0, [1, 1]); // Turkey vs USA (New York)
addMatch("D", 19, "12:00", -4, 1, 2, [2, 1]); // Paraguay vs Australia (Philadelphia)
addMatch("D", 25, "18:00", -4, 2, 3);        // Australia vs Turkey (Philadelphia)
addMatch("D", 25, "18:00", -4, 1, 0);        // Paraguay vs USA (New York)

// GROUP E: Germany, Curaçao, Ivory Coast, Ecuador
addMatch("E", 14, "15:00", -5, 0, 2, [2, 1]); // Germany vs Ivory Coast (Dallas)
addMatch("E", 14, "18:00", -5, 3, 1, [2, 0]); // Ecuador vs Curaçao (Houston)
addMatch("E", 20, "15:00", -5, 1, 2);        // Curaçao vs Ivory Coast (Houston, live today)
addMatch("E", 20, "18:00", -5, 3, 0);        // Ecuador vs Germany (Dallas, live today)
addMatch("E", 26, "15:00", -5, 2, 3);        // Ivory Coast vs Ecuador (Dallas)
addMatch("E", 26, "15:00", -5, 1, 0);        // Curaçao vs Germany (Houston)

// GROUP F: Netherlands, Japan, Sweden, Tunisia
addMatch("F", 14, "21:00", -7, 0, 2, [2, 1]); // Netherlands vs Sweden (Seattle)
addMatch("F", 14, "12:00", -7, 3, 1, [0, 2]); // Tunisia vs Japan (San Francisco)
addMatch("F", 20, "21:00", -7, 1, 2);        // Japan vs Sweden (San Francisco, live today)
addMatch("F", 20, "12:00", -7, 3, 0);        // Tunisia vs Netherlands (Seattle, live today)
addMatch("F", 26, "18:00", -7, 2, 3);        // Sweden vs Tunisia (Seattle)
addMatch("F", 26, "18:00", -7, 1, 0);        // Japan vs Netherlands (San Francisco)

// GROUP G: Belgium, Egypt, Iran, New Zealand
addMatch("G", 15, "15:00", -4, 0, 1, [1, 1]); // Belgium vs Egypt (Atlanta)
addMatch("G", 15, "18:00", -4, 2, 3, [2, 2]); // Iran vs New Zealand (Atlanta)
addMatch("G", 21, "15:00", -4, 0, 2);        // Belgium vs Iran (Atlanta, tomorrow)
addMatch("G", 21, "18:00", -4, 3, 1);        // New Zealand vs Egypt (Atlanta, tomorrow)
addMatch("G", 26, "21:00", -4, 1, 2);        // Egypt vs Iran (Atlanta)
addMatch("G", 26, "21:00", -4, 3, 0);        // New Zealand vs Belgium (Atlanta)

// GROUP H: Spain, Cape Verde, Saudi Arabia, Uruguay
addMatch("H", 15, "21:00", -7, 0, 1, [2, 0]); // Spain vs Cape Verde (Los Angeles)
addMatch("H", 15, "12:00", -7, 2, 3, [0, 2]); // Saudi Arabia vs Uruguay (Los Angeles)
addMatch("H", 21, "21:00", -7, 3, 1);        // Uruguay vs Cape Verde (Los Angeles, tomorrow)
addMatch("H", 21, "12:00", -7, 0, 2);        // Spain vs Saudi Arabia (Los Angeles, tomorrow)
addMatch("H", 27, "15:00", -7, 1, 2);        // Cape Verde vs Saudi Arabia (Los Angeles)
addMatch("H", 27, "15:00", -7, 3, 0);        // Uruguay vs Spain (Los Angeles)

// GROUP I: France, Senegal, Iraq, Norway
addMatch("I", 16, "15:00", -4, 0, 1, [3, 1]); // France vs Senegal (Philadelphia)
addMatch("I", 16, "18:00", -4, 2, 3, [0, 2]); // Iraq vs Norway (Philadelphia)
addMatch("I", 22, "18:00", -4, 0, 3);        // France vs Norway (Philadelphia)
addMatch("I", 22, "21:00", -4, 1, 2);        // Senegal vs Iraq (Philadelphia)
addMatch("I", 27, "18:00", -4, 3, 1);        // Norway vs Senegal (Philadelphia)
addMatch("I", 27, "18:00", -4, 2, 0);        // Iraq vs France (Philadelphia)

// GROUP J: Argentina, Algeria, Austria, Jordan
addMatch("J", 16, "21:00", -5, 0, 1, [3, 0]); // Argentina vs Algeria (Houston)
addMatch("J", 16, "12:00", -5, 2, 3, [1, 0]); // Austria vs Jordan (Houston)
addMatch("J", 22, "15:00", -5, 0, 2);        // Argentina vs Austria (Houston)
addMatch("J", 22, "12:00", -5, 1, 3);        // Algeria vs Jordan (Houston)
addMatch("J", 27, "21:00", -5, 3, 0);        // Jordan vs Argentina (Houston)
addMatch("J", 27, "21:00", -5, 1, 2);        // Algeria vs Austria (Houston)

// GROUP K: Portugal, DR Congo, Uzbekistan, Colombia
addMatch("K", 17, "15:00", -4, 0, 1, [2, 1]); // Portugal vs DR Congo (New York)
addMatch("K", 17, "18:00", -4, 2, 3, [1, 3]); // Uzbekistan vs Colombia (New York)
addMatch("K", 23, "18:00", -4, 3, 0);        // Colombia vs Portugal (New York)
addMatch("K", 23, "15:00", -4, 1, 2);        // DR Congo vs Uzbekistan (New York)
addMatch("K", 27, "12:00", -4, 2, 0);        // Uzbekistan vs Portugal (New York)
addMatch("K", 27, "12:00", -4, 3, 1);        // Colombia vs DR Congo (New York)

// GROUP L: England, Croatia, Ghana, Panama
addMatch("L", 17, "21:00", -4, 0, 1, [4, 2]); // England vs Croatia (Miami)
addMatch("L", 17, "12:00", -4, 2, 3, [1, 0]); // Ghana vs Panama (Miami)
addMatch("L", 23, "21:00", -4, 0, 2);        // England vs Ghana (Miami)
addMatch("L", 23, "12:00", -4, 3, 1);        // Panama vs Croatia (Miami)
addMatch("L", 27, "12:00", -4, 1, 2);        // Croatia vs Ghana (Miami)
addMatch("L", 27, "12:00", -4, 3, 0);        // Panama vs England (Miami)

// Write output to api-matches.json
const destPath = path.join(__dirname, '..', 'public', 'api-matches.json');
fs.writeFileSync(destPath, JSON.stringify(SCHEDULE, null, 2), 'utf-8');
console.log(`Generated ${SCHEDULE.length} matches in French Time in ${destPath}`);
