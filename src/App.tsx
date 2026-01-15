import React, { useEffect, useMemo, useState } from "react";

/**
 * Spares Hub — Netlify-ready Vite + React + TS demo
 * - Funnel: Era → Make → Model → Category → Results
 * - Search works within current context (e.g. 1950–1970 + Jaguar + “speedo”)
 * - Sell flow saves to localStorage (demo)
 * - Clean high-end navy + mint styling
 */

/* ---------- Theme ---------- */
const NAVY = "#070B14";
const NAVY_2 = "#0B1020";
const INK = "#0E162B";
const WHITE = "#EEF2F7";
const MUTED = "rgba(238,242,247,.72)";
const BORDER = "rgba(255,255,255,.10)";
const ACCENT = "#3CFFB4"; // mint
const ACCENT_SOFT = "rgba(60,255,180,.16)";

/* ---------- Types ---------- */
type EraId = "pre1950" | "50_70" | "70_80" | "80_2000";
type Step = "era" | "make" | "model" | "category" | "results";
type Route = { name: "browse" } | { name: "sell" } | { name: "listing"; id: string };

type Category =
  | "Engine & Fuel"
  | "Cooling"
  | "Transmission"
  | "Suspension & Steering"
  | "Brakes"
  | "Electrical & Ignition"
  | "Body Panels"
  | "Interior & Trim"
  | "Glass & Seals"
  | "Wheels"
  | "Hardware & Fixings"
  | "Literature / Tools"
  | "Misc";

type Condition = "Original" | "Used" | "Overhauled" | "NOS" | "Reproduction" | "Unknown";

type Listing = {
  id: string;
  createdAt: number;
  era: EraId;
  make: string;
  model: string;
  category: Category;
  title: string;
  description?: string;
  condition: Condition;
  priceGBP: number;
  location: string;
  postageAvailable: boolean;
  photos: string[]; // base64 data URLs
};

/* ---------- Data ---------- */
const ERAS: { id: EraId; label: string; meta: string }[] = [
  { id: "pre1950", label: "Pre-1950", meta: "pre-war & veteran" },
  { id: "50_70", label: "1950–1970", meta: "golden era" },
  { id: "70_80", label: "1970–1980", meta: "analogue icons" },
  { id: "80_2000", label: "1980–2000", meta: "modern classics" },
];

const CATEGORIES: { label: Category; meta: string }[] = [
  { label: "Engine & Fuel", meta: "carb, injection, ancillaries" },
  { label: "Cooling", meta: "rads, hoses, fans" },
  { label: "Transmission", meta: "gearbox, diff, clutch" },
  { label: "Suspension & Steering", meta: "springs, shocks, racks" },
  { label: "Brakes", meta: "calipers, discs, hydraulics" },
  { label: "Electrical & Ignition", meta: "looms, ignition, lights" },
  { label: "Body Panels", meta: "doors, wings, bonnets" },
  { label: "Interior & Trim", meta: "seats, trim, switches" },
  { label: "Glass & Seals", meta: "rubbers, screens, seals" },
  { label: "Wheels", meta: "wheels, hubs, spinners" },
  { label: "Hardware & Fixings", meta: "brackets, clips, fasteners" },
  { label: "Literature / Tools", meta: "manuals, tools, specials" },
  { label: "Misc", meta: "other parts" },
];

const MAKE_MODEL_BY_ERA: Record<EraId, Record<string, string[]>> = {
  pre1950: {
    Bentley: ["3.5 Litre", "4.25 Litre"],
    Bugatti: ["Type 35", "Type 57"],
    Jaguar: ["SS 100", "SS 90"],
    MG: ["TA", "TB", "TC"],
    "Alfa Romeo": ["6C", "8C (pre-war)"],
    "Rolls-Royce": ["Phantom", "Wraith (pre-war)"],
  },
  "50_70": {
    Jaguar: ["XK120", "XK140", "XK150", "E-Type Series 1", "E-Type Series 2"],
    Porsche: ["356", "911 (early)"],
    Mercedes: ["300 SL", "230 SL (Pagoda)"],
    Ferrari: ["250 (series)", "275 (series)"],
    "Aston Martin": ["DB2/4", "DB4", "DB5", "DB6"],
    Ford: ["Escort Mk1", "Cortina Mk1/2", "Mustang (early)"],
    Chevrolet: ["Corvette C1", "Corvette C2"],
    Mini: ["Mini (classic)"],
    "Alfa Romeo": ["Giulia (105)", "Spider (Duetto)"],
    BMW: ["2002", "E9 3.0 CS (early)"],
  },
  "70_80": {
    Porsche: ["911 SC", "930 Turbo", "928"],
    Ferrari: ["308", "512 BB"],
    BMW: ["E9 3.0 CS", "E21 3-Series"],
    Ford: ["Escort Mk2", "Capri", "RS2000"],
    Jaguar: ["XJ Series 2/3", "XJS (early)"],
    Mercedes: ["W116 S-Class", "R107 SL"],
    Lamborghini: ["Countach (early)"],
    "Alfa Romeo": ["Alfetta", "GTV (116)"],
  },
  "80_2000": {
    Ford: ["Escort RS Turbo", "Sierra Cosworth", "Focus (early)"],
    BMW: ["E30", "E36", "E46", "E34 5-Series"],
    Porsche: ["964", "993", "996", "944", "928 (late)"],
    Ferrari: ["348", "355", "360 (early)"],
    Mercedes: ["W124", "R129 SL", "190E (W201)"],
    Jaguar: ["XJ40", "X300", "XJS", "XK8 (early)"],
    Audi: ["Quattro (Ur)", "B5 S4 (late 90s)"],
    Volkswagen: ["Golf GTI Mk2/3", "Corrado"],
    Subaru: ["Impreza (classic)"],
  },
};

