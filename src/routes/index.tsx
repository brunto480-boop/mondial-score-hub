import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Search, Play, ArrowUp, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mondial Score — Scores et calendrier de la Coupe du Monde" },
      { name: "description", content: "Suivez en direct les scores, le calendrier et les résumés des matchs de la Coupe du Monde." },
      { property: "og:title", content: "Mondial Score" },
      { property: "og:description", content: "Scores et calendrier de la Coupe du Monde en direct." },
    ],
  }),
  component: Index,
});

type Day = "yesterday" | "today" | "tomorrow" | "later" | "past";

type Team = {
  name: string;
  flag: string;
  score?: number;
  redCard?: boolean;
  yellowCard?: boolean;
  goals?: string[];
  yellows?: string[];
  reds?: string[];
  venueCity?: string;
  venueCountry?: string;
  coolingBreak?: boolean;
  coolingBreakStart?: string;
  halfState?: "1st" | "halftime" | "2nd";
  firstHalfStart?: string;
  secondHalfStart?: string;
};

type Match = {
  id: string;
  group: string;
  day: Day;
  status: "finished" | "scheduled" | "live";
  time?: string;
  duration?: string;
  date?: string;
  rawDate?: string;
  teamA: Team;
  teamB: Team;
};

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMatchMinute = (match: Match): string => {
  const halfState = match.teamA.halfState || "1st";
  const coolingBreakActive = match.teamA.coolingBreak;
  const coolingBreakStart = match.teamA.coolingBreakStart;

  if (halfState === "1st") {
    const start = match.teamA.firstHalfStart ? new Date(match.teamA.firstHalfStart) : null;
    if (!start) {
      return "0'";
    }
    const end = coolingBreakActive && coolingBreakStart ? new Date(coolingBreakStart) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / (60 * 1000)));
    if (diffMins <= 45) {
      return `${diffMins}'`;
    } else {
      return `45'${diffMins - 45}`;
    }
  } else if (halfState === "halftime") {
    return "45'";
  } else if (halfState === "2nd") {
    const start = match.teamA.secondHalfStart ? new Date(match.teamA.secondHalfStart) : null;
    if (!start) {
      return "45'";
    }
    const end = coolingBreakActive && coolingBreakStart ? new Date(coolingBreakStart) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / (60 * 1000)));
    if (diffMins <= 45) {
      return `${45 + diffMins}'`;
    } else {
      return `90'${diffMins - 45}`;
    }
  }
  return "";
};

const getLiveStatusText = (match: Match): string => {
  const halfState = match.teamA.halfState || "1st";
  const coolingBreakActive = match.teamA.coolingBreak;

  if (halfState === "1st" && !match.teamA.firstHalfStart) {
    return "En attente du coup d'envoi";
  }
  if (coolingBreakActive) {
    return `Pause fraîcheur · ${getMatchMinute(match)}`;
  }
  if (halfState === "halftime") {
    return "Mi-temps · 45'";
  }
  return `En cours · ${getMatchMinute(match)}`;
};

// Helper builders (ignoring time and duration to maintain compatibility)
const F = (id: string, group: string, day: Day, time: string, a: Team, b: Team, dur: string): Match => ({
  id, group: `Groupe ${group}`, day, status: "finished", date: time,
  teamA: a, teamB: b,
});
const S = (id: string, group: string, day: Day, time: string, a: Team, b: Team, dur: string): Match => ({
  id, group: `Groupe ${group}`, day, status: "scheduled", date: time,
  teamA: { name: a.name, flag: a.flag }, teamB: { name: b.name, flag: b.flag },
});

