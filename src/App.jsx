import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

const defaultCookSlots = ["Open", "Open", "Open"];
const tripStartDate = "2026-06-21";
const ADMIN_PIN = "2026";
const ENV = import.meta.env || {};
const SUPABASE_URL = ENV.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = ENV.VITE_SUPABASE_ANON_KEY || "";

function isLikelySupabaseUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" && url.hostname.includes("supabase.co");
  } catch {
    return false;
  }
}

function createSupabaseClientSafely(url, anonKey) {
  if (!url || !anonKey) return { client: null, configError: "" };
  if (!isLikelySupabaseUrl(url)) {
    return { client: null, configError: "The Supabase URL should look like https://your-project-ref.supabase.co" };
  }
  if (!String(anonKey).trim().startsWith("eyJ")) {
    return { client: null, configError: "The Supabase key should usually start with eyJ. Make sure you copied the anon/publishable key, not the secret key label." };
  }
  try {
    return { client: createClient(url.trim(), anonKey.trim()), configError: "" };
  } catch (error) {
    return { client: null, configError: error.message || "Could not create the Supabase client." };
  }
}

const supabaseConfig = createSupabaseClientSafely(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = supabaseConfig.client;
const sharedKeys = {
  events: "calendar_events",
  meals: "meals",
  links: "links",
  groupPacking: "group_packing",
};

const tripData = {
  houses: [
    {
      name: "The Big House",
      beds: 6,
      address: "10 Huckleberry Hill Rd, Edgartown, MA, 02539 United States of America",
      link: "https://www.vrbo.com/4372900ha",
      checkIn: "2pm",
      checkOut: "10am",
      amenities: ["Parking", "Outdoor Shower", "Kitchen"],
      image: "H1.jpg",
    },
    {
      name: "The Kid's Hangout",
      beds: 5,
      address: "167 Pennywise Path, Edgartown, MA, 02539 United States of America",
      link: "https://www.vrbo.com/4930799ha",
      checkIn: "4pm",
      checkOut: "10am",
      amenities: ["Pool", "Hot Tub", "Parking", "Outdoor Shower", "Kitchen"],
      image: "H2.jpg",
    },
  ],
  bedAssignments: [
    { house: "The Big House", bed: "2nd Floor Queen 1", names: "Andrew, Sara", week: "Full", image: "H1-Q1.jpg" },
    { house: "The Big House", bed: "2nd Floor Queen 2", names: "Luke, Maddie", week: "Full", image: "H1-Q2.jpg" },
    { house: "The Big House", bed: "2nd Floor Queen 3", names: "Anatol", week: "Half", image: "H1-Q3.jpg" },
    { house: "The Big House", bed: "2nd Floor Queen 4", names: "Skyler, Jack", week: "Full", image: "H1-Q4.jpg" },
    { house: "The Big House", bed: "2nd Floor King", names: "Will, Alicia", week: "Full", image: "H1-K1.jpg" },
    { house: "The Big House", bed: "1st Floor King/Bath", names: "Erita, Kyle", week: "Full", image: "H1-K2.jpg" },
    { house: "The Kid's Hangout", bed: "Double Bed", names: "Carl, Aye", week: "Full", image: "H2-Double.jpg" },
    { house: "The Kid's Hangout", bed: "Futon", names: "Empty", week: "N/A", image: "H2-Futon.jpg" },
    { house: "The Kid's Hangout", bed: "Twin Room", names: "Enti, Eric", week: "Half", image: "H2-Twin.jpg" },
    { house: "The Kid's Hangout", bed: "King", names: "Adrian, Martine, Valentina, Genevieve", week: "Full", image: "H2-King.jpg" },
  ],
  personalPacking: [
    "Socks",
    "Shoes",
    "Underwear",
    "T-Shirts",
    "Pants",
    "Shorts",
    "A sweater in case it gets cold",
    "Raincoat",
    "Hawaiian Shirt",
    "Flip Flops",
    "Swimsuit",
    "Sunnies",
    "Beach Reads",
    "DVD of The Iron Giant",
    "Suit/Dress",
    "Cell Phone",
    "Cell Phone Charger",
    "Cell Phone Charger Charger",
    "Headphones",
    "Deck of Cards (Personal)",
    "Earplugs",
    "Aloe Vera Gel",
    "Toothbrush",
    "Toothpaste",
    "Floss (min. 12 linear feet)",
    "Makeup",
    "Makeup Remover",
    "Makeup Reapplier",
    "Face Wash",
    "Medicines",
    "Floaties",
  ],
  groupPacking: [
    "Sunscreen",
    "Sun Tanning Lotion",
    "Bug Spray",
    "First Aid Kit",
    "Speaker",
    "Backup Speaker",
    "Alcohol",
    "Drugs",
    "Deck of Cards (Group)",
    "Nerf Ball",
  ],
  guests: [
    "Andrew",
    "Sara",
    "Carl",
    "Aye",
    "Will",
    "Alicia",
    "Skyler",
    "Jack D.",
    "Enti",
    "Eric",
    "Adrian",
    "Martine",
    "Valentina",
    "Genevieve",
    "Kyle",
    "Erita",
    "Luke",
    "Maddie",
    "Anatol",
    "Other",
  ],
  links: [
    { title: "Join the VRBO Trip", url: "https://t.vrbo.io/X0SBiGEcmVb" },
    { title: "Wedding Website", url: "https://www.zola.com/wedding/jessicasauberandaidanbarrett" },
    { title: "Points of Interest", url: "https://maps.app.goo.gl/8pfeJr2ZDPos4G829" },
    { title: "Ferry Website", url: "https://www.steamshipauthority.com/" },
  ],
  meals: [
    { day: "Sunday", time: "Lunch", meal: "On your own", cooks: [] },
    { day: "Sunday", time: "Dinner", meal: "Grill Night", cooks: [...defaultCookSlots] },
    { day: "Monday", time: "Breakfast", meal: "Eggs etc", cooks: [...defaultCookSlots] },
    { day: "Monday", time: "Lunch", meal: "Big Ol Salad", cooks: [...defaultCookSlots] },
    { day: "Monday", time: "Dinner", meal: "Taco/Fajitas", cooks: [...defaultCookSlots] },
    { day: "Tuesday", time: "Breakfast", meal: "Eggs etc", cooks: [...defaultCookSlots] },
    { day: "Tuesday", time: "Lunch", meal: "Sandwiches", cooks: [...defaultCookSlots] },
    { day: "Tuesday", time: "Dinner", meal: "Eat Out", cooks: [] },
    { day: "Wednesday", time: "Breakfast", meal: "Pancakes", cooks: [...defaultCookSlots] },
    { day: "Wednesday", time: "Lunch", meal: "Sandwiches", cooks: [...defaultCookSlots] },
    { day: "Wednesday", time: "Dinner", meal: "Seafood", cooks: [...defaultCookSlots] },
    { day: "Thursday", time: "Breakfast", meal: "Eggs etc", cooks: [...defaultCookSlots] },
    { day: "Thursday", time: "Lunch", meal: "Pasta", cooks: [...defaultCookSlots] },
    { day: "Thursday", time: "Dinner", meal: "Boat Dinner?", cooks: [...defaultCookSlots] },
    { day: "Friday", time: "Breakfast", meal: "Avo Toasts", cooks: [...defaultCookSlots] },
    { day: "Friday", time: "Lunch", meal: "Big Ol Salad II", cooks: [...defaultCookSlots] },
    { day: "Friday", time: "Dinner", meal: "Rehearsal Dinner", cooks: [] },
    { day: "Saturday", time: "Breakfast", meal: "Leftovers", cooks: [...defaultCookSlots] },
    { day: "Saturday", time: "Lunch", meal: "Leftovers", cooks: [...defaultCookSlots] },
    { day: "Saturday", time: "Dinner", meal: "Wedding", cooks: [] },
  ],
};

const navItems = [
  { id: "home", label: "Home", icon: "☀️" },
  { id: "houses", label: "Houses", icon: "🏠" },
  { id: "packing", label: "Packing", icon: "🧳" },
  { id: "meals", label: "Meals", icon: "🍽️" },
  { id: "calendar", label: "Calendar", icon: "🗓️" },
  { id: "links", label: "Links", icon: "🔗" },
];

const primaryNavItems = [
  { id: "home", label: "Home", icon: "☀️" },
  { id: "houses", label: "Houses", icon: "🏠" },
  { id: "meals", label: "Meals", icon: "🍽️" },
  { id: "more", label: "More", icon: "☰" },
];

const moreItems = navItems.filter((item) => !["home", "houses", "meals"].includes(item.id));
const noNotesMeals = new Set(["Eat Out", "On your own", "Rehearsal Dinner", "Wedding"]);
const linkCategories = ["Travel", "House", "Wedding", "Food", "Map", "Activity", "Other"];

function createMealState() {
  return tripData.meals.map((meal) => ({ ...meal, cooks: [...meal.cooks], notes: "", expanded: false }));
}

function inferLinkCategory(title) {
  const lower = title.toLowerCase();
  if (lower.includes("vrbo")) return "House";
  if (lower.includes("wedding")) return "Wedding";
  if (lower.includes("interest") || lower.includes("map")) return "Map";
  if (lower.includes("ferry")) return "Travel";
  return "Other";
}

const starterEvents = [
  {
    id: "arrival-window",
    day: "Sunday",
    time: "2:00 PM",
    title: "Arrival / house settling",
    location: "Both houses",
    notes: "Drop bags, claim beds, locate sunscreen, pretend we packed efficiently.",
    requiresSignup: false,
    signupLimit: "",
    attendees: [],
    editing: false,
  },
];

const starterLinks = tripData.links.map((link, index) => ({
  id: `starter-link-${index}`,
  category: inferLinkCategory(link.title),
  editing: false,
  ...link,
}));

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved) setValue(JSON.parse(saved));
    } catch {
      window.localStorage.removeItem(key);
    }
  }, [key]);

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function withTimeout(promise, label, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} timed out. Check the Supabase URL, key, table, and policies.`)), ms);
    }),
  ]);
}

async function fetchSharedValue(key, fallback) {
  if (!supabase) return fallback;
  const request = supabase
    .from("trip_app_state")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  const { data, error } = await withTimeout(request, `Loading ${key}`);
  if (error) throw error;

  if (!data) {
    await saveSharedValue(key, fallback);
    return fallback;
  }

  return data.value ?? fallback;
}

async function saveSharedValue(key, value) {
  if (!supabase) return;
  const request = supabase
    .from("trip_app_state")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  const { error } = await withTimeout(request, `Saving ${key}`);
  if (error) throw error;
}

function useSharedState(key, fallback) {
  const localKey = `mv2026-${key}`;
  const [value, setValue] = usePersistentState(localKey, fallback);
  const [status, setStatus] = useState(supabase ? "connecting" : "local");
  const [error, setError] = useState("");
  const loadedRef = useRef(false);
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    if (!supabase) return undefined;

    async function loadRemoteValue() {
      try {
        setStatus("connecting");
        const remoteValue = await fetchSharedValue(key, fallback);
        if (!isMounted) return;
        skipNextSaveRef.current = true;
        setValue(remoteValue);
        loadedRef.current = true;
        setStatus("synced");
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Could not load shared data.");
        setStatus("error");
      }
    }

    loadRemoteValue();

    const channel = supabase
      .channel(`trip_app_state:${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_app_state", filter: `key=eq.${key}` },
        (payload) => {
          if (payload.new?.value !== undefined) {
            skipNextSaveRef.current = true;
            setValue(payload.new.value);
            setStatus("synced");
          }
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [fallback, key, setValue]);

  useEffect(() => {
    if (!supabase) return;
    if (!loadedRef.current) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setStatus("saving");
        await saveSharedValue(key, value);
        setStatus("synced");
      } catch (err) {
        setError(err.message || "Could not save shared data.");
        setStatus("error");
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [key, value]);

  return [value, setValue, { status, error, isShared: Boolean(supabase) }];
}

function getTripDays() {
  const start = new Date(`${tripStartDate}T12:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const day = date.toLocaleDateString(undefined, { weekday: "long" });
    return {
      day,
      dateISO: date.toISOString().slice(0, 10),
      shortDate: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      label: `${day}, ${date.toLocaleDateString(undefined, { month: "long", day: "numeric" })}`,
    };
  });
}

const tripDays = getTripDays();

function getTodayTripDay() {
  const todayISO = new Date().toISOString().slice(0, 10);
  return tripDays.find((day) => day.dateISO === todayISO) || tripDays[0];
}

function parseTime(time) {
  if (!time) return 9999;
  const match = String(time).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return 9998;
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const suffix = match[3]?.toLowerCase();
  if (suffix === "pm" && hours < 12) hours += 12;
  if (suffix === "am" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function sortByTime(a, b) {
  return parseTime(a.time) - parseTime(b.time);
}

function normalizeUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getHost(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function linkIcon(title, category) {
  const lower = title.toLowerCase();
  if (category === "House" || lower.includes("vrbo")) return "🏠";
  if (category === "Wedding" || lower.includes("wedding")) return "💍";
  if (category === "Map" || lower.includes("interest") || lower.includes("map")) return "📍";
  if (category === "Travel" || lower.includes("ferry")) return "⛴️";
  if (category === "Food") return "🍽️";
  if (category === "Activity") return "🏖️";
  return "🔗";
}

function assetPath(fileName) {
  return `/assets/${fileName}`;
}

function runSelfTests() {
  console.assert(tripDays.length === 7, "Trip should render seven days");
  console.assert(parseTime("2:30 PM") === 870, "parseTime should handle PM times");
  console.assert(normalizeUrl("example.com") === "https://example.com", "normalizeUrl should add https");
  console.assert(inferLinkCategory("Wedding Website") === "Wedding", "Wedding links should be categorized");
  console.assert(sharedKeys.events === "calendar_events", "Shared state keys should be stable");
  console.assert(typeof withTimeout === "function", "withTimeout should exist for Supabase diagnostics");
  console.assert(tripData.guests.includes("Luke") && !tripData.guests.includes("Zach"), "Guest list should include Luke instead of Zach");
}

if (typeof window !== "undefined") runSelfTests();

function SyncBadge({ sync }) {
  if (!sync) return null;
  const labels = {
    local: "Local preview",
    connecting: "Connecting",
    saving: "Saving",
    synced: "Shared",
    error: "Sync issue",
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sync.status === "error" ? "bg-red-100/80 text-red-800" : sync.isShared ? "bg-sky-100/80 text-slate-700" : "bg-white/60 text-slate-600"}`}>
        {labels[sync.status] || sync.status}
      </span>
      {sync.error && <span className="text-xs text-red-700">{sync.error}</span>}
    </div>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={`rounded-[1.6rem] border border-white/50 bg-white/45 shadow-xl shadow-sky-900/5 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-white/60 bg-white/45 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur-md">
      {children}
    </span>
  );
}

function ConfirmButton({ children, message, onConfirm, className = "" }) {
  return (
    <button type="button" onClick={() => window.confirm(message) && onConfirm()} className={className}>
      {children}
    </button>
  );
}

function ImageWithFallback({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-sky-100 via-yellow-50 to-pink-100 text-sm text-slate-500 ${className}`}>
        {alt}
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

function GuestSelect({ selectedGuest, setSelectedGuest }) {
  return (
    <label className="block">
      <select
        value={selectedGuest}
        onChange={(event) => setSelectedGuest(event.target.value)}
        className="w-full rounded-full bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none"
      >
        <option value="">Choose guest</option>
        {tripData.guests.map((guest) => (
          <option key={guest} value={guest}>
            {guest}
          </option>
        ))}
      </select>
    </label>
  );
}

function NameSelect({ value, onChange, selectedGuest, placeholder = "Choose name" }) {
  return (
    <select
      value={value === "Open" ? "" : value}
      onChange={(event) => onChange(event.target.value || "Open")}
      className="w-full rounded-full bg-white/70 px-4 py-2.5 text-sm outline-none"
    >
      <option value="">{selectedGuest ? `Use ${selectedGuest}` : placeholder}</option>
      {selectedGuest && <option value={selectedGuest}>{selectedGuest}</option>}
      {tripData.guests.map((guest) => (
        <option key={guest} value={guest}>
          {guest}
        </option>
      ))}
    </select>
  );
}

function AdminToggle({ isAdmin, setIsAdmin }) {
  function toggle() {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    const pin = window.prompt("Admin PIN");
    if (pin === ADMIN_PIN) setIsAdmin(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        isAdmin ? "bg-slate-900 text-white" : "bg-white/45 text-slate-700 hover:bg-white/70"
      }`}
    >
      {isAdmin ? "Admin on" : "Admin"}
    </button>
  );
}

function Header({ activePage, setActivePage }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/45 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button type="button" onClick={() => setActivePage("home")} className="text-left">
          <div className="text-xs uppercase tracking-[0.28em] text-sky-700/80">MV 2026</div>
          <div className="text-xl font-semibold tracking-tight text-slate-800">Vacation HQ</div>
        </button>

        <nav className="hidden gap-2 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activePage === item.id
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/15"
                  : "bg-white/40 text-slate-700 hover:bg-white/70"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function MobileNav({ activePage, setActivePage, selectedGuest, setSelectedGuest, isAdmin, setIsAdmin }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-24 left-3 right-3 z-30 rounded-[1.6rem] border border-white/60 bg-white/75 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl md:hidden"
          >
            <div className="mb-3 rounded-[1.25rem] bg-white/55 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Who are you?</div>
              <GuestSelect selectedGuest={selectedGuest} setSelectedGuest={setSelectedGuest} />
            </div>

            <div className="mb-3 rounded-[1.25rem] bg-white/55 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin</div>
              <AdminToggle isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActivePage(item.id);
                    setMoreOpen(false);
                  }}
                  className="rounded-2xl bg-white/55 px-3 py-3 text-sm font-semibold text-slate-700"
                >
                  <div className="text-xl">{item.icon}</div>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-4 rounded-[1.7rem] border border-white/60 bg-white/65 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl md:hidden">
        {primaryNavItems.map((item) => {
          const isActive = item.id === "more" ? moreItems.some((more) => more.id === activePage) : activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => (item.id === "more" ? setMoreOpen((open) => !open) : setActivePage(item.id))}
              className={`rounded-2xl px-1 py-2 text-center text-[11px] ${isActive ? "bg-slate-900 text-white" : "text-slate-700"}`}
            >
              <div className="text-lg leading-none">{item.icon}</div>
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

function CookSlots({ cooks = [] }) {
  if (!cooks.length) return <div className="mt-2 text-xs text-slate-500">No cooking signup needed</div>;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {cooks.map((cook, index) => (
        <span
          key={`${cook}-${index}`}
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${cook === "Open" ? "bg-yellow-100/80 text-yellow-900" : "bg-sky-100/80 text-slate-800"}`}
        >
          {cook === "Open" ? `Cook ${index + 1}: Open` : cook}
        </span>
      ))}
    </div>
  );
}