/* ---------- Storage ---------- */
const STORAGE_KEY = "spares_hub:listings:v1";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function seedListings(): Listing[] {
  return [
    {
      id: "seed1",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      era: "50_70",
      make: "Jaguar",
      model: "E-Type Series 1",
      category: "Electrical & Ignition",
      title: "Smiths speedometer (mph) — excellent face, needs cable",
      description: "Original Smiths unit. Often used across multiple Jaguar applications. Please check fitment.",
      condition: "Original",
      priceGBP: 640,
      location: "London",
      postageAvailable: true,
      photos: [],
    },
    {
      id: "seed2",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
      era: "50_70",
      make: "Jaguar",
      model: "XK140",
      category: "Electrical & Ignition",
      title: "Smiths speedo head (mph) — tested",
      description: "Bench-tested. Good needle action. Suitable for XK / early Jaguar applications.",
      condition: "Used",
      priceGBP: 495,
      location: "West Sussex",
      postageAvailable: true,
      photos: [],
    },
    {
      id: "seed3",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      era: "80_2000",
      make: "BMW",
      model: "E30",
      category: "Suspension & Steering",
      title: "E30 steering rack (good used)",
      description: "No play. Boots intact. Collection preferred.",
      condition: "Used",
      priceGBP: 220,
      location: "Manchester",
      postageAvailable: false,
      photos: [],
    },
    {
      id: "seed4",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
      era: "80_2000",
      make: "Ford",
      model: "Escort RS Turbo",
      category: "Engine & Fuel",
      title: "Original RS Turbo Series 2 inlet manifold",
      description: "Original used item. No cracks. Threads good.",
      condition: "Original",
      priceGBP: 380,
      location: "Essex",
      postageAvailable: true,
      photos: [],
    },
  ];
}

function loadListings(): Listing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedListings();
    const parsed = JSON.parse(raw) as Listing[];
    if (!Array.isArray(parsed)) return seedListings();
    return parsed;
  } catch {
    return seedListings();
  }
}