const MATCHES: Match[] = [
  // ===== Groupe A : Mexique, Afrique du Sud, Corée du Sud, Tchéquie =====
  F("a1", "A", "yesterday", "18:00", { name: "Mexique", flag: "mx", score: 1 }, { name: "Corée du Sud", flag: "kr", score: 0 }, "1:55"),
  F("a2", "A", "yesterday", "21:00", { name: "Tchéquie", flag: "cz", score: 1 }, { name: "Afrique du Sud", flag: "za", score: 1 }, "2:05"),
  S("a3", "A", "tomorrow", "18:00", { name: "Afrique du Sud", flag: "za" }, { name: "Corée du Sud", flag: "kr" }, "0:00"),
  S("a4", "A", "later", "Mer. 22:00", { name: "Tchéquie", flag: "cz" }, { name: "Mexique", flag: "mx" }, "0:00"),

  // ===== Groupe B : Canada, Bosnie-Herzégovine, Qatar, Suisse =====
  F("b1", "B", "yesterday", "15:00", { name: "Canada", flag: "ca", score: 6 }, { name: "Qatar", flag: "qa", score: 0 }, "2:04"),
  F("b2", "B", "yesterday", "19:00", { name: "Suisse", flag: "ch", score: 4 }, { name: "Bosnie-Herzégovine", flag: "ba", score: 1 }, "1:57"),
  S("b3", "B", "tomorrow", "15:00", { name: "Bosnie-Herzégovine", flag: "ba" }, { name: "Qatar", flag: "qa" }, "0:00"),
  S("b4", "B", "later", "Mer. 19:00", { name: "Suisse", flag: "ch" }, { name: "Canada", flag: "ca" }, "0:00"),

  // ===== Groupe C : Haïti, Écosse, Brésil, Maroc =====
  F("c1", "C", "yesterday", "23:00", { name: "Écosse", flag: "gb-sct", score: 0 }, { name: "Maroc", flag: "ma", score: 1 }, "1:56"),
  F("c2", "C", "today", "03:00", { name: "Brésil", flag: "br", score: 3 }, { name: "Haïti", flag: "ht", score: 0 }, "1:51"),
  S("c3", "C", "later", "Mer. 15:00", { name: "Écosse", flag: "gb-sct" }, { name: "Brésil", flag: "br" }, "0:00"),
  S("c4", "C", "later", "Mer. 15:00", { name: "Maroc", flag: "ma" }, { name: "Haïti", flag: "ht" }, "0:00"),

  // ===== Groupe D : États-Unis, Paraguay, Australie, Turquie =====
  F("d1", "D", "yesterday", "20:00", { name: "États-Unis", flag: "us", score: 2 }, { name: "Australie", flag: "au", score: 0 }, "1:59"),
  F("d2", "D", "today", "00:00", { name: "Turquie", flag: "tr", score: 0 }, { name: "Paraguay", flag: "py", score: 1 }, "2:03"),
  S("d3", "D", "later", "Jeu. 18:00", { name: "Turquie", flag: "tr" }, { name: "États-Unis", flag: "us" }, "0:00"),
  S("d4", "D", "later", "Jeu. 18:00", { name: "Paraguay", flag: "py" }, { name: "Australie", flag: "au" }, "0:00"),

  // ===== Groupe E : Allemagne, Côte d'Ivoire, Équateur, Curaçao =====
  S("e1", "E", "today", "20:00", { name: "Allemagne", flag: "de" }, { name: "Côte d'Ivoire", flag: "ci" }, "0:00"),
  S("e2", "E", "tomorrow", "00:00", { name: "Équateur", flag: "ec" }, { name: "Curaçao", flag: "cw" }, "0:00"),
  S("e3", "E", "later", "Jeu. 21:00", { name: "Curaçao", flag: "cw" }, { name: "Côte d'Ivoire", flag: "ci" }, "0:00"),
  S("e4", "E", "later", "Jeu. 21:00", { name: "Équateur", flag: "ec" }, { name: "Allemagne", flag: "de" }, "0:00"),

  // ===== Groupe F : Pays-Bas, Suède, Tunisie, Japon =====
  S("f1", "F", "today", "17:00", { name: "Pays-Bas", flag: "nl" }, { name: "Suède", flag: "se" }, "0:00"),
  S("f2", "F", "tomorrow", "04:00", { name: "Tunisie", flag: "tn" }, { name: "Japon", flag: "jp" }, "0:00"),
  S("f3", "F", "later", "Jeu. 15:00", { name: "Japon", flag: "jp" }, { name: "Suède", flag: "se" }, "0:00"),
  S("f4", "F", "later", "Jeu. 15:00", { name: "Tunisie", flag: "tn" }, { name: "Pays-Bas", flag: "nl" }, "0:00"),
  // ===== Groupe G : Belgique, Égypte, Iran, Nouvelle-Zélande =====

  F("g1", "G", "yesterday", "15:00", { name: "Belgique", flag: "be", score: 1 }, { name: "Égypte", flag: "eg", score: 1 }, "1:56"),
  F("g2", "G", "yesterday", "18:00", { name: "Iran", flag: "ir", score: 2 }, { name: "Nouvelle-Zélande", flag: "nz", score: 2 }, "2:01"),
  S("g3", "G", "tomorrow", "21:00", { name: "Belgique", flag: "be" }, { name: "Iran", flag: "ir" }, "0:00"),
  S("g4", "G", "later", "Lun. 15:00", { name: "Nouvelle-Zélande", flag: "nz" }, { name: "Égypte", flag: "eg" }, "0:00"),

  // ===== Groupe H : Espagne, Cap-Vert, Arabie saoudite, Uruguay =====
  F("h1", "H", "today", "15:00", { name: "Espagne", flag: "es", score: 0 }, { name: "Cap-Vert", flag: "cv", score: 0 }, "1:54"),
  S("h2", "H", "today", "18:00", { name: "Arabie saoudite", flag: "sa" }, { name: "Uruguay", flag: "uy" }, "0:00"),
  S("h3", "H", "later", "Mar. 20:00", { name: "Uruguay", flag: "uy" }, { name: "Cap-Vert", flag: "cv" }, "0:00"),
  S("h4", "H", "later", "Mar. 20:00", { name: "Espagne", flag: "es" }, { name: "Arabie saoudite", flag: "sa" }, "0:00"),

  // ===== Groupe I : France, Sénégal, Irak, Norvège =====
  F("i1", "I", "yesterday", "21:00", { name: "France", flag: "fr", score: 3 }, { name: "Sénégal", flag: "sn", score: 1 }, "1:58"),
  S("i2", "I", "today", "00:00", { name: "Irak", flag: "iq" }, { name: "Norvège", flag: "no" }, "0:00"),
  S("i3", "I", "later", "Jeu. 17:00", { name: "France", flag: "fr" }, { name: "Norvège", flag: "no" }, "0:00"),
  S("i4", "I", "later", "Jeu. 17:00", { name: "Sénégal", flag: "sn" }, { name: "Irak", flag: "iq" }, "0:00"),

  // ===== Groupe J : Argentine, Algérie, Autriche, Jordanie =====
  F("j1", "J", "yesterday", "15:00", { name: "Argentine", flag: "ar", score: 3 }, { name: "Algérie", flag: "dz", score: 0 }, "1:55"),
  S("j2", "J", "today", "18:00", { name: "Autriche", flag: "at" }, { name: "Jordanie", flag: "jo" }, "0:00"),
  S("j3", "J", "later", "Ven. 20:00", { name: "Argentine", flag: "ar" }, { name: "Autriche", flag: "at" }, "0:00"),
  S("j4", "J", "later", "Ven. 20:00", { name: "Algérie", flag: "dz" }, { name: "Jordanie", flag: "jo" }, "0:00"),

  // ===== Groupe K : Portugal, RD Congo, Ouzbékistan, Colombie =====
  S("k1", "K", "today", "21:00", { name: "Portugal", flag: "pt" }, { name: "RD Congo", flag: "cd" }, "0:00"),
  F("k2", "K", "yesterday", "00:00", { name: "Ouzbékistan", flag: "uz", score: 1 }, { name: "Colombie", flag: "co", score: 3 }, "1:56"),
  S("k3", "K", "later", "Sam. 15:00", { name: "Colombie", flag: "co" }, { name: "Portugal", flag: "pt" }, "0:00"),
  S("k4", "K", "later", "Sam. 15:00", { name: "RD Congo", flag: "cd" }, { name: "Ouzbékistan", flag: "uz" }, "0:00"),

  // ===== Groupe L : Angleterre, Croatie, Ghana, Panama =====
  F("l1", "L", "yesterday", "15:00", { name: "Angleterre", flag: "gb-eng", score: 4 }, { name: "Croatie", flag: "hr", score: 2 }, "1:55"),
  F("l2", "L", "yesterday", "19:00", { name: "Ghana", flag: "gh", score: 1 }, { name: "Panama", flag: "pa", score: 0 }, "1:58"),
  S("l3", "L", "later", "Sam. 20:00", { name: "Angleterre", flag: "gb-eng" }, { name: "Ghana", flag: "gh" }, "0:00"),
  S("l4", "L", "later", "Sam. 20:00", { name: "Panama", flag: "pa" }, { name: "Croatie", flag: "hr" }, "0:00")
];

