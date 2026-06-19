import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Play, ArrowUp } from "lucide-react";

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

type Match = {
  id: string;
  group: string;
  day: "today" | "tomorrow";
  status: "finished" | "scheduled";
  time?: string;
  duration: string;
  teamA: { name: string; flag: string; score?: number; redCard?: boolean };
  teamB: { name: string; flag: string; score?: number; redCard?: boolean };
};

const MATCHES: Match[] = [
  {
    id: "1", group: "Groupe B", day: "today", status: "finished", duration: "2:14",
    teamA: { name: "Canada", flag: "ca", score: 6 },
    teamB: { name: "Qatar", flag: "qa", score: 0, redCard: true },
  },
  {
    id: "2", group: "Groupe A", day: "today", status: "finished", duration: "1:48",
    teamA: { name: "Mexique", flag: "mx", score: 1 },
    teamB: { name: "Corée du Sud", flag: "kr", score: 0 },
  },
  {
    id: "3", group: "Groupe D", day: "today", status: "scheduled", time: "21:00", duration: "0:32",
    teamA: { name: "USA", flag: "us" },
    teamB: { name: "Australie", flag: "au" },
  },
  {
    id: "4", group: "Groupe C", day: "tomorrow", status: "scheduled", time: "00:00", duration: "0:28",
    teamA: { name: "Écosse", flag: "gb-sct" },
    teamB: { name: "Maroc", flag: "ma" },
  },
  {
    id: "5", group: "Groupe C", day: "tomorrow", status: "scheduled", time: "02:30", duration: "0:45",
    teamA: { name: "Brésil", flag: "br" },
    teamB: { name: "Haïti", flag: "ht" },
  },
  {
    id: "6", group: "Groupe D", day: "tomorrow", status: "scheduled", time: "05:00", duration: "0:30",
    teamA: { name: "Turquie", flag: "tr" },
    teamB: { name: "Tunisie", flag: "tn" },
  },
  {
    id: "7", group: "Groupe F", day: "tomorrow", status: "scheduled", time: "19:00", duration: "0:36",
    teamA: { name: "Pays-Bas", flag: "nl" },
    teamB: { name: "Sénégal", flag: "sn" },
  },
];

function Index() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MATCHES;
    return MATCHES.filter(
      (m) =>
        m.group.toLowerCase().includes(q) ||
        m.group.toLowerCase().replace("groupe ", "groupe").includes(q) ||
        m.teamA.name.toLowerCase().includes(q) ||
        m.teamB.name.toLowerCase().includes(q),
    );
  }, [query]);

  const today = filtered.filter((m) => m.day === "today");
  const tomorrow = filtered.filter((m) => m.day === "tomorrow");

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
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
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Section title="Aujourd'hui" subtitle="Group Stage · Today" matches={today} />
        <Section title="Demain" subtitle="Group Stage · Tomorrow" matches={tomorrow} />

        {filtered.length === 0 && (
          <div className="mt-12 text-center text-sm text-[#5f6368]">
            Aucun match ne correspond à votre recherche.
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, subtitle, matches }: { title: string; subtitle: string; matches: Match[] }) {
  if (matches.length === 0) return null;
  return (
    <section className="mb-10 animate-in fade-in duration-300">
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
  const finished = match.status === "finished";
  const aWins = finished && (match.teamA.score ?? 0) > (match.teamB.score ?? 0);
  const bWins = finished && (match.teamB.score ?? 0) > (match.teamA.score ?? 0);

  return (
    <article className="group flex items-stretch gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 transition hover:border-[#d2d5da] hover:shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="mb-2 text-xs text-[#5f6368]">{match.group}</div>
        <TeamRow team={match.teamA} won={aWins} finished={finished} />
        <div className="my-1 h-px bg-[#f1f3f4]" />
        <TeamRow team={match.teamB} won={bWins} finished={finished} />
        <div className="mt-2 text-xs text-[#5f6368]">
          {finished ? (
            <span className="font-medium text-[#202124]">Terminé · FT</span>
          ) : (
            <span>
              {match.day === "tomorrow" ? "Demain " : ""}
              {match.time}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="relative grid w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#1a73e8] to-[#174ea6] text-white transition group-hover:brightness-110 sm:w-32"
        aria-label="Résumé du match"
      >
        <Play size={22} className="drop-shadow" fill="white" />
        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium">
          {match.duration}
        </span>
      </button>
    </article>
  );
}

function TeamRow({ team, won, finished }: { team: Match["teamA"]; won: boolean; finished: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-xl leading-none" aria-hidden>{team.flag}</span>
      <span className={`flex-1 min-w-0 truncate text-sm ${won ? "font-semibold" : "font-normal"} text-[#202124]`}>
        {team.name}
      </span>
      {team.redCard && (
        <span className="inline-block h-3.5 w-2.5 rounded-[2px] bg-[#d93025]" aria-label="Carton rouge" />
      )}
      {finished && (
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