function saveListings(list: Listing[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* ---------- App ---------- */
export default function App() {
  const [route, setRoute] = useState<Route>({ name: "browse" });
  const [listings, setListings] = useState<Listing[]>([]);

  const [step, setStep] = useState<Step>("era");
  const [era, setEra] = useState<EraId | null>(null);
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  // Single search box used on make/model/category/results
  const [q, setQ] = useState("");

  useEffect(() => {
    setListings(loadListings());
  }, []);

  const refresh = () => setListings(loadListings());

  const resetBrowse = () => {
    setStep("era");
    setEra(null);
    setMake(null);
    setModel(null);
    setCategory(null);
    setQ("");
  };

  const makes = useMemo(() => {
    if (!era) return [];
    return Object.keys(MAKE_MODEL_BY_ERA[era] || {}).sort();
  }, [era]);

  const models = useMemo(() => {
    if (!era || !make) return [];
    return (MAKE_MODEL_BY_ERA[era]?.[make] || []).slice().sort();
  }, [era, make]);

  // Listing search within current context + keyword
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    return listings
      .filter((l) => (era ? l.era === era : true))
      .filter((l) => (make ? l.make === make : true))
      .filter((l) => (model ? l.model === model : true))
      .filter((l) => (category ? l.category === category : true))
      .filter((l) => {
        if (!s) return true;
        return (
          l.title.toLowerCase().includes(s) ||
          (l.description || "").toLowerCase().includes(s) ||
          l.category.toLowerCase().includes(s) ||
          l.make.toLowerCase().includes(s) ||
          l.model.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [listings, era, make, model, category, q]);

  const stats = useMemo(() => {
    if (!matches.length) return { min: 0, max: 0 };
    let min = matches[0].priceGBP;
    let max = matches[0].priceGBP;
    for (const m of matches) {
      min = Math.min(min, m.priceGBP);
      max = Math.max(max, m.priceGBP);
    }
    return { min, max };
  }, [matches]);

  const active = route.name === "listing" ? listings.find((l) => l.id === route.id) ?? null : null;

  return (
    <div style={S.page}>
      <TopBar
        active={route.name === "sell" ? "sell" : "browse"}
        onBrowse={() => setRoute({ name: "browse" })}
        onSell={() => setRoute({ name: "sell" })}
      />

      <div style={S.container}>
        {route.name === "browse" && (
          <Card>
            <div style={S.section}>
              <div style={S.headerRow}>
                <div>
                  <div style={S.h1}>
                    {step === "era"
                      ? "Choose an era"
                      : step === "make"
                      ? "Choose a make"
                      : step === "model"
                      ? "Choose a model"
                      : step === "category"
                      ? "Choose a category"
                      : "Results"}
                  </div>
                  <div style={S.p}>
                    {step === "era"
                      ? "Tap once to browse. Search appears after you pick an era."
                      : "Tip: you can type a part name at any step (e.g. “speedo”) to see matches in this context."}
                  </div>
                </div>

                {step !== "era" && (
                  <button style={S.btnSecondary} onClick={resetBrowse}>
                    Reset
                  </button>
                )}
              </div>

              <Breadcrumbs
                era={era}
                make={make}
                model={model}
                category={category}
                onClearEra={resetBrowse}
                onClearMake={() => {
                  setMake(null);
                  setModel(null);
                  setCategory(null);
                }}
                onClearModel={() => {
                  setModel(null);
                  setCategory(null);
                }}
                onClearCategory={() => setCategory(null)}
              />

              {step !== "era" && (
                <div style={S.searchRow}>
                  <input
                    style={S.searchInput}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={
                      step === "make"
                        ? "Search makes OR type a part (e.g. speedo)…"
                        : step === "model"
                        ? "Search models OR type a part…"
                        : step === "category"
                        ? "Search categories OR type a part…"
                        : "Search results (e.g. steering, Weber, speedo)…"
                    }
                  />
                  <button style={S.btnSecondary} onClick={() => setQ("")}>
                    Clear
                  </button>
                </div>
              )}

              {/* Step: ERA */}
              {step === "era" && (
                <Grid>
                  {ERAS.map((e) => (
                    <Tile
                      key={e.id}
                      label={e.label}
                      meta={e.meta}
                      onClick={() => {
                        setEra(e.id);
                        setStep("make");
                        setQ("");
                      }}
                    />
                  ))}
                </Grid>
              )}

              {/* Step: MAKE */}
              {step === "make" && (
                <>
                  <div style={S.actions}>
                    <button
                      style={S.btnSecondary}
                      onClick={() => {
                        resetBrowse();
                      }}
                    >
                      Back
                    </button>
                    <button
                      style={S.btnPrimary}
                      onClick={() => {
                        // if user typed an exact make, allow continue
                        const exact = makes.find((m) => m.toLowerCase() === q.trim().toLowerCase());
                        if (exact) {
                          setMake(exact);
                          setStep("model");
                        }
                      }}
                    >
                      Continue
                    </button>
                  </div>

                  <Divider />

                  <Grid>
                    {filterList(makes, q).map((m) => (
                      <Tile
                        key={m}
                        label={m}
                        meta="Tap to choose"
                        onClick={() => {
                          setMake(m);
                          setStep("model");
                        }}
                      />
                    ))}
                    <Tile
                      key="other"
                      label="Other / Unknown"
                      meta="If your make isn’t listed"
                      onClick={() => {
                        setMake("Other / Unknown");
                        setStep("model");
                      }}
                    />
                  </Grid>

                  <InstantMatches
                    show={q.trim().length > 0}
                    title={`Matches in ${labelEra(era!)} • ${make ?? "Any make"}`}
                    count={matches.length}
                    range={matches.length ? `£${stats.min.toLocaleString()}–£${stats.max.toLocaleString()}` : ""}
                    items={matches}
                    onOpen={(id) => setRoute({ name: "listing", id })}
                    onGoResults={() => setStep("results")}
                  />
                </>
              )}

              {/* Step: MODEL */}
              {step === "model" && (
                <>
                  <div style={S.actions}>
                    <button
                      style={S.btnSecondary}
                      onClick={() => {
                        setStep("make");
                        setMake(null);
                        setModel(null);
                        setCategory(null);
                      }}
                    >
                      Back
                    </button>

                    <button
                      style={S.btnPrimary}
                      onClick={() => {
                        // Skip model selection
                        setModel(null);
                        setStep("category");
                      }}
                    >
                      Skip model
                    </button>
                  </div>

                  <Divider />

                  <Grid>
                    {filterList(models, q).map((m) => (
                      <Tile
                        key={m}
                        label={m}
                        meta="Tap to choose"
                        onClick={() => {
                          setModel(m);
                          setStep("category");
                        }}
                      />
                    ))}
                    <Tile
                      key="other-model"
                      label="Other / Unknown"
                      meta="If your model isn’t listed"
                      onClick={() => {
                        setModel("Other / Unknown");
                        setStep("category");
                      }}
                    />
                  </Grid>

                  <InstantMatches
                    show={q.trim().length > 0}
                    title={`Matches in ${labelEra(era!)} • ${make ?? "Any make"}${model ? ` • ${model}` : ""}`}
                    count={matches.length}
                    range={matches.length ? `£${stats.min.toLocaleString()}–£${stats.max.toLocaleString()}` : ""}
                    items={matches}
                    onOpen={(id) => setRoute({ name: "listing", id })}
                    onGoResults={() => setStep("results")}
                  />
                </>
              )}

              {/* Step: CATEGORY */}
              {step === "category" && (
                <>
                  <div style={S.actions}>
                    <button
                      style={S.btnSecondary}
                      onClick={() => {
                        setStep("model");
                        setCategory(null);
                      }}
                    >
                      Back
                    </button>

                    <button style={S.btnPrimary} onClick={() => setStep("results")}>
                      View results
                    </button>
                  </div>

                  <Divider />

                  <Grid>
                    {filterCats(CATEGORIES, q).map((c) => (
                      <Tile
                        key={c.label}
                        label={c.label}
                        meta={c.meta}
                        onClick={() => {
                          setCategory(c.label);
                          setStep("results");
                        }}
                      />
                    ))}
                  </Grid>

                  <InstantMatches
                    show={q.trim().length > 0}
                    title={`Matches in ${labelEra(era!)} • ${make ?? "Any make"}${category ? ` • ${category}` : ""}`}
                    count={matches.length}
                    range={matches.length ? `£${stats.min.toLocaleString()}–£${stats.max.toLocaleString()}` : ""}
                    items={matches}
                    onOpen={(id) => setRoute({ name: "listing", id })}
                    onGoResults={() => setStep("results")}
                  />
                </>
              )}

              {/* Step: RESULTS */}
              {step === "results" && (
                <>
                  <div style={S.actions}>
                    <button style={S.btnSecondary} onClick={() => setStep("category")}>
                      Back
                    </button>

                    <div style={S.pill}>
                      {matches.length} results{matches.length ? ` • £${stats.min.toLocaleString()}–£${stats.max.toLocaleString()}` : ""}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    {matches.length === 0 ? (
                      <div style={S.note}>
                        No matches. Try a different keyword (e.g. “speedo”, “rack”, “starter”), or clear filters.
                      </div>
                    ) : (
                      matches.map((l) => (
                        <ListingCard key={l.id} listing={l} onOpen={() => setRoute({ name: "listing", id: l.id })} />
                      ))
                    )}
                  </div>

                  <Divider />
                  <div style={S.note}>
                    Example: 1950–1970 → Jaguar → type “speedo” to see all Jaguar speedo listings (across models).
                  </div>
                </>
              )}

              <Divider />

              <div style={S.footerRow}>
                <button
                  style={S.btnGhost}
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    saveListings(seedListings());
                    setListings(seedListings());
                    resetBrowse();
                    setRoute({ name: "browse" });
                  }}
                >
                  Reset demo listings
                </button>

                <div style={S.smallMuted}>
                  Demo saves to your browser (localStorage). Deploying to Netlify makes it shareable.
                </div>
              </div>
            </div>
          </Card>
        )}

        {route.name === "sell" && (
          <SellPage
            onPosted={(id) => {
              refresh();
              setRoute({ name: "listing", id });
            }}
          />
        )}

        {route.name === "listing" && (
          <ListingPage
            listing={active}
            onBack={() => setRoute({ name: "browse" })}
            onGoSell={() => setRoute({ name: "sell" })}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Pages ---------- */
function SellPage({ onPosted }: { onPosted: (id: string) => void }) {
  const [era, setEra] = useState<EraId>("50_70");
  const [make, setMake] = useState<string>("Jaguar");
  const [model, setModel] = useState<string>("E-Type Series 1");
  const [category, setCategory] = useState<Category>("Electrical & Ignition");
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState<Condition>("Used");
  const [priceGBP, setPriceGBP] = useState<number>(250);
  const [location, setLocation] = useState("UK");
  const [postageAvailable, setPostageAvailable] = useState(true);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const makes = useMemo(() => Object.keys(MAKE_MODEL_BY_ERA[era] || {}).sort(), [era]);
  const models = useMemo(() => (MAKE_MODEL_BY_ERA[era]?.[make] || []).slice().sort(), [era, make]);

  useEffect(() => {
    const eraMakes = Object.keys(MAKE_MODEL_BY_ERA[era] || {});
    if (eraMakes.length && !eraMakes.includes(make) && make !== "Other / Unknown") setMake(eraMakes[0]);
  }, [era]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const arr = MAKE_MODEL_BY_ERA[era]?.[make] || [];
    if (arr.length && !arr.includes(model) && model !== "Other / Unknown") setModel(arr[0]);
  }, [era, make]); // eslint-disable-line react-hooks/exhaustive-deps

  const canPost = title.trim().length >= 4 && priceGBP > 0 && location.trim().length >= 2 && make && model;

  const onPickPhotos = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const max = 6;
    const take = Array.from(files).slice(0, max);

    const readAsDataURL = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(f);
      });

    const urls = await Promise.all(take.map(readAsDataURL));
    setPhotos((prev) => [...prev, ...urls].slice(0, max));
  };

  const post = () => {
    if (!canPost) return;

    const listing: Listing = {
      id: uid(),
      createdAt: Date.now(),
      era,
      make,
      model,
      category,
      title: title.trim(),
      description: description.trim() || undefined,
      condition,
      priceGBP: Number(priceGBP),
      location: location.trim(),
      postageAvailable,
      photos,
    };

    const current = loadListings();
    const next = [listing, ...current];
    saveListings(next);

    // reset minimal
    setTitle("");
    setDescription("");
    setPriceGBP(250);
    setCondition("Used");
    setPostageAvailable(true);
    setPhotos([]);

    onPosted(listing.id);
  };

  return (
    <Card>
      <div style={S.section}>
        <div style={S.headerRow}>
          <div>
            <div style={S.h1}>Sell a part</div>
            <div style={S.p}>Fast posting — stored locally for this demo.</div>
          </div>
        </div>

        <div style={S.form}>
          <Field label="Photos (up to 6)">
            <input type="file" accept="image/*" multiple onChange={(e) => onPickPhotos(e.target.files)} style={S.input} />
            {photos.length > 0 && (
              <div style={S.photoGrid}>
                {photos.map((p, idx) => (
                  <div key={idx} style={S.photoWrap}>
                    <img src={p} style={S.photo} alt={`Photo ${idx + 1}`} />
                    <button
                      onClick={() => setPhotos((arr) => arr.filter((_, i) => i !== idx))}
                      style={S.photoRemove}
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={S.smallMuted}>Tip: smaller photos keep the demo fast.</div>
          </Field>

          <Field label="Era">
            <select value={era} onChange={(e) => setEra(e.target.value as EraId)} style={S.input}>
              {ERAS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Make">
            <select value={make} onChange={(e) => setMake(e.target.value)} style={S.input}>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="Other / Unknown">Other / Unknown</option>
            </select>
          </Field>

          <Field label="Model">
            <select value={model} onChange={(e) => setModel(e.target.value)} style={S.input}>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="Other / Unknown">Other / Unknown</option>
            </select>
          </Field>

          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)} style={S.input}>
              {CATEGORIES.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Part title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Smiths speedo (mph)" style={S.input} />
          </Field>

          <Field label="Condition">
            <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)} style={S.input}>
              {(["Original", "Used", "Overhauled", "NOS", "Reproduction", "Unknown"] as Condition[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Price (GBP)">
            <input type="number" min={1} value={priceGBP} onChange={(e) => setPriceGBP(Number(e.target.value))} style={S.input} />
          </Field>

          <Field label="Location">
            <input value={location} onChange={(e) => setLocation(e.target.value)} style={S.input} />
          </Field>

          <Field label="Postage">
            <select value={postageAvailable ? "yes" : "no"} onChange={(e) => setPostageAvailable(e.target.value === "yes")} style={S.input}>
              <option value="yes">Postage available</option>
              <option value="no">Collection only</option>
            </select>
          </Field>

          <Field label="Description (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fitment notes, measurements, what’s included…"
              style={{ ...S.input, minHeight: 110, resize: "vertical" }}
            />
          </Field>

          <div style={S.actions}>
            <button style={S.btnSecondary} onClick={() => { setTitle(""); setDescription(""); }}>
              Clear text
            </button>
            <button style={{ ...S.btnPrimary, opacity: canPost ? 1 : 0.55 }} onClick={post} disabled={!canPost}>
              Post listing
            </button>
          </div>

          <div style={S.note}>
            This is a demo. Next step is accounts, messaging, payments, and moderation.
          </div>
        </div>
      </div>
    </Card>
  );
}

function ListingPage({
  listing,
  onBack,
  onGoSell,
}: {
  listing: Listing | null;
  onBack: () => void;
  onGoSell: () => void;
}) {
  if (!listing) {
    return (
      <Card>
        <div style={S.section}>
          <div style={S.headerRow}>
            <div>
              <div style={S.h1}>Listing not found</div>
              <div style={S.p}>It may have been removed.</div>
            </div>
            <button style={S.btnSecondary} onClick={onBack}>
              Back
            </button>
          </div>
        </div>
      </Card>
    );
  }

  const posted = new Date(listing.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card>
      <div style={S.section}>
        <div style={S.headerRow}>
          <div>
            <div style={S.h1}>{listing.title}</div>
            <div style={S.p}>
              {labelEra(listing.era)} • {listing.make} • {listing.model}
            </div>
          </div>

          <button style={S.btnSecondary} onClick={onBack}>
            Back
          </button>
        </div>

        <Divider />

        {listing.photos.length > 0 && (
          <div style={S.photoGrid}>
            {listing.photos.map((p, idx) => (
              <div key={idx} style={S.photoWrap}>
                <img src={p} style={S.photo} alt={`Listing photo ${idx + 1}`} />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <Badge>{listing.category}</Badge>
          <ConditionBadge condition={listing.condition} />
          <Badge>{listing.postageAvailable ? "Postage available" : "Collection only"}</Badge>
          <Badge>Posted {posted}</Badge>
        </div>

        <Divider />

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={S.p}>Price</div>
            <div style={{ fontWeight: 950, fontSize: 26, color: ACCENT, textShadow: `0 0 18px ${ACCENT_SOFT}` }}>
              £{listing.priceGBP.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={S.p}>Location</div>
            <div style={{ fontWeight: 850 }}>{listing.location}</div>
          </div>
        </div>

        {listing.description && (
          <>
            <Divider />
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Description</div>
            <div style={S.note}>{listing.description}</div>
          </>
        )}

        <Divider />

        <div style={S.actions}>
          <button style={S.btnPrimary} onClick={() => alert("Demo: messaging flow next.")}>
            Message seller
          </button>
          <button style={S.btnSecondary} onClick={() => alert("Demo: offer flow next.")}>
            Make offer
          </button>
          <button style={S.btnGhost} onClick={onGoSell}>
            Sell another part
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Components ---------- */
function TopBar({
  active,
  onBrowse,
  onSell,
}: {
  active: "browse" | "sell";
  onBrowse: () => void;
  onSell: () => void;
}) {
  return (
    <div style={S.topbar}>
      <div style={S.topbarInner}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SparesHubLockup />
          <div style={{ fontSize: 12, color: MUTED }}>Original • Used • Overhauled</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.navPill, ...(active === "browse" ? S.navPillActive : {}) }} onClick={onBrowse}>
            Browse
          </button>
          <button style={{ ...S.navPill, ...(active === "sell" ? S.navPillActive : {}) }} onClick={onSell}>
            Sell a part
          </button>
        </div>
      </div>

      <div style={S.topbarGlow} />
    </div>
  );
}

function SparesHubLockup() {
  // Locked style: mint gear + “Spares” mint, “Hub” white on navy
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={S.logoBadge}>
        <GearIcon />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 4, fontWeight: 950, letterSpacing: 0.2 }}>
        <span style={{ color: ACCENT }}>Spares</span>
        <span style={{ color: WHITE }}>Hub</span>
      </div>
    </div>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 32l7-4 6 5 7-2 5 7 7 1v10l-7 1-5 7-7-2-6 5-7-4-7 4-6-5-7 2-5-7-7-1V45l7-1 5-7 7 2 6-5 7 4z"
        fill={ACCENT}
      />
      <circle cx="50" cy="50" r="12" fill={NAVY_2} />
    </svg>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={S.card}>{children}</div>;
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={S.grid}>{children}</div>;
}

function Tile({ label, meta, onClick }: { label: string; meta: string; onClick: () => void }) {
  return (
    <button style={S.tile} onClick={onClick}>
      <div style={{ fontWeight: 950 }}>{label}</div>
      <div style={{ fontSize: 12, color: MUTED }}>{meta}</div>
    </button>
  );
}

function Divider() {
  return <div style={S.hr} />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, color: MUTED }}>{label}</div>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span style={S.badge}>{children}</span>;
}

function ConditionBadge({ condition }: { condition: Condition }) {
  const style =
    condition === "Overhauled"
      ? { borderColor: "rgba(60,255,180,.45)", background: "rgba(60,255,180,.10)" }
      : condition === "NOS"
      ? { borderColor: "rgba(255,90,165,.35)", background: "rgba(255,90,165,.08)" }
      : condition === "Original"
      ? { borderColor: "rgba(90,168,255,.30)", background: "rgba(90,168,255,.10)" }
      : undefined;

  return <span style={{ ...S.badge, ...(style || {}) }}>{condition}</span>;
}

function ListingCard({ listing, onOpen }: { listing: Listing; onOpen: () => void }) {
  return (
    <button style={S.listingCard} onClick={onOpen}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={S.thumb}>
          {listing.photos[0] ? (
            <img src={listing.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ fontWeight: 950, color: WHITE, opacity: 0.9 }}>
              {listing.make.slice(0, 1)}
              {listing.model.slice(0, 1)}
            </div>
          )}
        </div>

        <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
          <div style={{ fontWeight: 950 }}>{listing.title}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
            {labelEra(listing.era)} • {listing.make} • {listing.model}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <Badge>{listing.category}</Badge>
            <ConditionBadge condition={listing.condition} />
            <Badge>{listing.postageAvailable ? "Postage" : "Collection"}</Badge>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 950, color: ACCENT }}>£{listing.priceGBP.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>{listing.location}</div>
        </div>
      </div>
    </button>
  );
}

function Breadcrumbs({
  era,
  make,
  model,
  category,
  onClearEra,
  onClearMake,
  onClearModel,
  onClearCategory,
}: {
  era: EraId | null;
  make: string | null;
  model: string | null;
  category: Category | null;
  onClearEra: () => void;
  onClearMake: () => void;
  onClearModel: () => void;
  onClearCategory: () => void;
}) {
  const items: { k: string; v: string; onClear: () => void }[] = [];
  if (era) items.push({ k: "Era", v: labelEra(era), onClear: onClearEra });
  if (make) items.push({ k: "Make", v: make, onClear: onClearMake });
  if (model) items.push({ k: "Model", v: model, onClear: onClearModel });
  if (category) items.push({ k: "Category", v: category, onClear: onClearCategory });

  if (!items.length) return null;

  return (
    <div style={S.breadcrumbs}>
      {items.map((b) => (
        <button key={b.k} style={S.crumbBtn} onClick={b.onClear} title={`Clear ${b.k}`}>
          <span style={{ opacity: 0.8 }}>{b.k}:</span> <b style={{ color: WHITE }}>{b.v}</b>
          <span style={S.crumbX}>×</span>
        </button>
      ))}
    </div>
  );
}

function InstantMatches({
  show,
  title,
  count,
  range,
  items,
  onOpen,
  onGoResults,
}: {
  show: boolean;
  title: string;
  count: number;
  range: string;
  items: Listing[];
  onOpen: (id: string) => void;
  onGoResults: () => void;
}) {
  if (!show) return null;

  const preview = items.slice(0, 6);

  return (
    <div style={S.instantWrap}>
      <div style={S.instantTop}>
        <div>
          <div style={{ fontWeight: 950 }}>Instant matches</div>
          <div style={{ fontSize: 12, color: MUTED }}>
            {title} • {count} results{range ? ` • ${range}` : ""}
          </div>
        </div>
        <button style={S.btnSecondary} onClick={onGoResults}>
          Open results
        </button>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {preview.length === 0 ? (
          <div style={S.note}>No matches for that keyword in this context. Try a broader term.</div>
        ) : (
          preview.map((l) => <ListingCard key={l.id} listing={l} onOpen={() => onOpen(l.id)} />)
        )}
      </div>

      {count > preview.length && (
        <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>
          Showing {preview.length} of {count}. Tap “Open results” to see all.
        </div>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */
function labelEra(id: EraId) {
  return ERAS.find((e) => e.id === id)?.label ?? id;
}

function filterList(items: string[], q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return items;
  return items.filter((x) => x.toLowerCase().includes(s));
}

function filterCats(items: { label: Category; meta: string }[], q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return items;
  return items.filter((x) => x.label.toLowerCase().includes(s));
}

/* ---------- Styles (inline for “single file app”) ---------- */
const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: `radial-gradient(1200px 800px at 15% 0%, rgba(60,255,180,.10) 0%, ${NAVY} 55%)`,
    color: WHITE,
  },
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: `linear-gradient(to bottom, rgba(7,11,20,.92), rgba(7,11,20,.70))`,
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid ${BORDER}`,
  },
  topbarGlow: {
    height: 2,
    background: `linear-gradient(90deg, ${ACCENT}, rgba(60,255,180,.30), rgba(255,255,255,.12))`,
    opacity: 0.75,
  },
  topbarInner: {
    maxWidth: 1080,
    margin: "0 auto",
    padding: "14px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  container: {
    maxWidth: 1080,
    margin: "0 auto",
    padding: "18px 14px 30px",
  },
  card: {
    border: `1px solid ${BORDER}`,
    borderRadius: 24,
    background: `linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))`,
    boxShadow: "0 20px 60px rgba(0,0,0,.55)",
  },
  section: { padding: 16 },
  headerRow: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" },
  h1: { fontSize: 20, fontWeight: 950, marginBottom: 4 },
  p: { fontSize: 13, color: MUTED },

  navPill: {
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,.04)",
    color: WHITE,
    borderRadius: 999,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 850,
  },
  navPillActive: {
    borderColor: "rgba(60,255,180,.55)",
    background: "rgba(60,255,180,.10)",
    boxShadow: `0 0 18px rgba(60,255,180,.12)`,
  },

  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    background: NAVY_2,
    display: "grid",
    placeItems: "center",
    border: `1px solid ${BORDER}`,
  },

  breadcrumbs: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  crumbBtn: {
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,.04)",
    fontSize: 12,
    color: WHITE,
    cursor: "pointer",
  },
  crumbX: {
    marginLeft: 4,
    width: 18,
    height: 18,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,.35)",
    border: `1px solid ${BORDER}`,
    fontWeight: 900,
    opacity: 0.9,
  },

  searchRow: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
  searchInput: {
    flex: 1,
    minWidth: 260,
    border: `1px solid ${BORDER}`,
    background: `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.20))`,
    color: WHITE,
    borderRadius: 14,
    padding: "12px 14px",
    outline: "none",
    boxShadow: `inset 0 0 0 1px rgba(60,255,180,.08)`,
  },

  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 12 },

  tile: {
    textAlign: "left",
    padding: 14,
    borderRadius: 18,
    border: `1px solid ${BORDER}`,
    background: `linear-gradient(135deg, rgba(60,255,180,.10), rgba(255,255,255,.03))`,
    color: WHITE,
    minHeight: 86,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
  },

  actions: { display: "flex", gap: 10, alignItems: "center", marginTop: 12, flexWrap: "wrap" },
  hr: { height: 1, background: BORDER, margin: "12px 0" },

  btnPrimary: {
    flex: 1,
    background: `linear-gradient(135deg, ${ACCENT}, rgba(60,255,180,.70))`,
    color: "#04140D",
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 950,
    border: "none",
    boxShadow: `0 14px 40px rgba(60,255,180,.18)`,
  },
  btnSecondary: {
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,.05)",
    color: WHITE,
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 850,
  },
  btnGhost: {
    border: `1px solid rgba(60,255,180,.35)`,
    background: `linear-gradient(135deg, rgba(60,255,180,.08), rgba(255,255,255,.02))`,
    color: WHITE,
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 850,
  },

  badge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,.06)",
    border: `1px solid ${BORDER}`,
    opacity: 0.95,
  },

  pill: {
    marginLeft: "auto",
    fontSize: 12,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(60,255,180,.35)",
    background: "rgba(60,255,180,.08)",
    fontWeight: 900,
  },

  listingCard: {
    width: "100%",
    border: `1px solid ${BORDER}`,
    background: `linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02))`,
    borderRadius: 18,
    padding: 12,
    cursor: "pointer",
    color: WHITE,
    textAlign: "left",
  },

  thumb: {
    width: 86,
    height: 86,
    borderRadius: 16,
    border: `1px solid ${BORDER}`,
    background: `linear-gradient(135deg, rgba(60,255,180,.18), rgba(255,255,255,.03))`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  note: {
    opacity: 0.8,
    fontSize: 13,
    lineHeight: 1.45,
  },

  smallMuted: { fontSize: 12, color: MUTED },

  footerRow: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },

  form: { display: "grid", gap: 10, marginTop: 12 },
  input: {
    width: "100%",
    border: `1px solid ${BORDER}`,
    background: `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.20))`,
    color: WHITE,
    borderRadius: 14,
    padding: "12px 14px",
    outline: "none",
  },

  photoGrid: { marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 },
  photoWrap: {
    position: "relative",
    borderRadius: 16,
    border: `1px solid ${BORDER}`,
    overflow: "hidden",
    background: "rgba(255,255,255,.03)",
    aspectRatio: "1 / 1",
  },
  photo: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  photoRemove: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 999,
    border: `1px solid ${BORDER}`,
    background: "rgba(0,0,0,.55)",
    color: WHITE,
    cursor: "pointer",
    fontSize: 18,
    lineHeight: "26px",
  },

  instantWrap: {
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    border: "1px solid rgba(60,255,180,.28)",
    background: `linear-gradient(135deg, rgba(60,255,180,.08), rgba(255,255,255,.02))`,
  },
  instantTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
};
