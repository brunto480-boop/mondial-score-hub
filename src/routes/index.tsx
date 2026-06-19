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

type Day = "yesterday" | "today" | "tomorrow" | "later";

type Team = { name: string; flag: string; score?: number; redCard?: boolean };

type Match = {
  id: string;
  group: string;
  day: Day;
  status: "finished" | "scheduled";
  time?: string;
  duration: string;
  teamA: Team;
  teamB: Team;
};

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

// Helper builders
const F = (id: string, group: string, day: Day, time: string, a: Team, b: Team, dur: string): Match => ({
  id, group: `Groupe ${group}`, day, status: "finished", time, duration: dur,
  teamA: a, teamB: b,
});
const S = (id: string, group: string, day: Day, time: string, a: Team, b: Team, dur: string): Match => ({
  id, group: `Groupe ${group}`, day, status: "scheduled", time, duration: dur,
  teamA: { name: a.name, flag: a.flag }, teamB: { name: b.name, flag: b.flag },
});

const MATCHES: Match[] = [
  // ===== Groupe A : Mexique, Corée du Sud, Italie, Cameroun =====
  F("a1", "A", "yesterday", "18:00", { name: "Italie", flag: "it", score: 2 }, { name: "Cameroun", flag: "cm", score: 1 }, "2:05"),
  F("a2", "A", "today", "15:00", { name: "Mexique", flag: "mx", score: 1 }, { name: "Corée du Sud", flag: "kr", score: 0 }, "1:48"),
  S("a3", "A", "today", "21:00", { name: "Italie", flag: "it" }, { name: "Mexique", flag: "mx" }, "0:25"),
  S("a4", "A", "tomorrow", "18:00", { name: "Cameroun", flag: "cm" }, { name: "Corée du Sud", flag: "kr" }, "0:22"),
  S("a5", "A", "later", "Lun. 21:00", { name: "Italie", flag: "it" }, { name: "Corée du Sud", flag: "kr" }, "0:18"),
  S("a6", "A", "later", "Lun. 21:00", { name: "Mexique", flag: "mx" }, { name: "Cameroun", flag: "cm" }, "0:18"),

  // ===== Groupe B : Canada, Qatar, Espagne, Nigéria =====
  F("b1", "B", "yesterday", "21:00", { name: "Espagne", flag: "es", score: 3 }, { name: "Nigéria", flag: "ng", score: 1 }, "2:18"),
  F("b2", "B", "today", "18:00", { name: "Canada", flag: "ca", score: 6 }, { name: "Qatar", flag: "qa", score: 0, redCard: true }, "2:14"),
  S("b3", "B", "tomorrow", "15:00", { name: "Espagne", flag: "es" }, { name: "Canada", flag: "ca" }, "0:30"),
  S("b4", "B", "tomorrow", "21:00", { name: "Qatar", flag: "qa" }, { name: "Nigéria", flag: "ng" }, "0:24"),
  S("b5", "B", "later", "Mar. 18:00", { name: "Espagne", flag: "es" }, { name: "Qatar", flag: "qa" }, "0:18"),
  S("b6", "B", "later", "Mar. 18:00", { name: "Canada", flag: "ca" }, { name: "Nigéria", flag: "ng" }, "0:18"),

  // ===== Groupe C : Écosse, Maroc, Brésil, Haïti =====
  F("c1", "C", "yesterday", "20:00", { name: "Brésil", flag: "br", score: 4 }, { name: "Maroc", flag: "ma", score: 2 }, "2:30"),
  S("c2", "C", "tomorrow", "00:00", { name: "Écosse", flag: "gb-sct" }, { name: "Maroc", flag: "ma" }, "0:28"),
  S("c3", "C", "tomorrow", "02:30", { name: "Brésil", flag: "br" }, { name: "Haïti", flag: "ht" }, "0:45"),
  S("c4", "C", "later", "Dim. 18:00", { name: "Brésil", flag: "br" }, { name: "Écosse", flag: "gb-sct" }, "0:22"),
  S("c5", "C", "later", "Dim. 21:00", { name: "Maroc", flag: "ma" }, { name: "Haïti", flag: "ht" }, "0:20"),
  S("c6", "C", "later", "Mer. 21:00", { name: "Écosse", flag: "gb-sct" }, { name: "Haïti", flag: "ht" }, "0:18"),

  // ===== Groupe D : USA, Australie, Turquie, Tunisie =====
  F("d1", "D", "yesterday", "17:00", { name: "Turquie", flag: "tr", score: 2 }, { name: "Tunisie", flag: "tn", score: 2 }, "2:10"),
  S("d2", "D", "today", "21:00", { name: "USA", flag: "us" }, { name: "Australie", flag: "au" }, "0:32"),
  S("d3", "D", "tomorrow", "05:00", { name: "Turquie", flag: "tr" }, { name: "Tunisie", flag: "tn" }, "0:30"),
  S("d4", "D", "tomorrow", "21:00", { name: "USA", flag: "us" }, { name: "Turquie", flag: "tr" }, "0:24"),
  S("d5", "D", "later", "Mar. 21:00", { name: "Australie", flag: "au" }, { name: "Tunisie", flag: "tn" }, "0:18"),
  S("d6", "D", "later", "Ven. 21:00", { name: "USA", flag: "us" }, { name: "Tunisie", flag: "tn" }, "0:18"),

  // ===== Groupe E : Argentine, Japon, Angleterre, Algérie =====
  F("e1", "E", "yesterday", "19:00", { name: "Argentine", flag: "ar", score: 2 }, { name: "Algérie", flag: "dz", score: 0 }, "2:22"),
  F("e2", "E", "yesterday", "21:00", { name: "Angleterre", flag: "gb-eng", score: 1 }, { name: "Japon", flag: "jp", score: 1 }, "2:08"),
  S("e3", "E", "today", "21:00", { name: "Argentine", flag: "ar" }, { name: "Angleterre", flag: "gb-eng" }, "0:40"),
  S("e4", "E", "tomorrow", "18:00", { name: "Japon", flag: "jp" }, { name: "Algérie", flag: "dz" }, "0:22"),
  S("e5", "E", "later", "Lun. 18:00", { name: "Argentine", flag: "ar" }, { name: "Japon", flag: "jp" }, "0:20"),
  S("e6", "E", "later", "Lun. 21:00", { name: "Angleterre", flag: "gb-eng" }, { name: "Algérie", flag: "dz" }, "0:20"),

  // ===== Groupe F : Pays-Bas, Sénégal, Colombie, Iran =====
  F("f1", "F", "yesterday", "15:00", { name: "Colombie", flag: "co", score: 3 }, { name: "Iran", flag: "ir", score: 0 }, "2:16"),
  S("f2", "F", "tomorrow", "19:00", { name: "Pays-Bas", flag: "nl" }, { name: "Sénégal", flag: "sn" }, "0:36"),
  S("f3", "F", "tomorrow", "21:00", { name: "Colombie", flag: "co" }, { name: "Pays-Bas", flag: "nl" }, "0:24"),
  S("f4", "F", "later", "Mar. 15:00", { name: "Sénégal", flag: "sn" }, { name: "Iran", flag: "ir" }, "0:18"),
  S("f5", "F", "later", "Ven. 18:00", { name: "Pays-Bas", flag: "nl" }, { name: "Iran", flag: "ir" }, "0:18"),
  S("f6", "F", "later", "Ven. 18:00", { name: "Colombie", flag: "co" }, { name: "Sénégal", flag: "sn" }, "0:18"),

  // ===== Groupe G : France, Égypte, Portugal, Japon =====
  F("g1", "G", "yesterday", "21:00", { name: "France", flag: "fr", score: 2 }, { name: "Égypte", flag: "eg", score: 1 }, "2:24"),
  F("g2", "G", "today", "18:00", { name: "Portugal", flag: "pt", score: 3 }, { name: "Japon", flag: "jp", score: 2 }, "2:30"),
  S("g3", "G", "tomorrow", "21:00", { name: "France", flag: "fr" }, { name: "Portugal", flag: "pt" }, "0:42"),
  S("g4", "G", "tomorrow", "15:00", { name: "Égypte", flag: "eg" }, { name: "Japon", flag: "jp" }, "0:22"),
  S("g5", "G", "later", "Mer. 18:00", { name: "France", flag: "fr" }, { name: "Japon", flag: "jp" }, "0:20"),
  S("g6", "G", "later", "Mer. 18:00", { name: "Portugal", flag: "pt" }, { name: "Égypte", flag: "eg" }, "0:20"),

  // ===== Groupe H : Allemagne, Uruguay, Belgique, Corée du Nord =====
  F("h1", "H", "yesterday", "16:00", { name: "Allemagne", flag: "de", score: 4 }, { name: "Corée du Nord", flag: "kp", score: 0 }, "2:20"),
  F("h2", "H", "today", "20:00", { name: "Belgique", flag: "be", score: 2 }, { name: "Uruguay", flag: "uy", score: 2 }, "2:18"),
  S("h3", "H", "tomorrow", "18:00", { name: "Allemagne", flag: "de" }, { name: "Belgique", flag: "be" }, "0:38"),
  S("h4", "H", "tomorrow", "21:00", { name: "Uruguay", flag: "uy" }, { name: "Corée du Nord", flag: "kp" }, "0:24"),
  S("h5", "H", "later", "Jeu. 18:00", { name: "Allemagne", flag: "de" }, { name: "Uruguay", flag: "uy" }, "0:20"),
  S("h6", "H", "later", "Jeu. 21:00", { name: "Belgique", flag: "be" }, { name: "Corée du Nord", flag: "kp" }, "0:20"),
];