function HomePage({ setActivePage, events }) {
  const today = getTodayTripDay();
  const todaysMeals = tripData.meals.filter((meal) => meal.day === today.day);
  const todaysEvents = [...events].filter((event) => event.day === today.day).sort(sortByTime);

  return (
    <div className="space-y-5">
      <GlassCard className="overflow-hidden">
        <div className="relative p-6 sm:p-8">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-yellow-200/50 blur-2xl" />
          <div className="absolute -bottom-12 left-16 h-40 w-40 rounded-full bg-sky-200/60 blur-2xl" />
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative">
            <Pill>Edgartown • beach week • June 2026</Pill>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-slate-900 sm:text-7xl">
              Martha’s Vineyard, organized.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
              Houses, beds, meals, packing lists, links, and the small amount of structure required to keep vacation feeling like vacation.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {navItems.slice(1).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  className="rounded-3xl bg-white/55 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white/80"
                >
                  <div className="text-2xl">{item.icon}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-800">{item.label}</div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Today’s Calendar</h2>
              <button
                type="button"
                onClick={() => setActivePage("calendar")}
                className="mt-1 text-sm font-medium text-sky-800 underline decoration-sky-800/30 underline-offset-4"
              >
                View full calendar
              </button>
            </div>
            <Pill>{today.shortDate}</Pill>
          </div>

          <div className="space-y-3">
            {todaysEvents.length ? (
              todaysEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setActivePage("calendar")}
                  className="w-full rounded-3xl bg-white/45 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-md hover:shadow-sky-900/5"
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{event.time || "Anytime"}</div>
                  <div className="text-lg font-semibold text-slate-800">{event.title}</div>
                  {event.location && <div className="mt-1 text-sm text-slate-600">{event.location}</div>}
                  {event.requiresSignup && (
                    <div className="mt-2 text-xs font-semibold text-yellow-900">
                      {event.attendees.length}{event.signupLimit ? `/${event.signupLimit}` : ""} signed up
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="rounded-3xl bg-white/45 p-4 text-sm text-slate-600">No events today. Dangerous levels of freedom.</div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Today’s Meals</h2>
              <button
                type="button"
                onClick={() => setActivePage("meals")}
                className="mt-1 text-sm font-medium text-sky-800 underline decoration-sky-800/30 underline-offset-4"
              >
                View full meal plan
              </button>
            </div>
            <Pill>{today.day}</Pill>
          </div>

          <div className="space-y-3">
            {todaysMeals.map((meal) => (
              <button
                key={`${meal.day}-${meal.time}`}
                type="button"
                onClick={() => setActivePage("meals")}
                className="flex w-full items-start justify-between gap-4 rounded-3xl bg-white/45 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-md hover:shadow-sky-900/5"
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{meal.time}</div>
                  <div className="text-lg font-semibold text-slate-800">{meal.meal}</div>
                  <CookSlots cooks={meal.cooks} />
                </div>
                <div className="text-2xl">{meal.time === "Breakfast" ? "🥞" : meal.time === "Lunch" ? "🥗" : "🔥"}</div>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Martha’s Vineyard Weather</h2>
            <p className="mt-1 text-sm text-slate-600">Live weather will plug in here during deployment.</p>
          </div>
          <div className="text-4xl">🌤️</div>
        </div>
        <div className="mt-5 rounded-[1.5rem] bg-gradient-to-br from-sky-100/80 to-yellow-100/70 p-5">
          <div className="text-5xl font-light text-slate-900">72°</div>
          <div className="mt-1 text-sm text-slate-600">Placeholder: breezy, beachy, suspiciously perfect</div>
        </div>
      </GlassCard>
    </div>
  );
}

function HousesPage() {
  const [openHouse, setOpenHouse] = useState(tripData.houses[0].name);

  return (
    <div className="space-y-5">
      <div>
        <Pill>sleeping arrangements</Pill>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">The Houses</h1>
      </div>

      {tripData.houses.map((house) => {
        const beds = tripData.bedAssignments.filter((bed) => bed.house === house.name);
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(house.address)}`;
        const isOpen = openHouse === house.name;

        return (
          <GlassCard key={house.name} className="overflow-hidden">
            <button type="button" className="block w-full text-left" onClick={() => setOpenHouse(isOpen ? "" : house.name)}>
              <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
                <ImageWithFallback src={assetPath(house.image)} alt={house.name} className="h-56 w-full md:h-full" />
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{house.name}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{house.address}</p>
                    </div>
                    <div className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-slate-700">{isOpen ? "−" : "+"}</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill>{house.beds} beds</Pill>
                    <Pill>Check in {house.checkIn}</Pill>
                    <Pill>Check out {house.checkOut}</Pill>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {house.amenities.map((amenity) => (
                      <Pill key={amenity}>{amenityIcon(amenity)} {amenity}</Pill>
                    ))}
                  </div>

                  <div className="mt-5 flex gap-3 text-sm">
                    <a onClick={(event) => event.stopPropagation()} href={mapLink} target="_blank" rel="noreferrer" className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">
                      Open in Maps
                    </a>
                    <a onClick={(event) => event.stopPropagation()} href={house.link} target="_blank" rel="noreferrer" className="rounded-full bg-white/70 px-4 py-2 font-semibold text-slate-800">
                      VRBO
                    </a>
                  </div>
                </div>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-3 border-t border-white/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    {beds.map((bed) => (
                      <div key={bed.bed} className="overflow-hidden rounded-[1.35rem] bg-white/50 shadow-sm">
                        <ImageWithFallback src={assetPath(bed.image)} alt={bed.bed} className="h-32 w-full" />
                        <div className="p-4">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{bed.week} week</div>
                          <div className="mt-1 font-semibold text-slate-900">{bed.bed}</div>
                          <div className={`mt-2 rounded-2xl px-3 py-2 text-sm ${bed.names === "Empty" ? "bg-yellow-100/80 text-yellow-900" : "bg-sky-100/70 text-slate-800"}`}>
                            {bed.names}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        );
      })}
    </div>
  );
}

function amenityIcon(amenity) {
  const icons = { Parking: "🚙", "Outdoor Shower": "🚿", Kitchen: "🍳", Pool: "🏊", "Hot Tub": "🫧" };
  return icons[amenity] || "✨";
}

function PackingPage({ selectedGuest, isAdmin, groupItems, setGroupItems, sync }) {
  const [activeTab, setActiveTab] = useState("personal");
  const [checkedPersonal, setCheckedPersonal] = useState({});
  const [newItem, setNewItem] = useState("");
  const [signupByItem, setSignupByItem] = useState({});

  function getClaimants(entry) {
    if (Array.isArray(entry.people)) return entry.people.filter(Boolean);
    if (entry.person?.trim()) return [entry.person.trim()];
    return [];
  }

  const packedCount = Object.values(checkedPersonal).filter(Boolean).length;
  const claimedCount = groupItems.filter((item) => getClaimants(item).length > 0).length;

  function addGroupItem(event) {
    event.preventDefault();
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setGroupItems((current) => [...current, { id: `${Date.now()}-${trimmed}`, item: trimmed, people: [] }]);
    setNewItem("");
  }

  function addGroupClaimant(index, person) {
    const name = person === "Open" && selectedGuest ? selectedGuest : person;
    const trimmed = String(name || "").trim();
    if (!trimmed || trimmed === "Open") return;

    setGroupItems((current) => current.map((entry, i) => {
      if (i !== index) return entry;
      const people = getClaimants(entry);
      if (people.includes(trimmed)) return { ...entry, people, person: undefined };
      return { ...entry, people: [...people, trimmed], person: undefined };
    }));
    setSignupByItem((current) => ({ ...current, [index]: "" }));
  }

  function removeGroupClaimant(index, person) {
    setGroupItems((current) => current.map((entry, i) => {
      if (i !== index) return entry;
      return { ...entry, people: getClaimants(entry).filter((claimant) => claimant !== person), person: undefined };
    }));
  }

  function deleteGroupItem(index) {
    setGroupItems((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-5">
      <div>
        <Pill>don’t forget the charger charger</Pill>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Packing Lists</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-700">Personal packing stays on your device. Group items sync across guests once Supabase is connected.</p>
        <div className="mt-3"><SyncBadge sync={sync} /></div>
      </div>

      <GlassCard className="p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`rounded-[1.35rem] px-4 py-3 text-sm font-semibold transition ${activeTab === "personal" ? "bg-slate-900 text-white" : "bg-white/45 text-slate-700 hover:bg-white/70"}`}
          >
            Personal <span className="ml-1 opacity-70">{packedCount}/{tripData.personalPacking.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("group")}
            className={`rounded-[1.35rem] px-4 py-3 text-sm font-semibold transition ${activeTab === "group" ? "bg-slate-900 text-white" : "bg-white/45 text-slate-700 hover:bg-white/70"}`}
          >
            Group <span className="ml-1 opacity-70">{claimedCount}/{groupItems.length}</span>
          </button>
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        {activeTab === "personal" ? (
          <motion.div key="personal-packing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <GlassCard className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Personal</h2>
                  <p className="mt-1 text-sm text-slate-600">Tap an item when it’s packed.</p>
                </div>
                <ConfirmButton message="Reset your personal packing checklist?" onConfirm={() => setCheckedPersonal({})} className="rounded-full bg-white/55 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/80">
                  Reset
                </ConfirmButton>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {tripData.personalPacking.map((item) => {
                  const checked = Boolean(checkedPersonal[item]);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCheckedPersonal((current) => ({ ...current, [item]: !current[item] }))}
                      className={`flex items-center gap-3 rounded-2xl p-3 text-left transition ${checked ? "bg-sky-100/75 text-slate-500" : "bg-white/45 text-slate-800 hover:bg-white/75"}`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${checked ? "border-sky-300 bg-white/70" : "border-white/80 bg-white/35"}`}>{checked ? "✓" : ""}</span>
                      <span className={checked ? "line-through decoration-slate-400" : ""}>{item}</span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div key="group-packing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <GlassCard className="p-4 sm:p-5">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Group</h2>
                <p className="mt-1 text-sm text-slate-600">Multiple people can sign up for the same group item. Admins can remove items.</p>
              </div>

              <form onSubmit={addGroupItem} className="mb-4 flex gap-2 rounded-[1.5rem] bg-white/40 p-2">
                <input value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="Add a group item" className="min-w-0 flex-1 rounded-full bg-white/70 px-4 py-3 text-sm outline-none placeholder:text-slate-400" />
                <button className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Add</button>
              </form>

              <div className="space-y-2">
                {groupItems.map((entry, index) => {
                  const people = getClaimants(entry);
                  return (
                    <div key={entry.id || `${entry.item}-${index}`} className="grid gap-3 rounded-[1.35rem] bg-white/45 p-3 sm:grid-cols-[1fr_220px_auto] sm:items-center">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 h-3 w-3 rounded-full ${people.length ? "bg-sky-400" : "bg-yellow-300"}`} />
                        <div>
                          <div className="font-semibold text-slate-850">{entry.item}</div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {people.length ? people.map((person) => {
                              const canRemove = isAdmin || person === selectedGuest;
                              return (
                                <button
                                  key={person}
                                  type="button"
                                  onClick={() => canRemove && removeGroupClaimant(index, person)}
                                  className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white"
                                >
                                  {person}{canRemove ? " ×" : ""}
                                </button>
                              );
                            }) : <span className="text-xs text-slate-500">Unclaimed</span>}
                          </div>
                        </div>
                      </div>

                      <NameSelect
                        value={signupByItem[index] || ""}
                        onChange={(person) => addGroupClaimant(index, person)}
                        selectedGuest={selectedGuest}
                        placeholder="Add name"
                      />

                      {isAdmin && (
                        <ConfirmButton message={`Delete ${entry.item}?`} onConfirm={() => deleteGroupItem(index)} className="rounded-full bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
                          Delete
                        </ConfirmButton>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MealsPage({ selectedGuest, meals, setMeals, isAdmin, sync }) {
  const mealsByDay = useMemo(() => {
    return meals.reduce((acc, meal) => {
      acc[meal.day] = acc[meal.day] || [];
      acc[meal.day].push(meal);
      return acc;
    }, {});
  }, [meals]);

  function updateCook(mealIndex, cookIndex, value) {
    setMeals((current) => current.map((meal, index) => {
      if (index !== mealIndex) return meal;
      return {
        ...meal,
        cooks: meal.cooks.map((cook, i) => (i === cookIndex ? value : cook)),
      };
    }));
  }

  function updateNotes(mealIndex, notes) {
    setMeals((current) => current.map((meal, index) => (index === mealIndex ? { ...meal, notes } : meal)));
  }

  function toggleNotes(mealIndex) {
    setMeals((current) => current.map((meal, index) => (index === mealIndex ? { ...meal, expanded: !meal.expanded } : meal)));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Pill>the week in meals</Pill>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Meals</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-700">Sign up to cook and add recipe notes. Guest dropdowns keep names tidy.</p>
          <div className="mt-3"><SyncBadge sync={sync} /></div>
        </div>
        {isAdmin && (
          <ConfirmButton message="Reset all meal signups and notes?" onConfirm={() => setMeals(createMealState())} className="w-fit rounded-full bg-white/55 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/80">
            Reset meals
          </ConfirmButton>
        )}
      </div>

      <div className="space-y-5">
        {tripDays.map(({ day, label }) => {
          const dayMeals = mealsByDay[day] || [];
          return (
            <GlassCard key={day} className="overflow-hidden">
              <div className="border-b border-white/50 bg-white/30 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{label}</h2>
                  <Pill>{dayMeals.length} meals</Pill>
                </div>
              </div>

              <div className="grid gap-3 p-4">
                {dayMeals.map((meal) => {
                  const mealIndex = meals.findIndex((item) => item.day === meal.day && item.time === meal.time && item.meal === meal.meal);
                  const canHaveNotes = !noNotesMeals.has(meal.meal);

                  return (
                    <div key={`${meal.day}-${meal.time}-${meal.meal}`} className="rounded-[1.45rem] bg-white/45 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{meal.time}</div>
                          <div className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{meal.meal}</div>
                        </div>
                        <div className="text-2xl">{meal.time === "Breakfast" ? "🥞" : meal.time === "Lunch" ? "🥗" : noNotesMeals.has(meal.meal) ? "✨" : "🍽️"}</div>
                      </div>

                      {meal.cooks.length ? (
                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          {meal.cooks.map((cook, cookIndex) => (
                            <label key={`${meal.day}-${meal.time}-${cookIndex}`} className="block">
                              <span className="mb-1 block text-xs font-medium text-slate-500">Cook {cookIndex + 1}</span>
                              <NameSelect
                                value={cook}
                                onChange={(value) => updateCook(mealIndex, cookIndex, value === "Open" && selectedGuest ? selectedGuest : value)}
                                selectedGuest={selectedGuest}
                                placeholder="Open"
                              />
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl bg-sky-100/55 px-3 py-2 text-sm text-slate-700">No cook signup needed.</div>
                      )}

                      {canHaveNotes && (
                        <div className="mt-4">
                          <button type="button" onClick={() => toggleNotes(mealIndex)} className="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/85">
                            {meal.expanded ? "Hide notes" : "Add recipe / notes"}
                          </button>
                          <AnimatePresence initial={false}>
                            {meal.expanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                                <textarea
                                  value={meal.notes}
                                  onChange={(event) => updateNotes(mealIndex, event.target.value)}
                                  placeholder="Recipe link, grocery notes, prep plans..."
                                  className="mt-3 min-h-28 w-full rounded-[1.25rem] bg-white/70 p-4 text-sm leading-6 outline-none placeholder:text-slate-400"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function LinkCard({ link, updateLink, deleteLink, isAdmin }) {
  if (link.editing) {
    return (
      <div className="rounded-[2rem] border border-white/50 bg-white/45 p-5 shadow-xl shadow-sky-900/5 backdrop-blur-xl">
        <div className="grid gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Title</span>
            <input value={link.title} onChange={(event) => updateLink(link.id, { title: event.target.value })} className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">URL</span>
            <input
              value={link.url}
              onChange={(event) => updateLink(link.id, { url: event.target.value })}
              onBlur={(event) => updateLink(link.id, { url: normalizeUrl(event.target.value) })}
              className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Category</span>
            <select value={link.category || "Other"} onChange={(event) => updateLink(link.id, { category: event.target.value })} className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none">
              {linkCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => updateLink(link.id, { url: normalizeUrl(link.url), editing: false })} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Done
          </button>
          {isAdmin && (
            <ConfirmButton message={`Delete ${link.title}?`} onConfirm={() => deleteLink(link.id)} className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
              Delete
            </ConfirmButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-[2rem] border border-white/50 bg-white/45 p-5 shadow-xl shadow-sky-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-2xl hover:shadow-sky-900/10">
      <div className="flex items-start justify-between gap-4">
        <a href={link.url} target="_blank" rel="noreferrer" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/60 text-2xl transition group-hover:scale-105" aria-label={`Open ${link.title}`}>
          {linkIcon(link.title, link.category)}
        </a>
        <div className="flex gap-2">
          <a href={link.url} target="_blank" rel="noreferrer" className="rounded-full bg-white/55 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white">Open ↗</a>
          <button type="button" onClick={() => updateLink(link.id, { editing: true })} className="rounded-full bg-white/55 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white">
            Edit
          </button>
        </div>
      </div>

      <a href={link.url} target="_blank" rel="noreferrer" className="block">
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{link.title}</h2>
          <span className="rounded-full bg-sky-100/70 px-2.5 py-1 text-xs font-semibold text-slate-600">{link.category || "Other"}</span>
        </div>
        <p className="mt-2 break-words text-sm text-slate-600">{getHost(link.url)}</p>
      </a>
    </div>
  );
}

function LinksPage({ links, setLinks, isAdmin, sync }) {
  const [linkForm, setLinkForm] = useState({ title: "", url: "", category: "Other" });

  function addLink(event) {
    event.preventDefault();
    const title = linkForm.title.trim();
    const url = normalizeUrl(linkForm.url);
    if (!title || !url) return;

    setLinks((current) => [
      ...current,
      {
        id: `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        title,
        url,
        category: linkForm.category,
        editing: false,
      },
    ]);
    setLinkForm({ title: "", url: "", category: "Other" });
  }

  function updateLink(linkId, updates) {
    setLinks((current) => current.map((link) => (link.id === linkId ? { ...link, ...updates } : link)));
  }

  function deleteLink(linkId) {
    setLinks((current) => current.filter((link) => link.id !== linkId));
  }

  return (
    <div className="space-y-5">
      <div>
        <Pill>important stuff</Pill>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Links</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-700">Add, edit, and organize useful links in one place.</p>
        <div className="mt-3"><SyncBadge sync={sync} /></div>
      </div>

      <GlassCard className="p-4 sm:p-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Add a Link</h2>
          <form onSubmit={addLink} className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_1.25fr_170px]">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Title</span>
                <input value={linkForm.title} onChange={(event) => setLinkForm((current) => ({ ...current, title: event.target.value }))} placeholder="Bike rentals" className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none placeholder:text-slate-400" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">URL</span>
                <input value={linkForm.url} onChange={(event) => setLinkForm((current) => ({ ...current, url: event.target.value }))} placeholder="example.com" className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none placeholder:text-slate-400" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Category</span>
                <select value={linkForm.category} onChange={(event) => setLinkForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none">
                  {linkCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
            </div>
            <button className="w-fit rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Add link</button>
          </form>
        </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} updateLink={updateLink} deleteLink={deleteLink} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}

function CalendarEventCard({ event, dayOptions, updateEvent, deleteEvent, addAttendee, removeAttendee, selectedGuest, isAdmin }) {
  const [signupName, setSignupName] = useState("");
  const limit = Number(event.signupLimit);
  const isFull = Boolean(limit && event.attendees.length >= limit);
  const signupValue = signupName || selectedGuest || "";

  function handleSignup(submitEvent) {
    submitEvent.preventDefault();
    addAttendee(event.id, signupValue);
    setSignupName("");
  }

  if (event.editing) {
    return (
      <div className="rounded-[1.45rem] bg-white/50 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[150px_130px_1fr]">
          <select value={event.day} onChange={(changeEvent) => updateEvent(event.id, { day: changeEvent.target.value })} className="rounded-full bg-white/75 px-4 py-2.5 text-sm outline-none">
            {dayOptions.map((day) => <option key={day}>{day}</option>)}
          </select>
          <input value={event.time} onChange={(changeEvent) => updateEvent(event.id, { time: changeEvent.target.value })} placeholder="Time" className="rounded-full bg-white/75 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400" />
          <input value={event.title} onChange={(changeEvent) => updateEvent(event.id, { title: changeEvent.target.value })} placeholder="Title" className="rounded-full bg-white/75 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400" />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px]">
          <input value={event.location} onChange={(changeEvent) => updateEvent(event.id, { location: changeEvent.target.value })} placeholder="Location" className="rounded-full bg-white/75 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400" />
          <input value={event.signupLimit} disabled={!event.requiresSignup} onChange={(changeEvent) => updateEvent(event.id, { signupLimit: changeEvent.target.value })} placeholder="Signup limit" className="rounded-full bg-white/75 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 disabled:opacity-40" />
        </div>

        <label className="mt-3 flex w-fit items-center gap-3 rounded-full bg-white/55 px-4 py-2.5 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={event.requiresSignup}
            onChange={(changeEvent) => updateEvent(event.id, {
              requiresSignup: changeEvent.target.checked,
              signupLimit: changeEvent.target.checked ? event.signupLimit : "",
              attendees: changeEvent.target.checked ? event.attendees : [],
            })}
            className="h-4 w-4 accent-slate-900"
          />
          This event needs signups
        </label>

        <textarea value={event.notes} onChange={(changeEvent) => updateEvent(event.id, { notes: changeEvent.target.value })} placeholder="Notes" className="mt-3 min-h-24 w-full rounded-[1.25rem] bg-white/75 p-4 text-sm leading-6 outline-none placeholder:text-slate-400" />

        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => updateEvent(event.id, { editing: false })} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Done</button>
          {isAdmin && <ConfirmButton message={`Delete ${event.title}?`} onConfirm={() => deleteEvent(event.id)} className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Delete</ConfirmButton>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.45rem] bg-white/45 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{event.time || "Anytime"}</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{event.title}</div>
          {event.location && <div className="mt-1 text-sm text-slate-600">{event.location}</div>}
        </div>
        <button type="button" onClick={() => updateEvent(event.id, { editing: true })} className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">
          Edit
        </button>
      </div>

      {event.notes && <p className="mt-3 rounded-2xl bg-white/45 p-3 text-sm leading-6 text-slate-700">{event.notes}</p>}

      {event.requiresSignup && (
        <div className="mt-4 rounded-[1.25rem] bg-yellow-100/45 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-800">Signups</div>
            <div className="text-xs text-slate-500">{event.attendees.length}{limit ? `/${limit}` : ""} signed up</div>
          </div>

          {event.attendees.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {event.attendees.map((attendee) => {
                const canRemove = isAdmin || attendee === selectedGuest;
                return (
                  <button key={attendee} type="button" onClick={() => canRemove && removeAttendee(event.id, attendee)} className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white">
                    {attendee}{canRemove ? " ×" : ""}
                  </button>
                );
              })}
            </div>
          )}

          <form onSubmit={handleSignup} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
            <NameSelect value={signupName} onChange={setSignupName} selectedGuest={selectedGuest} placeholder={isFull ? "Full" : "Choose name"} />
            <button disabled={isFull || !signupValue} className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Sign up</button>
          </form>
        </div>
      )}
    </div>
  );
}

function CalendarPage({ events, setEvents, selectedGuest, isAdmin, sync }) {
  const dayOptions = tripDays.map((day) => day.day);
  const [eventForm, setEventForm] = useState({
    day: tripDays[0].day,
    time: "",
    title: "",
    location: "",
    notes: "",
    requiresSignup: false,
    signupLimit: "",
  });

  const mealsByDay = useMemo(() => {
    return tripData.meals.reduce((acc, meal) => {
      acc[meal.day] = acc[meal.day] || [];
      acc[meal.day].push(meal);
      return acc;
    }, {});
  }, []);

  const eventsByDay = useMemo(() => {
    return events.reduce((acc, event) => {
      acc[event.day] = acc[event.day] || [];
      acc[event.day].push(event);
      acc[event.day].sort(sortByTime);
      return acc;
    }, {});
  }, [events]);

  function addEvent(event) {
    event.preventDefault();
    const title = eventForm.title.trim();
    if (!title) return;

    setEvents((current) => [
      ...current,
      {
        ...eventForm,
        id: `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        title,
        time: eventForm.time.trim(),
        location: eventForm.location.trim(),
        notes: eventForm.notes.trim(),
        attendees: [],
        editing: false,
      },
    ]);

    setEventForm({ day: tripDays[0].day, time: "", title: "", location: "", notes: "", requiresSignup: false, signupLimit: "" });
  }

  function updateEvent(eventId, updates) {
    setEvents((current) => current.map((event) => (event.id === eventId ? { ...event, ...updates } : event)));
  }

  function deleteEvent(eventId) {
    setEvents((current) => current.filter((event) => event.id !== eventId));
  }

  function addAttendee(eventId, name) {
    const trimmed = name.trim();
    if (!trimmed) return;

    setEvents((current) => current.map((event) => {
      if (event.id !== eventId || event.attendees.includes(trimmed)) return event;
      const limit = Number(event.signupLimit);
      if (limit && event.attendees.length >= limit) return event;
      return { ...event, attendees: [...event.attendees, trimmed] };
    }));
  }

  function removeAttendee(eventId, name) {
    setEvents((current) => current.map((event) => (event.id === eventId ? { ...event, attendees: event.attendees.filter((attendee) => attendee !== name) } : event)));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Pill>plans, loosely held</Pill>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Calendar</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-700">Add events, edit them later, and choose whether an event needs signups.</p>
          <div className="mt-3"><SyncBadge sync={sync} /></div>
        </div>
        {isAdmin && <ConfirmButton message="Reset the full calendar?" onConfirm={() => setEvents(starterEvents)} className="w-fit rounded-full bg-white/55 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/80">Reset calendar</ConfirmButton>}
      </div>

      <GlassCard className="p-4 sm:p-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Add an Event</h2>
          <form onSubmit={addEvent} className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[180px_140px_1fr]">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Day</span>
                <select value={eventForm.day} onChange={(event) => setEventForm((current) => ({ ...current, day: event.target.value }))} className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none">
                  {tripDays.map(({ day, label }) => <option key={day} value={day}>{label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Time</span>
                <input value={eventForm.time} onChange={(event) => setEventForm((current) => ({ ...current, time: event.target.value }))} placeholder="3:00 PM" className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none placeholder:text-slate-400" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Event</span>
                <input value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} placeholder="Beach, ferry run, grocery mission..." className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none placeholder:text-slate-400" />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <input value={eventForm.location} onChange={(event) => setEventForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none placeholder:text-slate-400" />
              <input value={eventForm.signupLimit} disabled={!eventForm.requiresSignup} onChange={(event) => setEventForm((current) => ({ ...current, signupLimit: event.target.value }))} placeholder="Signup limit" className="w-full rounded-full bg-white/70 px-4 py-3 text-sm outline-none placeholder:text-slate-400 disabled:opacity-40" />
            </div>

            <label className="flex w-fit items-center gap-3 rounded-full bg-white/45 px-4 py-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={eventForm.requiresSignup} onChange={(event) => setEventForm((current) => ({ ...current, requiresSignup: event.target.checked, signupLimit: event.target.checked ? current.signupLimit : "" }))} className="h-4 w-4 accent-slate-900" />
              This event needs signups
            </label>

            <textarea value={eventForm.notes} onChange={(event) => setEventForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes, links, reminders..." className="min-h-24 w-full rounded-[1.25rem] bg-white/70 p-4 text-sm leading-6 outline-none placeholder:text-slate-400" />
            <button className="w-fit rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Add event</button>
          </form>
        </GlassCard>

      <div className="space-y-5">
        {tripDays.map(({ day, label }) => {
          const dayMeals = mealsByDay[day] || [];
          const dayEvents = eventsByDay[day] || [];

          return (
            <GlassCard key={day} className="overflow-hidden">
              <div className="border-b border-white/50 bg-white/30 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{label}</h2>
                  <Pill>{dayEvents.length} events</Pill>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div className="rounded-[1.35rem] bg-sky-100/45 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Today’s Meals</div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {dayMeals.map((meal) => (
                      <div key={`${meal.day}-${meal.time}-${meal.meal}`} className="rounded-2xl bg-white/55 p-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{meal.time}</div>
                        <div className="mt-1 font-semibold text-slate-850">{meal.meal}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {dayEvents.length ? (
                  <div className="space-y-3">
                    {dayEvents.map((event) => (
                      <CalendarEventCard
                        key={event.id}
                        event={event}
                        dayOptions={dayOptions}
                        updateEvent={updateEvent}
                        deleteEvent={deleteEvent}
                        addAttendee={addAttendee}
                        removeAttendee={removeAttendee}
                        selectedGuest={selectedGuest}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] bg-white/40 p-4 text-sm text-slate-600">No events yet. A blank schedule: nature’s finest luxury.</div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function PwaInstallCard() {
  return (
    <GlassCard className="p-5">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Mobile app polish</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">This build is ready for PWA setup during deployment: app icon, splash color, add-to-home-screen manifest, and offline shell.</p>
    </GlassCard>
  );
}

function ProductionStatusCard() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Shared backend</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Shared saving is configured through deployment environment variables. Guests will never see the Supabase setup form.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${supabase ? "bg-sky-100/80 text-slate-700" : "bg-red-100/80 text-red-800"}`}>
          {supabase ? "Connected" : "Not configured"}
        </span>
      </div>
      {!supabase && (
        <p className="mt-3 rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-800">
          Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in StackBlitz or Vercel environment variables, then restart/redeploy.
        </p>
      )}
    </GlassCard>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [selectedGuest, setSelectedGuest] = usePersistentState("mv2026-selected-guest", "");
  const [isAdmin, setIsAdmin] = usePersistentState("mv2026-admin", false);
  const initialMeals = useMemo(() => createMealState(), []);
  const initialGroupPacking = useMemo(
    () => tripData.groupPacking.map((item) => ({ id: item, item, people: [] })),
    [],
  );

  const [events, setEvents, eventsSync] = useSharedState(sharedKeys.events, starterEvents);
  const [meals, setMeals, mealsSync] = useSharedState(sharedKeys.meals, initialMeals);
  const [links, setLinks, linksSync] = useSharedState(sharedKeys.links, starterLinks);
  const [groupItems, setGroupItems, groupPackingSync] = useSharedState(sharedKeys.groupPacking, initialGroupPacking);

  const page = useMemo(() => {
    if (activePage === "home") return <HomePage setActivePage={setActivePage} events={events} />;
    if (activePage === "houses") return <HousesPage />;
    if (activePage === "packing") {
      return <PackingPage selectedGuest={selectedGuest} isAdmin={isAdmin} groupItems={groupItems} setGroupItems={setGroupItems} sync={groupPackingSync} />;
    }
    if (activePage === "meals") return <MealsPage selectedGuest={selectedGuest} meals={meals} setMeals={setMeals} isAdmin={isAdmin} sync={mealsSync} />;
    if (activePage === "calendar") return <CalendarPage events={events} setEvents={setEvents} selectedGuest={selectedGuest} isAdmin={isAdmin} sync={eventsSync} />;
    if (activePage === "links") return <LinksPage links={links} setLinks={setLinks} isAdmin={isAdmin} sync={linksSync} />;
    return <HomePage setActivePage={setActivePage} events={events} />;
  }, [activePage, events, eventsSync, groupItems, groupPackingSync, isAdmin, links, linksSync, meals, mealsSync, selectedGuest, setEvents, setGroupItems, setLinks, setMeals]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(252,211,77,0.32),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(125,211,252,0.38),_transparent_34%),linear-gradient(135deg,_#f8fbff_0%,_#fff8e8_45%,_#eaf8ff_100%)] pb-28 font-sans text-slate-800 md:pb-10">
      <div className="pointer-events-none fixed inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.75)_1px,transparent_1px)] [background-size:44px_44px]" />
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div key={activePage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
            {page}
          </motion.div>
        </AnimatePresence>
        {activePage === "home" && (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <PwaInstallCard />
            {isAdmin && <ProductionStatusCard />}
          </div>
        )}
      </main>
      <MobileNav
        activePage={activePage}
        setActivePage={setActivePage}
        selectedGuest={selectedGuest}
        setSelectedGuest={setSelectedGuest}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />
    </div>
  );
}