const DAY_LABELS: { key: Day; title: string; subtitle: string }[] = [
  { key: "today", title: "Aujourd'hui", subtitle: "Group Stage · Today" },
  { key: "yesterday", title: "Hier", subtitle: "Group Stage · Yesterday" },
  { key: "tomorrow", title: "Demain", subtitle: "Group Stage · Tomorrow" },
];

type TeamStanding = {
  name: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

const isPlaceholder = (name: string) => {
  const n = name.toLowerCase();
  return (
    /^\d[a-l]$/i.test(n) ||
    /^[wl]\d+$/i.test(n) ||
    n.includes('/') ||
    n.includes('winner') ||
    n.includes('runner') ||
    n.includes('loser') ||
    n.includes('third place') ||
    /^[a-l]\d$/i.test(n)
  );
};

function calculateStandings(groupMatches: Match[]): TeamStanding[] {
  const standingsMap: Record<string, TeamStanding> = {};

  const cleanMatches = groupMatches.filter(
    (m) => !isPlaceholder(m.teamA.name) && !isPlaceholder(m.teamB.name)
  );

  cleanMatches.forEach((m) => {
    [m.teamA, m.teamB].forEach((t) => {
      if (!standingsMap[t.name]) {
        standingsMap[t.name] = {
          name: t.name,
          flag: t.flag,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        };
      }
    });
  });

  cleanMatches.forEach((m) => {
    if (m.status !== "finished") return;

    const tA = standingsMap[m.teamA.name];
    const tB = standingsMap[m.teamB.name];
    if (!tA || !tB) return;

    const scoreA = m.teamA.score ?? 0;
    const scoreB = m.teamB.score ?? 0;

    tA.played += 1;
    tB.played += 1;
    tA.goalsFor += scoreA;
    tA.goalsAgainst += scoreB;
    tB.goalsFor += scoreB;
    tB.goalsAgainst += scoreA;

    if (scoreA > scoreB) {
      tA.won += 1;
      tA.points += 3;
      tB.lost += 1;
    } else if (scoreB > scoreA) {
      tB.won += 1;
      tB.points += 3;
      tA.lost += 1;
    } else {
      tA.drawn += 1;
      tA.points += 1;
      tB.drawn += 1;
      tB.points += 1;
    }
  });

  Object.values(standingsMap).forEach((team) => {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
  });

  return Object.values(standingsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });
}