const DAY_LABELS: { key: Day; title: string; subtitle: string }[] = [
  { key: "yesterday", title: "Hier", subtitle: "Group Stage · Yesterday" },
  { key: "today", title: "Aujourd'hui", subtitle: "Group Stage · Today" },
  { key: "tomorrow", title: "Demain", subtitle: "Group Stage · Tomorrow" },
  { key: "later", title: "Plus tard", subtitle: "Group Stage · Upcoming" },
];

function Index() {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<"all" | (typeof GROUPS)[number]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MATCHES.filter((m) => {
      if (activeGroup !== "all" && m.group !== `Groupe ${activeGroup}`) return false;
      if (!q) return true;
      return (
        m.group.toLowerCase().includes(q) ||
        m.teamA.name.toLowerCase().includes(q) ||
        m.teamB.name.toLowerCase().includes(q)
      );
    });
  }, [query, activeGroup]);

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

          <nav className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        {DAY_LABELS.map((d) => (
          <Section
            key={d.key}
            title={d.title}
            subtitle={d.subtitle}
            matches={filtered.filter((m) => m.day === d.key)}
          />
        ))}

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
      className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? "border-[#1a73e8] bg-[#e8f0fe] font-medium text-[#1a73e8]"
          : "border-[#e5e7eb] bg-white text-[#5f6368] hover:border-[#d2d5da] hover:text-[#202124]"
      }`}
    >
      {label}
    </button>
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

      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${match.teamA.name} vs ${match.teamB.name} ${finished ? "résumé highlights" : "Coupe du Monde"}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative grid w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-[#1a73e8] to-[#174ea6] text-white transition group-hover:brightness-110 sm:w-32"
        aria-label={`Voir le résumé : ${match.teamA.name} contre ${match.teamB.name}`}
      >
        <Play size={22} className="drop-shadow" fill="white" />
        <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium">
          {match.duration}
        </span>
      </a>
    </article>
  );
}

function TeamRow({ team, won, finished }: { team: Team; won: boolean; finished: boolean }) {
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