function StandingsTable({ standings }: { standings: TeamStanding[] }) {
  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
      <div className="border-b border-[#e5e7eb] bg-[#f8f9fa] px-4 py-3">
        <h3 className="text-sm font-semibold text-[#202124]">Classement du groupe</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-0">
          <thead>
            <tr className="border-b border-[#e5e7eb] text-[10px] font-semibold uppercase tracking-wider text-[#5f6368] bg-[#f8f9fa]">
              <th className="py-2.5 pl-4 pr-2 text-center w-8">Pos</th>
              <th className="py-2.5 px-3">Équipe</th>
              <th className="py-2.5 px-3 text-center w-10">MJ</th>
              <th className="py-2.5 px-3 text-center w-10">G</th>
              <th className="py-2.5 px-3 text-center w-10">N</th>
              <th className="py-2.5 px-3 text-center w-10">P</th>
              <th className="py-2.5 px-3 text-center w-10">BP</th>
              <th className="py-2.5 px-3 text-center w-10">BC</th>
              <th className="py-2.5 px-3 text-center w-10">DB</th>
              <th className="py-2.5 pr-4 pl-3 text-center w-14">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] text-sm text-[#202124]">
            {standings.map((team, idx) => (
              <tr key={team.name} className="hover:bg-gray-50/50 transition">
                <td className="py-2.5 pl-4 pr-2 text-center font-medium text-[#5f6368]">{idx + 1}</td>
                <td className="py-2.5 px-3 font-medium flex items-center gap-2">
                  <img
                    src={`https://flagcdn.com/w20/${team.flag}.png`}
                    width={18}
                    height={13}
                    alt=""
                    className="rounded-sm object-cover ring-1 ring-black/5"
                  />
                  <span>{team.name}</span>
                </td>
                <td className="py-2.5 px-3 text-center text-[#5f6368] tabular-nums">{team.played}</td>
                <td className="py-2.5 px-3 text-center text-[#5f6368] tabular-nums">{team.won}</td>
                <td className="py-2.5 px-3 text-center text-[#5f6368] tabular-nums">{team.drawn}</td>
                <td className="py-2.5 px-3 text-center text-[#5f6368] tabular-nums">{team.lost}</td>
                <td className="py-2.5 px-3 text-center text-[#5f6368] tabular-nums">{team.goalsFor}</td>
                <td className="py-2.5 px-3 text-center text-[#5f6368] tabular-nums">{team.goalsAgainst}</td>
                <td className="py-2.5 px-3 text-center font-semibold text-[#5f6368] tabular-nums">
                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                </td>
                <td className="py-2.5 pr-4 pl-3 text-center font-bold text-[#1a73e8] tabular-nums bg-blue-50/10">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TRANSLATE_COUNTRY: Record<string, string> = {
  "Mexico": "Mexique", "South Africa": "Afrique du Sud", "South Korea": "Corée du Sud",
  "Czech Republic": "Tchéquie", "Canada": "Canada", "Bosnia & Herzegovina": "Bosnie-Herzégovine",
  "Bosnia and Herzegovina": "Bosnie-Herzégovine", "Qatar": "Qatar", "Switzerland": "Suisse",
  "Brazil": "Brésil", "Morocco": "Maroc", "Haiti": "Haïti", "Scotland": "Écosse",
  "USA": "États-Unis", "United States": "États-Unis", "Paraguay": "Paraguay", "Australia": "Australie",
  "Turkey": "Turquie", "Germany": "Allemagne", "Curacao": "Curaçao", "Curaçao": "Curaçao",
  "Ivory Coast": "Côte d'Ivoire", "Ecuador": "Équateur", "Netherlands": "Pays-Bas",
  "Japan": "Japon", "Sweden": "Suède", "Tunisie": "Tunisie", "Tunisia": "Tunisie", "Belgium": "Belgique",
  "Egypt": "Égypte", "Iran": "Iran", "New Zealand": "Nouvelle-Zélande", "Spain": "Espagne",
  "Cape Verde": "Cap-Vert", "Saudi Arabia": "Arabie saoudite", "Uruguay": "Uruguay",
  "France": "France", "Senegal": "Sénégal", "Iraq": "Irak", "Norway": "Norvège",
  "Argentina": "Argentine", "Algeria": "Algérie", "Austria": "Autriche", "Jordan": "Jordanie",
  "Portugal": "Portugal", "DR Congo": "RD Congo", "Congo DR": "RD Congo", "Uzbekistan": "Ouzbékistan",
  "Colombia": "Colombie", "England": "Angleterre", "Croatia": "Croatie", "Ghana": "Ghana",
  "Panama": "Panama", "Cabo Verde": "Cap-Vert", "Cote d'Ivoire": "Côte d'Ivoire", "Czechia": "Tchéquie",
  "IR Iran": "Iran", "Korea Republic": "Corée du Sud", "Turkiye": "Turquie"
};

const COUNTRY_TO_FLAG: Record<string, string> = {
  "Mexico": "mx", "Mexique": "mx", "South Africa": "za", "Afrique du Sud": "za",
  "South Korea": "kr", "Corée du Sud": "kr", "Czech Republic": "cz", "Tchéquie": "cz",
  "Canada": "ca", "Bosnia & Herzegovina": "ba", "Bosnia and Herzegovina": "ba", "Bosnie-Herzégovine": "ba",
  "Qatar": "qa", "Switzerland": "ch", "Suisse": "ch", "Brazil": "br", "Brésil": "br",
  "Morocco": "ma", "Maroc": "ma", "Haiti": "ht", "Haïti": "ht", "Scotland": "gb-sct", "Écosse": "gb-sct",
  "USA": "us", "United States": "us", "États-Unis": "us", "Paraguay": "py", "Australia": "au", "Australie": "au",
  "Turkey": "tr", "Turquie": "tr", "Germany": "de", "Allemagne": "de", "Curacao": "cw", "Curaçao": "cw",
  "Ivory Coast": "ci", "Côte d'Ivoire": "ci", "Ecuador": "ec", "Équateur": "ec", "Netherlands": "nl", "Pays-Bas": "nl",
  "Japan": "jp", "Japon": "jp", "Sweden": "se", "Suède": "se", "Tunisia": "tn", "Tunisie": "tn",
  "Belgium": "be", "Belgique": "be", "Egypt": "eg", "Égypte": "eg", "Iran": "ir", "New Zealand": "nz", "Nouvelle-Zélande": "nz",
  "Spain": "es", "Espagne": "es", "Cape Verde": "cv", "Cap-Vert": "cv", "Saudi Arabia": "sa", "Arabie saoudite": "sa",
  "Uruguay": "uy", "France": "fr", "Senegal": "sn", "Sénégal": "sn", "Iraq": "iq", "Irak": "iq", "Norway": "no", "Norvège": "no",
  "Argentina": "ar", "Argentine": "ar", "Algeria": "dz", "Algérie": "dz", "Austria": "at", "Autriche": "at",
  "Jordan": "jo", "Jordanie": "jo", "Portugal": "pt", "DR Congo": "cd", "RD Congo": "cd", "Congo DR": "cd",
  "Uzbekistan": "uz", "Ouzbékistan": "uz", "Colombia": "co", "Colombie": "co", "England": "gb-eng", "Angleterre": "gb-eng",
  "Croatia": "hr", "Croatie": "hr", "Ghana": "gh", "Panama": "pa",
  "Cabo Verde": "cv", "Cote d'Ivoire": "ci", "Czechia": "cz", "IR Iran": "ir", "Korea Republic": "kr", "Turkiye": "tr"
};

const normalizeString = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const mapSupabaseRowToMatch = (row: any): Match => ({
  id: row.id,
  group: row.group_name,
  day: row.day as Day,
  status: row.status as "finished" | "scheduled",
  date: row.date || undefined,
  time: row.time || undefined,
  rawDate: row.raw_date || undefined,
  teamA: {
    name: row.team_a.name,
    flag: row.team_a.flag,
    score: row.team_a.score,
    redCard: row.team_a.redCard,
    yellowCard: row.team_a.yellowCard,
    goals: row.team_a.goals,
    yellows: row.team_a.yellows,
    reds: row.team_a.reds,
    venueCity: row.team_a.venueCity,
    venueCountry: row.team_a.venueCountry,
    coolingBreak: row.team_a.coolingBreak,
    coolingBreakStart: row.team_a.coolingBreakStart,
    halfState: row.team_a.halfState,
    firstHalfStart: row.team_a.firstHalfStart,
    secondHalfStart: row.team_a.secondHalfStart
  },
  teamB: {
    name: row.team_b.name,
    flag: row.team_b.flag,
    score: row.team_b.score,
    redCard: row.team_b.redCard,
    yellowCard: row.team_b.yellowCard,
    goals: row.team_b.goals,
    yellows: row.team_b.yellows,
    reds: row.team_b.reds,
    venueCity: row.team_b.venueCity,
    venueCountry: row.team_b.venueCountry
  }
});

const mapMatchToSupabaseRow = (match: Match): any => ({
  id: match.id,
  group_name: match.group,
  day: match.day,
  status: match.status,
  date: match.date || null,
  time: match.time || null,
  raw_date: match.rawDate || null,
  team_a: match.teamA,
  team_b: match.teamB
});

function Index() {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<"all" | (typeof GROUPS)[number]>("all");
  const [matches, setMatches] = useState<Match[]>([]);
  const [tick, setTick] = useState(0);
  const hasScrolledOnLoad = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000); // Recalculate match statuses and days every 30 seconds in real-time
    return () => clearInterval(timer);
  }, []);

  const todayStr = getLocalDateString(0);
  const yesterdayStr = getLocalDateString(-1);
  const tomorrowStr = getLocalDateString(1);

  const processedMatches = useMemo(() => {
    return matches.map((m) => {
      let dayVal = m.day || "later";
      if (m.rawDate) {
        if (m.rawDate === todayStr) {
          dayVal = "today";
        } else if (m.rawDate === yesterdayStr) {
          dayVal = "yesterday";
        } else if (m.rawDate === tomorrowStr) {
          dayVal = "tomorrow";
        } else {
          dayVal = "later";
        }
      }

      let statusVal = m.status;
      if (m.status === "scheduled" && m.rawDate && m.time) {
        try {
          const [hours, minutes] = m.time.split(':');
          const kickoff = new Date(m.rawDate);
          kickoff.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
          const now = new Date();
          const diffMs = now.getTime() - kickoff.getTime();
          if (diffMs >= 0) {
            const matchDurationMs = 105 * 60 * 1000;
            if (diffMs < matchDurationMs) {
              statusVal = "live";
            } else {
              statusVal = "finished";
            }
          }
        } catch (e) {
          console.error("Auto status calculation error:", e);
        }
      }

      let scoreA = m.teamA.score;
      let scoreB = m.teamB.score;
      if (statusVal !== "scheduled") {
        if (scoreA === undefined || scoreA === null) scoreA = 0;
        if (scoreB === undefined || scoreB === null) scoreB = 0;
      }

      return {
        ...m,
        day: dayVal,
        status: statusVal,
        teamA: {
          ...m.teamA,
          score: scoreA
        },
        teamB: {
          ...m.teamB,
          score: scoreB
        }
      };
    });
  }, [matches, todayStr, yesterdayStr, tomorrowStr, tick]);

  useEffect(() => {
    // Initial fetch from localStorage for fast startup
    const stored = localStorage.getItem("mondial_matches");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Match[];
        const clean = parsed.filter(
          (m) => !isPlaceholder(m.teamA.name) && !isPlaceholder(m.teamB.name)
        );
        setMatches(clean);
      } catch (e) {
        console.error("Fast load parsing failed", e);
      }
    }

    const mergeFixturesWithLocal = async (fixtures: Match[]): Promise<Match[]> => {
      try {
        const response = await fetch('/api-matches.json');
        if (response.ok) {
          const localMatches = await response.json() as Match[];
          return fixtures.map(fMatch => {
            const homeA = normalizeString(fMatch.teamA.name);
            const awayA = normalizeString(fMatch.teamB.name);

            const matchingLocal = localMatches.find(lMatch => {
              const homeB = normalizeString(lMatch.teamA.name);
              const awayB = normalizeString(lMatch.teamB.name);
              return (homeA === homeB && awayA === awayB) || (homeA === awayB && awayA === homeB);
            });

            if (matchingLocal) {
              return {
                ...fMatch,
                status: matchingLocal.status,
                teamA: {
                  ...fMatch.teamA,
                  score: matchingLocal.teamA.score,
                  goals: matchingLocal.teamA.goals || [],
                  yellows: matchingLocal.teamA.yellows || [],
                  reds: matchingLocal.teamA.reds || [],
                  redCard: matchingLocal.teamA.redCard || false,
                  yellowCard: matchingLocal.teamA.yellowCard || false,
                  venueCity: matchingLocal.teamA.venueCity,
                  venueCountry: matchingLocal.teamA.venueCountry
                },
                teamB: {
                  ...fMatch.teamB,
                  score: matchingLocal.teamB.score,
                  goals: matchingLocal.teamB.goals || [],
                  yellows: matchingLocal.teamB.yellows || [],
                  reds: matchingLocal.teamB.reds || [],
                  redCard: matchingLocal.teamB.redCard || false,
                  yellowCard: matchingLocal.teamB.yellowCard || false,
                  venueCity: matchingLocal.teamB.venueCity,
                  venueCountry: matchingLocal.teamB.venueCountry
                }
              };
            }
            return fMatch;
          });
        }
      } catch (e) {
        console.error("Failed to merge fixtures with local matches", e);
      }
      return fixtures;
    };

    let apiMatchesCached: Match[] | null = null;
    let apiFetchPromise: Promise<Match[]> | null = null;

    const getApiMatches = async (): Promise<Match[]> => {
      if (apiMatchesCached) return apiMatchesCached;
      if (apiFetchPromise) return apiFetchPromise;

      apiFetchPromise = (async () => {
        try {
          // 1. Try to get API key from Supabase settings table
          let key: string | null = null;
          const { data: settingsData } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "the_stats_api")
            .single();
          
          if (settingsData && settingsData.value) {
            key = settingsData.value.apiKey || null;
          }

          const parseGroupOrStage = (stageName: string, groupLabel?: string) => {
            const st = stageName.toLowerCase();
            if (groupLabel && groupLabel.length === 1) return `Groupe ${groupLabel.toUpperCase()}`;
            if (st === "round_of_16" || st === "round-of-16") return "Huitièmes de finale";
            if (st === "quarter_finals" || st === "quarter-finals") return "Quarts de finale";
            if (st === "semi_finals" || st === "semi-finals") return "Demi-finales";
            if (st === "third_place" || st === "third-place") return "Match 3e place";
            if (st === "final") return "Finale";
            return "Phase de groupes";
          };

          const convertApiDate = (isoString: string) => {
            const d = new Date(isoString);
            if (isNaN(d.getTime())) return { date: "Date inconnue", rawDate: "", time: "00:00" };
            
            let dateStr = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris' });
            dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
            dateStr = dateStr.replace(/([a-zA-Z]{3,4})\.?\s(\d+)\s([a-zA-Zûé]+)\.?/, (match, p1, p2, p3) => {
              const wkday = p1.endsWith('.') ? p1 : p1 + '.';
              return `${wkday} ${p2} ${p3}`;
            });

            const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Paris' }).replace(':', 'h');

            const year = d.toLocaleDateString('en-CA', { year: 'numeric', timeZone: 'Europe/Paris' });
            const month = d.toLocaleDateString('en-CA', { month: '2-digit', timeZone: 'Europe/Paris' });
            const day = d.toLocaleDateString('en-CA', { day: '2-digit', timeZone: 'Europe/Paris' });
            const rawDate = `${year}-${month}-${day}`;

            return { date: dateStr, rawDate, time: timeStr };
          };

          const todayStr = getLocalDateString(0);

          // Fetch keyless fixtures list first as seed/fallback
          console.log("Fetching fixtures from keyless TheStatsAPI...");
          const keylessRes = await fetch("https://www.thestatsapi.com/world-cup/data/fixtures.json");
          if (!keylessRes.ok) throw new Error("Keyless fixtures fetch failed");
          const keylessData = await keylessRes.json();
          
          let mappedKeyless: Match[] = [];
          if (keylessData && Array.isArray(keylessData.fixtures)) {
            mappedKeyless = keylessData.fixtures.map((item: any) => {
              const dateInput = item.kickoffUtc || item.date;
              const { date, rawDate, time } = convertApiDate(dateInput);
              const group = parseGroupOrStage(item.stage || "group-stage", item.group);

              let dayVal: Day = "later";
              if (rawDate) {
                if (rawDate === todayStr) dayVal = "today";
                else if (rawDate < todayStr) dayVal = "yesterday";
                else dayVal = "tomorrow";
              }

              const homeName = item.homeTeam || "";
              const awayName = item.awayTeam || "";

              return {
                id: `thestatsapi_match_${item.matchNumber}`,
                group: group,
                status: "scheduled",
                date: date,
                rawDate: rawDate,
                time: time,
                day: dayVal,
                teamA: {
                  name: TRANSLATE_COUNTRY[homeName] || homeName,
                  flag: COUNTRY_TO_FLAG[homeName] || "un",
                },
                teamB: {
                  name: TRANSLATE_COUNTRY[awayName] || awayName,
                  flag: COUNTRY_TO_FLAG[awayName] || "un",
                }
              } as Match;
            });
            // Merge with local api-matches.json to get scores/events for played matches
            mappedKeyless = await mergeFixturesWithLocal(mappedKeyless);
          }

          if (key) {
            console.log("API key found in Firestore. Fetching dynamic matches from TheStatsAPI REST server...");
            const restUrl = "https://api.thestatsapi.com/api/football/matches?competition_id=comp_6107&season_id=sn_118868&per_page=120";
            const restRes = await fetch(restUrl, {
              headers: {
                "Authorization": `Bearer ${key}`
              }
            });

            if (restRes.ok) {
              const restResult = await restRes.json();
              if (restResult && Array.isArray(restResult.data)) {
                const restMatches = restResult.data;
                // Merge REST data (scores/status) into our keyless matches by matching team names
                mappedKeyless = mappedKeyless.map((kMatch) => {
                  const matchingRest = restMatches.find((rMatch: any) => {
                    const rHome = rMatch.home_team?.name || "";
                    const rAway = rMatch.away_team?.name || "";
                    const kHome = kMatch.teamA.name;
                    const kAway = kMatch.teamB.name;
                    
                    // Match by translation or English name
                    const translatedHome = TRANSLATE_COUNTRY[rHome] || rHome;
                    const translatedAway = TRANSLATE_COUNTRY[rAway] || rAway;
                    
                    return (
                      normalizeString(translatedHome) === normalizeString(kHome) &&
                      normalizeString(translatedAway) === normalizeString(kAway)
                    );
                  });

                  if (matchingRest) {
                    const isLive = matchingRest.status === "live";
                    const isFinished = matchingRest.status === "finished";
                    const homeScore = matchingRest.score?.home;
                    const awayScore = matchingRest.score?.away;

                    if ((isFinished || isLive) && homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined) {
                      return {
                        ...kMatch,
                        status: isLive ? "live" : "finished",
                        teamA: {
                          ...kMatch.teamA,
                          score: homeScore
                        },
                        teamB: {
                          ...kMatch.teamB,
                          score: awayScore
                        }
                      };
                    } else {
                      return kMatch;
                    }
                  }
                  return kMatch;
                });
              }
            }
          }

          const cleanMapped = mappedKeyless.filter((m: Match) => !isPlaceholder(m.teamA.name) && !isPlaceholder(m.teamB.name));
          if (cleanMapped.length > 0) {
            apiMatchesCached = cleanMapped;
            return cleanMapped;
          }
        } catch (e) {
          console.error("Failed to fetch from TheStatsAPI", e);
        }

        // 2. Fallback to local /api-matches.json
        console.log("Falling back to local api-matches.json...");
        try {
          const response = await fetch('/api-matches.json');
          if (response.ok) {
            const data = await response.json() as Match[];
            apiMatchesCached = data;
            return data;
          }
        } catch (e) {
          console.error("Failed to fetch api-matches.json", e);
        }
        return [];
      })();
      return apiFetchPromise;
    };

    const loadAndSync = async () => {
      try {
        const { data: dbMatches, error } = await supabase.from("matches").select("*");
        if (error) throw error;

        const tempMatches = (dbMatches || []).map(mapSupabaseRowToMatch);
        const apiMatches = await getApiMatches();

        if (apiMatches.length > 0) {
          const dbMap = new Map(tempMatches.map((m) => [m.id, m]));
          
          // Enrich apiMatches with Supabase metadata to prevent overwrite on sync
          apiMatches.forEach((m) => {
            const fsMatch = dbMap.get(m.id);
            if (fsMatch && fsMatch.teamA) {
              if (fsMatch.teamA.venueCity) {
                m.teamA.venueCity = fsMatch.teamA.venueCity;
              }
              if (fsMatch.teamA.venueCountry) {
                m.teamA.venueCountry = fsMatch.teamA.venueCountry;
              }
              if (fsMatch.teamA.coolingBreak !== undefined) {
                m.teamA.coolingBreak = fsMatch.teamA.coolingBreak;
              }
              if (fsMatch.teamA.coolingBreakStart !== undefined) {
                m.teamA.coolingBreakStart = fsMatch.teamA.coolingBreakStart;
              }
              if (fsMatch.teamA.halfState !== undefined) {
                m.teamA.halfState = fsMatch.teamA.halfState;
              }
              if (fsMatch.teamA.firstHalfStart !== undefined) {
                m.teamA.firstHalfStart = fsMatch.teamA.firstHalfStart;
              }
              if (fsMatch.teamA.secondHalfStart !== undefined) {
                m.teamA.secondHalfStart = fsMatch.teamA.secondHalfStart;
              }
            }
          });

          const matchesToSync = apiMatches.filter((m) => {
            const fsMatch = dbMap.get(m.id);
            if (!fsMatch) return true;

            const apiFinished = m.status === "finished";
            const fsFinished = fsMatch.status === "finished";
            if (apiFinished && !fsFinished) return true;

            const apiHasScore = m.teamA.score !== undefined && m.teamB.score !== undefined;
            const fsHasScore = fsMatch.teamA.score !== undefined && fsMatch.teamB.score !== undefined;
            if (apiHasScore && !fsHasScore) return true;

            return false;
          });

          if (matchesToSync.length > 0) {
            console.log(`Syncing ${matchesToSync.length} matches/scores from API to Supabase...`);
            const rows = matchesToSync.map(mapMatchToSupabaseRow);
            const { error: upsertError } = await supabase.from("matches").upsert(rows);
            if (upsertError) {
              console.error("Supabase upsert failed:", upsertError);
            }
            await loadAndSync();
            return;
          }
        }

        // Merge Supabase and API matches. Supabase version takes priority.
        const mergedMap = new Map<string, Match>();
        apiMatches.forEach((m) => {
          mergedMap.set(m.id, m);
        });
        tempMatches.forEach((m) => {
          mergedMap.set(m.id, m);
        });

        const merged = Array.from(mergedMap.values());
        const clean = merged.filter(
          (m) => !isPlaceholder(m.teamA.name) && !isPlaceholder(m.teamB.name)
        );

        setMatches(clean);
        localStorage.setItem("mondial_matches", JSON.stringify(clean));
      } catch (e) {
        console.error("Error in sync/render flow", e);
      }
    };

    loadAndSync();

    const channel = supabase
      .channel("supabase-realtime-matches")
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => {
        loadAndSync();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "mondial_matches" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Match[];
          const clean = parsed.filter(
            (m) => !isPlaceholder(m.teamA.name) && !isPlaceholder(m.teamB.name)
          );
          setMatches(clean);
          if (clean.length !== parsed.length) {
            localStorage.setItem("mondial_matches", JSON.stringify(clean));
          }
        } catch (err) {
          console.error("Failed to parse storage update", err);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (matches.length > 0 && !hasScrolledOnLoad.current) {
      const timer = setTimeout(() => {
        const targetSection = document.getElementById("section-en-cours") || document.getElementById("section-aujourd-hui");
        if (targetSection) {
          const header = document.querySelector("header");
          const headerHeight = header ? header.offsetHeight : 80;
          const elementTop = targetSection.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
          
          window.scrollTo({
            top: elementTop - headerHeight - 16,
            behavior: "smooth",
          });
          hasScrolledOnLoad.current = true;
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [matches]);

  const filtered = useMemo(() => {
    const q = normalizeString(query.trim());
    const res = processedMatches.filter((m) => {
      if (activeGroup !== "all" && m.group !== `Groupe ${activeGroup}`) return false;
      if (!q) return true;
      return (
        normalizeString(m.group).includes(q) ||
        normalizeString(m.teamA.name).includes(q) ||
        normalizeString(m.teamB.name).includes(q)
      );
    });

    const getSortableDate = (m: Match) => {
      if (m.rawDate) return m.rawDate;
      if (m.day === "yesterday") return yesterdayStr;
      if (m.day === "today") return todayStr;
      if (m.day === "tomorrow") return tomorrowStr;
      return "2026-12-31";
    };

    // Stable chronological sort: date -> time -> group -> id
    return res.sort((a, b) => {
      const dateA = getSortableDate(a);
      const dateB = getSortableDate(b);
      if (dateA !== dateB) return dateA.localeCompare(dateB);

      const timeA = a.time || "";
      const timeB = b.time || "";
      if (timeA !== timeB) return timeA.localeCompare(timeB);

      const groupA = a.group || "";
      const groupB = b.group || "";
      if (groupA !== groupB) return groupA.localeCompare(groupB);

      return (a.id || "").localeCompare(b.id || "");
    });
  }, [processedMatches, query, activeGroup, todayStr, yesterdayStr, tomorrowStr]);

  const standings = useMemo(() => {
    if (activeGroup === "all") return [];
    const groupMatches = processedMatches.filter((m) => m.group === `Groupe ${activeGroup}`);
    return calculateStandings(groupMatches);
  }, [processedMatches, activeGroup]);

  const liveMatches = useMemo(() => {
    return filtered.filter((m) => m.status === "live");
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124]">
      <header className="sticky top-0 z-10 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-medium tracking-tight">
              <span className="text-[#1a73e8]">Mondial</span> Score
            </h1>
            <div className="ml-auto flex w-full max-w-md items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-2 shadow-sm transition focus-within:border-[#1a73e8] focus-within:shadow-md">
              <Search size={18} className="shrink-0 text-[#5f6368]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un pays ou un groupe…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#80868b]"
              />
            </div>
          </div>

          <nav className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            <GroupTab label="Tous" active={activeGroup === "all"} onClick={() => setActiveGroup("all")} />
            {GROUPS.map((g) => (
              <GroupTab
                key={g}
                label={`Groupe ${g}`}
                active={activeGroup === g}
                onClick={() => setActiveGroup(g)}
              />
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {activeGroup !== "all" && standings.length > 0 && (
          <StandingsTable standings={standings} />
        )}

        {activeGroup === "all" ? (
          query.trim() ? (
            <Section
              title="Résultats de recherche"
              subtitle={`Matchs correspondant à "${query}"`}
              matches={filtered}
            />
          ) : (
            <>
              {filtered.some(m => m.status !== "live" && (m.rawDate < todayStr || (!m.rawDate && (m.day === "past" || m.day === "yesterday")))) && (
                <Section
                  title="Passé"
                  subtitle="Matchs passés"
                  matches={filtered.filter((m) => {
                    return m.status !== "live" && (m.rawDate < todayStr || (!m.rawDate && (m.day === "past" || m.day === "yesterday")));
                  })}
                />
              )}
              {liveMatches.length > 0 && (
                <Section
                  id="section-en-cours"
                  title="En cours"
                  subtitle="Matchs en direct"
                  matches={liveMatches}
                />
              )}
              <Section
                id="section-aujourd-hui"
                title="Aujourd'hui"
                subtitle="Phase de groupes · Aujourd'hui"
                matches={filtered.filter((m) => {
                  return m.status !== "live" && (m.rawDate === todayStr || (!m.rawDate && m.day === "today"));
                })}
              />
              <Section
                title="Demain"
                subtitle="Phase de groupes · Demain"
                matches={filtered.filter((m) => {
                  return m.rawDate === tomorrowStr || (!m.rawDate && m.day === "tomorrow");
                })}
              />
              {filtered.some(m => m.status !== "live" && (m.rawDate > tomorrowStr || (!m.rawDate && m.day === "later"))) && (
                <Section
                  title="A venir"
                  subtitle="Matchs à venir"
                  matches={filtered.filter((m) => {
                    return m.status !== "live" && (m.rawDate > tomorrowStr || (!m.rawDate && m.day === "later"));
                  })}
                />
              )}
            </>
          )
        ) : (
          <Section
            title="Calendrier & Résultats du Groupe"
            subtitle={`Tous les matchs du Groupe ${activeGroup}`}
            matches={filtered}
          />
        )}

        {filtered.length === 0 && (
          <div className="mt-12 text-center text-sm text-[#5f6368]">
            Aucun match ne correspond à votre recherche.
          </div>
        )}
      </main>
    </div>
  );
}

function GroupTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border text-[11px] sm:text-sm font-medium transition duration-200 px-3 py-1 sm:px-4 sm:py-1.5 ${
        active
          ? "border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8]"
          : "border-[#e5e7eb] bg-white text-[#5f6368] hover:border-[#d2d5da] hover:text-[#202124]"
      }`}
    >
      {label}
    </button>
  );
}

function Section({ id, title, subtitle, matches }: { id?: string; title: string; subtitle: string; matches: Match[] }) {
  if (matches.length === 0) return null;
  return (
    <section id={id} className="mb-10 animate-in fade-in duration-300 scroll-mt-24">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-base font-medium text-[#202124]">{title}</h2>
        <span className="text-xs text-[#5f6368]">{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    </section>
  );
}

function MatchCard({ match }: { match: Match }) {
  const [expanded, setExpanded] = useState(false);
  const finished = match.status === "finished";
  const isLive = match.status === "live";
  const aWins = finished && (match.teamA.score ?? 0) > (match.teamB.score ?? 0);
  const bWins = finished && (match.teamB.score ?? 0) > (match.teamA.score ?? 0);

  return (
    <article
      onClick={() => setExpanded(!expanded)}
      className={`group flex flex-col rounded-xl border ${isLive ? "border-red-200 bg-red-50/10 shadow-sm" : "border-[#e5e7eb] bg-white"} p-4 transition hover:border-[#d2d5da] hover:shadow-sm cursor-pointer select-none`}
    >
      <div className="flex items-stretch gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-2 text-xs text-[#5f6368]">{match.group}</div>
          <TeamRow team={match.teamA} won={aWins} showScore={finished || isLive} />
          <div className="my-1 h-px bg-[#f1f3f4]" />
          <TeamRow team={match.teamB} won={bWins} showScore={finished || isLive} />
          <div className="mt-2 flex items-center justify-between text-xs text-[#5f6368]">
            {isLive ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#d93025] flex items-center gap-1.5 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d93025] inline-block" />
                  {getLiveStatusText(match)}
                </span>
              </div>
            ) : finished ? (
              <span className="font-medium text-[#202124]">
                Terminé · FT{match.date ? ` · ${match.date}` : ""}{match.time ? ` · ${match.time.replace(':', 'h')}` : ""}
              </span>
            ) : (
              <span className="font-medium text-[#1a73e8]">
                {match.date ? `${match.date}${match.time ? ` · ${match.time.replace(':', 'h')}` : ""}` : (match.day === "tomorrow" ? "Demain" : match.day === "yesterday" ? "Hier" : match.day === "today" ? "Aujourd'hui" : match.day === "past" ? "Passé" : "A venir")}
              </span>
            )}
            {match.teamA.venueCity && (
              <span className="flex items-center gap-1 text-[11px] text-[#5f6368] bg-[#f1f3f4] px-2 py-0.5 rounded-full font-medium animate-in fade-in duration-200">
                <MapPin size={11} className="text-[#1a73e8]" />
                {match.teamA.venueCity}{match.teamA.venueCountry ? `, ${match.teamA.venueCountry}` : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#f1f3f4] text-xs text-[#5f6368] animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium text-slate-800 mb-1.5">{match.teamA.name}</div>
              {renderEvents(match.teamA, false)}
            </div>
            <div>
              <div className="font-medium text-slate-800 mb-1.5 text-right">{match.teamB.name}</div>
              {renderEvents(match.teamB, true)}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function renderEvents(team: Team, rightAlign = false) {
  const hasGoals = team.goals && team.goals.length > 0;
  const hasYellows = team.yellows && team.yellows.length > 0;
  const hasReds = team.reds && team.reds.length > 0;

  if (!hasGoals && !hasYellows && !hasReds) {
    return <div className={`text-[10px] text-[#80868b] italic ${rightAlign ? "text-right" : "text-left"}`}>Aucun événement</div>;
  }

  return (
    <div className={`space-y-1.5 ${rightAlign ? "text-right flex flex-col items-end" : "text-left"}`}>
      {hasGoals && team.goals?.map((g, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[#202124]">
          {!rightAlign && <span className="text-xs">⚽</span>}
          <span className="truncate">{g}</span>
          {rightAlign && <span className="text-xs">⚽</span>}
        </div>
      ))}
      
      {hasYellows && team.yellows?.map((y, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[#202124]">
          {!rightAlign && <span className="inline-block w-2 h-3 bg-[#fabb05] rounded-[1px]" title="Carton jaune" />}
          <span className="truncate">{y}</span>
          {rightAlign && <span className="inline-block w-2 h-3 bg-[#fabb05] rounded-[1px]" title="Carton jaune" />}
        </div>
      ))}

      {hasReds && team.reds?.map((r, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[#202124]">
          {!rightAlign && <span className="inline-block w-2 h-3 bg-[#ea4335] rounded-[1px]" title="Carton rouge" />}
          <span className="truncate">{r}</span>
          {rightAlign && <span className="inline-block w-2 h-3 bg-[#ea4335] rounded-[1px]" title="Carton rouge" />}
        </div>
      ))}
    </div>
  );
}

function TeamRow({ team, won, showScore }: { team: Team; won: boolean; showScore: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <img
        src={`https://flagcdn.com/w40/${team.flag}.png`}
        srcSet={`https://flagcdn.com/w80/${team.flag}.png 2x`}
        width={24}
        height={18}
        alt=""
        loading="lazy"
        className="h-[18px] w-6 shrink-0 rounded-sm object-cover ring-1 ring-black/5"
      />
      <span className={`flex-1 min-w-0 truncate text-sm ${won ? "font-semibold" : "font-normal"} text-[#202124]`}>
        {team.name}
      </span>
      {team.yellowCard && (
        <span className="inline-block h-3.5 w-2.5 rounded-[2px] bg-[#fabb05]" aria-label="Carton jaune" />
      )}
      {team.redCard && (
        <span className="inline-block h-3.5 w-2.5 rounded-[2px] bg-[#d93025]" aria-label="Carton rouge" />
      )}
      {showScore && (
        <div className="flex items-center gap-1">
          {won && <ArrowUp size={14} className="text-[#5f6368]" />}
          <span className={`w-5 text-right text-sm tabular-nums ${won ? "font-semibold text-[#202124]" : "text-[#5f6368]"}`}>
            {team.score}
          </span>
        </div>
      )}
    </div>
  );
}
