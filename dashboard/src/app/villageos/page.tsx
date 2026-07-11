'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Settings as SettingsIcon, Award, Layers, Target, Compass, HardHat, TrendingUp, 
  Sparkles, CheckCircle2, ChevronRight, RefreshCw, Upload, Eye, Database, Swords, Map, 
  History, MessageSquareCode, Plus, Trash2, ArrowRightLeft, BookOpen, User, Flame, Minus,
  Package, Trophy
} from 'lucide-react';

interface QueueItem {
  id: number;
  building: string;
  level: number;
  wood: number;
  clay: number;
  iron: number;
  crop: number;
  time: number;
  status: "NOW" | "NEXT" | "FUTURE";
}

interface BuildingItem {
  id: number;
  category: "resource" | "urban";
  slot: number;
  name: string;
  current: number;
  target: number;
  priority: number;
}

interface Village {
  id: number;
  name: string;
  coords: string;
  isCapital: boolean;
  population: number;
  resources: {
    wood: number;
    clay: number;
    iron: number;
    crop: number;
    woodProd: number;
    clayProd: number;
    ironProd: number;
    cropProd: number;
  };
  buildings: BuildingItem[];
  plannerQueue: QueueItem[];
}

interface OasisItem {
  id: number;
  coords: string;
  type: "Crop +25%" | "Crop +50%" | "Wood +25%" | "Clay +25%" | "Iron +25%" | "Wood +25%, Crop +25%" | "Clay +25%, Crop +25%" | "Iron +25%, Crop +25%";
  conquered: boolean;
  owner: string;
}

interface BattleReport {
  id: number;
  attacker: string;
  defender: string;
  coords: string;
  date: string;
  attackerLosses: string;
  defenderLosses: string;
  loot: string;
  outcome: "WON" | "LOST" | "BOUNTY";
}

interface PotentialSettlement {
  id: number;
  coords: string;
  type: "15-Cropper (15c)" | "9-Cropper (9c)" | "Standard (4-4-4-6)" | "Clay Pit Heavy (3-5-4-6)";
  status: "Unoccupied" | "Occupied" | "Claimed";
}

const getCapForLevel = (lvl: number) => {
  const caps = [
    800, 1200, 1700, 2300, 3100, 4000, 5000, 6300, 7800, 9600, 
    11700, 14200, 17200, 20700, 24800, 29700, 35500, 42300, 50500, 60100, 
    80000
  ];
  return caps[Math.min(Math.max(0, lvl), 20)];
};

// Euclidean distance calculation helper
const calculateDistance = (coordStr1: string, coordStr2: string) => {
  try {
    const parse = (str: string) => {
      const match = str.match(/\((-?\d+)\s*[|]\s*(-?\d+)\)/);
      if (match) {
        return { x: parseInt(match[1]), y: parseInt(match[2]) };
      }
      return null;
    };
    const c1 = parse(coordStr1);
    const c2 = parse(coordStr2);
    if (c1 && c2) {
      const dx = c2.x - c1.x;
      const dy = c2.y - c1.y;
      return Math.sqrt(dx * dx + dy * dy).toFixed(1);
    }
  } catch (e) {
    // Return blank if parse failure
  }
  return "N/A";
};

// Precise positions mapping the exact coordinate layout from Travian Legends Resource Circle
const resourceSlotPositions = [
  { slot: 1, x: 42, y: 12, type: "wood", name: "Woodcutter" },
  { slot: 2, x: 60, y: 12, type: "crop", name: "Cropland" },
  { slot: 3, x: 74, y: 15, type: "wood", name: "Woodcutter" },
  { slot: 4, x: 29, y: 22, type: "iron", name: "Iron Mine" },
  { slot: 5, x: 53, y: 24, type: "clay", name: "Clay Pit" },
  { slot: 6, x: 66, y: 27, type: "clay", name: "Clay Pit" },
  { slot: 7, x: 82, y: 28, type: "iron", name: "Iron Mine" },
  { slot: 8, x: 17, y: 38, type: "crop", name: "Cropland" },
  { slot: 9, x: 34, y: 38, type: "crop", name: "Cropland" },
  { slot: 10, x: 73, y: 38, type: "iron", name: "Iron Mine" },
  { slot: 11, x: 91, y: 38, type: "iron", name: "Iron Mine" },
  { slot: 12, x: 18, y: 48, type: "crop", name: "Cropland" },
  { slot: 13, x: 34, y: 48, type: "crop", name: "Cropland" },
  { slot: 14, x: 87, y: 53, type: "wood", name: "Woodcutter" },
  { slot: 15, x: 32, y: 73, type: "crop", name: "Cropland" },
  { slot: 16, x: 62, y: 73, type: "clay", name: "Clay Pit" },
  { slot: 17, x: 77, y: 73, type: "wood", name: "Woodcutter" },
  { slot: 18, x: 51, y: 83, type: "clay", name: "Clay Pit" }
];

// Precise positions mapping the exact layout from Travian Legends Village Center
const urbanSlotPositions = [
  { slot: 19, x: 33, y: 36, name: "Main Building" },
  { slot: 20, x: 38, y: 18, name: "Warehouse" },
  { slot: 21, x: 54, y: 13, name: "Granary" },
  { slot: 22, x: 78, y: 28, name: "Barracks" },
  { slot: 23, x: 27, y: 25, name: "Academy" },
  { slot: 24, x: 15, y: 38, name: "Marketplace" },
  { slot: 25, x: 64, y: 64, name: "Embassy" },
  { slot: 26, x: 74, y: 45, name: "Rally Point" },
  { slot: 27, x: 18, y: 56, name: "Empty Slot" },
  { slot: 28, x: 32, y: 57, name: "Empty Slot" },
  { slot: 29, x: 47, y: 68, name: "Empty Slot" },
  { slot: 30, x: 62, y: 78, name: "Empty Slot" },
  { slot: 31, x: 78, y: 72, name: "Empty Slot" },
  { slot: 32, x: 87, y: 56, name: "Empty Slot" },
  { slot: 33, x: 61, y: 30, name: "Empty Slot" },
  { slot: 34, x: 70, y: 20, name: "Empty Slot" },
  { slot: 35, x: 48, y: 42, name: "Empty Slot" },
  { slot: 36, x: 50, y: 56, name: "Empty Slot" },
  { slot: 37, x: 22, y: 76, name: "Empty Slot" },
  { slot: 38, x: 38, y: 78, name: "Empty Slot" },
  { slot: 39, x: 92, y: 40, name: "Rally Point" },
  { slot: 40, x: 10, y: 88, name: "City Wall" }
];

// Separate custom SVGs matching every Travian: Legends asset type
const BuildingIcon = ({ name }: { name: string }) => {
  if (name.startsWith("Woodcutter")) {
    return (
      <svg className="w-5 h-5 text-emerald-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M8 11h8" />
      </svg>
    );
  }
  if (name.startsWith("Clay Pit")) {
    return (
      <svg className="w-5 h-5 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
      </svg>
    );
  }
  if (name.startsWith("Iron Mine")) {
    return (
      <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M21 16H3" />
      </svg>
    );
  }
  if (name.startsWith("Cropland")) {
    return (
      <svg className="w-5 h-5 text-yellow-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5" />
      </svg>
    );
  }
  if (name === "Warehouse") {
    return (
      <svg className="w-5 h-5 text-sky-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 20H4V4h16v16zM4 9h16" />
      </svg>
    );
  }
  if (name === "Granary") {
    return (
      <svg className="w-5 h-5 text-yellow-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    );
  }
  if (name === "Main Building") {
    return (
      <svg className="w-5 h-5 text-orange-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2Z" />
        <path d="M9 22V12h6v10" />
      </svg>
    );
  }
  if (name === "Barracks") {
    return (
      <svg className="w-5 h-5 text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 17.5L3 6M10 21L3 14" />
      </svg>
    );
  }
  if (name === "Stable") {
    return (
      <svg className="w-5 h-5 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    );
  }
  if (name === "Workshop") {
    return (
      <svg className="w-5 h-5 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 00-2-2h-5L9 3H4a2 2 0 00-2 2v11" />
      </svg>
    );
  }
  if (name === "Academy") {
    return (
      <svg className="w-5 h-5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
      </svg>
    );
  }
  if (name === "Marketplace") {
    return (
      <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 3L21 7L17 11M3 17L7 21L3 17" />
        <path d="M21 7H3M3 17h18" />
      </svg>
    );
  }
  if (name === "Embassy") {
    return (
      <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    );
  }
  if (name === "Rally Point") {
    return (
      <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M12 22V12" />
      </svg>
    );
  }
  if (name === "Cranny") {
    return (
      <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (name === "Town Hall") {
    return (
      <svg className="w-5 h-5 text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 21H2V3h20v18z" />
      </svg>
    );
  }
  if (name === "Treasury") {
    return (
      <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M6 12h12" />
      </svg>
    );
  }
  if (name === "Sawmill") {
    return (
      <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M8 11h8M12 7v8" />
      </svg>
    );
  }
  if (name === "Brickworks") {
    return (
      <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    );
  }
  if (name === "Iron Foundry") {
    return (
      <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    );
  }
  if (name === "Grain Mill") {
    return (
      <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="12" rx="4" ry="4" />
        <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
      </svg>
    );
  }
  if (name === "Bakery") {
    return (
      <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6" />
      </svg>
    );
  }
  if (name === "City Wall") {
    return (
      <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M3 18h18M5 18V9l3-3 3 3v9M13 18V9l3-3 3 3v9" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
};

// ─── UNIT DATA ────────────────────────────────────────────────────────────────
const UNIT_ROSTER: Record<string, { name: string; speed: number; carry: number; tribe: string }[]> = {
  Gauls: [
    { name: "Haeduan",    speed: 10, carry: 65,  tribe: "Gauls" },
    { name: "Phalanx",   speed: 7,  carry: 35,  tribe: "Gauls" },
    { name: "Druidrider", speed: 16, carry: 45,  tribe: "Gauls" },
  ],
  Romans: [
    { name: "Equites Imperatoris", speed: 14, carry: 100, tribe: "Romans" },
    { name: "Imperian",            speed: 7,  carry: 50,  tribe: "Romans" },
    { name: "Equites Legati",      speed: 16, carry: 0,   tribe: "Romans" },
  ],
  Teutons: [
    { name: "Paladin",    speed: 10, carry: 110, tribe: "Teutons" },
    { name: "Axeman",    speed: 7,  carry: 60,  tribe: "Teutons" },
    { name: "Pathfinder", speed: 17, carry: 0,   tribe: "Teutons" },
  ],
  Huns: [
    { name: "Marksman",   speed: 9,  carry: 40,  tribe: "Huns" },
    { name: "Steppe Rider", speed: 14, carry: 65, tribe: "Huns" },
    { name: "Slave Militia", speed: 7, carry: 20, tribe: "Huns" },
  ],
  Egyptians: [
    { name: "Khopesh Warrior", speed: 7, carry: 45, tribe: "Egyptians" },
    { name: "Reshef Chariot",  speed: 12, carry: 75, tribe: "Egyptians" },
  ],
  Spartans: [
    { name: "Elpida Rider",  speed: 11, carry: 70, tribe: "Spartans" },
    { name: "Hoplite",       speed: 7,  carry: 35, tribe: "Spartans" },
  ],
};

interface RaidTarget {
  id: number;
  coords: string;
  player: string;
  population: number;
  lastLoot: number; // resources last observed in bounty
}

function parseCoords(str: string): { x: number; y: number } | null {
  const m = str.match(/\((-?\d+)\s*[|]\s*(-?\d+)\)/);
  if (!m) return null;
  return { x: parseInt(m[1]), y: parseInt(m[2]) };
}

function euclidean(a: string, b: string): number {
  const c1 = parseCoords(a);
  const c2 = parseCoords(b);
  if (!c1 || !c2) return 0;
  return Math.sqrt((c2.x - c1.x) ** 2 + (c2.y - c1.y) ** 2);
}

function RaidPlannerPanel({
  activeVillageCoords,
  serverSpeed,
  tribe,
}: {
  activeVillageCoords: string;
  serverSpeed: number;
  tribe: string;
}) {
  const roster = UNIT_ROSTER[tribe] || UNIT_ROSTER["Gauls"];
  const defaultUnit = roster.find(u => u.carry > 0) || roster[0];

  const [targets, setTargets] = useState<RaidTarget[]>([
    { id: 1, coords: "(65|-30)", player: "Inactive01", population: 42, lastLoot: 340 },
    { id: 2, coords: "(60|-31)", player: "InactiveX",  population: 78, lastLoot: 650 },
    { id: 3, coords: "(64|-26)", player: "Abandoned",  population: 25, lastLoot: 180 },
  ]);
  const [selectedUnit, setSelectedUnit] = useState(defaultUnit.name);
  const [newCoords, setNewCoords] = useState("");
  const [newPlayer, setNewPlayer] = useState("");
  const [newPop, setNewPop]   = useState(50);
  const [newLoot, setNewLoot] = useState(300);

  const unit = roster.find(u => u.name === selectedUnit) || defaultUnit;

  const calcRow = (t: RaidTarget) => {
    const dist  = euclidean(activeVillageCoords, t.coords);
    const travelHrs = dist / (unit.speed * serverSpeed);  // hours one-way
    const travelMins = Math.round(travelHrs * 60);
    const intervalMins = travelMins * 2;

    // Loot estimate: use last known if >0, otherwise estimate from pop
    const estLoot = t.lastLoot > 0 ? t.lastLoot : Math.round(t.population * 35);
    const unitsNeeded = unit.carry > 0 ? Math.ceil(estLoot / unit.carry) : 0;
    const lootPerHour = intervalMins > 0 ? Math.round((estLoot / intervalMins) * 60) : 0;

    return { dist: dist.toFixed(1), travelMins, intervalMins, estLoot, unitsNeeded, lootPerHour };
  };

  const addTarget = () => {
    if (!newCoords.match(/\(-?\d+\s*[|]\s*-?\d+\)/)) return;
    setTargets(prev => [...prev, {
      id: prev.length + 1,
      coords: newCoords,
      player: newPlayer || "Unknown",
      population: newPop,
      lastLoot: newLoot,
    }]);
    setNewCoords(""); setNewPlayer(""); setNewPop(50); setNewLoot(300);
  };

  const totalLootPerHour = targets.reduce((acc, t) => {
    const { lootPerHour } = calcRow(t);
    return acc + lootPerHour;
  }, 0);

  return (
    <div className="bg-slate-900 border border-amber-500/20 p-6 rounded-xl flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-3">
        <div>
          <h3 className="text-xs uppercase font-bold tracking-widest text-amber-400 flex items-center gap-2">
            <Swords className="w-4 h-4" /> Raid Planner
          </h3>
          <p className="text-[9px] text-slate-400 mt-0.5">
            {tribe} · {unit.name} (Speed {unit.speed * serverSpeed} fields/hr · Carry {unit.carry})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Unit:</span>
          <select
            value={selectedUnit}
            onChange={e => setSelectedUnit(e.target.value)}
            className="bg-[#0F172A] border border-slate-700 text-slate-100 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500"
          >
            {roster.map(u => (
              <option key={u.name} value={u.name}>{u.name} (carry {u.carry})</option>
            ))}
          </select>
          <span className="text-[10px] text-amber-400 font-bold">
            Total: ~{totalLootPerHour.toLocaleString()} res/hr
          </span>
        </div>
      </div>

      {/* Target Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
              <th className="py-2.5 pr-3">Coords</th>
              <th className="pr-3">Player</th>
              <th className="pr-3">Pop</th>
              <th className="pr-3">Dist</th>
              <th className="pr-3">Travel</th>
              <th className="pr-3">Interval</th>
              <th className="pr-3">Est. Loot</th>
              <th className="pr-3">Units Needed</th>
              <th className="pr-3">Loot/hr</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {targets.map(t => {
              const { dist, travelMins, intervalMins, estLoot, unitsNeeded, lootPerHour } = calcRow(t);
              const efficiency = estLoot > 0 ? Math.round((lootPerHour / (unitsNeeded || 1)) * 10) / 10 : 0;
              return (
                <tr key={t.id} className="border-b border-slate-800/40 hover:bg-amber-500/5">
                  <td className="py-2 font-mono text-cyan-400 font-semibold pr-3">{t.coords}</td>
                  <td className="text-slate-300 pr-3">{t.player}</td>
                  <td className="text-slate-400 pr-3">{t.population}</td>
                  <td className="font-mono text-yellow-400 font-bold pr-3">{dist}t</td>
                  <td className="font-mono text-slate-300 pr-3">
                    {travelMins >= 60
                      ? `${Math.floor(travelMins / 60)}h${travelMins % 60 ? `${travelMins % 60}m` : ""}`
                      : `${travelMins}m`}
                  </td>
                  <td className="font-mono text-slate-300 pr-3">
                    {intervalMins >= 60
                      ? `${Math.floor(intervalMins / 60)}h${intervalMins % 60 ? `${intervalMins % 60}m` : ""}`
                      : `${intervalMins}m`}
                  </td>
                  <td className="font-mono text-amber-300 font-bold pr-3">{estLoot.toLocaleString()}</td>
                  <td className="pr-3">
                    <span className="bg-slate-800 text-white px-2 py-0.5 rounded font-bold">{unitsNeeded}×</span>
                  </td>
                  <td className="pr-3">
                    <span className={`font-bold ${lootPerHour > 500 ? 'text-emerald-400' : lootPerHour > 200 ? 'text-yellow-400' : 'text-rose-400'}`}>
                      {lootPerHour.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-500 ml-1">res/hr</span>
                  </td>
                  <td>
                    <button
                      onClick={() => setTargets(prev => prev.filter(x => x.id !== t.id))}
                      className="text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Target Row */}
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex flex-wrap gap-2 items-end">
        <span className="text-[10px] text-slate-400 font-bold w-full">Add Raid Target</span>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-slate-500">Coords</span>
          <input
            value={newCoords} onChange={e => setNewCoords(e.target.value)}
            placeholder="(65|-30)"
            className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-2 py-1.5 w-28 font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-slate-500">Player</span>
          <input
            value={newPlayer} onChange={e => setNewPlayer(e.target.value)}
            placeholder="Player"
            className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-2 py-1.5 w-24 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-slate-500">Pop</span>
          <input
            type="number" value={newPop} onChange={e => setNewPop(parseInt(e.target.value) || 0)}
            className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-2 py-1.5 w-16 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-slate-500">Last Loot</span>
          <input
            type="number" value={newLoot} onChange={e => setNewLoot(parseInt(e.target.value) || 0)}
            className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-2 py-1.5 w-20 focus:outline-none focus:border-amber-500"
          />
        </div>
        <button
          onClick={addTarget}
          className="bg-amber-500 hover:bg-amber-400 text-[#0F172A] text-xs font-black px-4 py-2 rounded-lg flex items-center gap-1 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Add Target
        </button>
      </div>
    </div>
  );
}

export default function VillageOSDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [infraMapType, setInfraMapType] = useState<'resource' | 'urban'>('resource');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [parsing, setParsing] = useState(false);
  const [rawPasteInput, setRawPasteInput] = useState("");
  const [imageAnalysing, setImageAnalysing] = useState(false);
  
  // 4 Dedicated Screenshot Slots state (File + URL preview)
  const [slotImages, setSlotImages] = useState<{
    dorf1: { file: File | null; preview: string | null };
    dorf2: { file: File | null; preview: string | null };
    heroAttrs: { file: File | null; preview: string | null };
    heroInv: { file: File | null; preview: string | null };
  }>({
    dorf1: { file: null, preview: null },
    dorf2: { file: null, preview: null },
    heroAttrs: { file: null, preview: null },
    heroInv: { file: null, preview: null }
  });


  // Multi-Village State
  const [villages, setVillages] = useState<Village[]>([]);
  const [activeVillageId, setActiveVillageId] = useState(1);

  // Account Currencies
  const [gold, setGold] = useState(130);
  const [silver, setSilver] = useState(2187);
  const [lastSyncTime, setLastSyncTime] = useState("11:24:18");
  const [freeCrop, setFreeCrop] = useState(89);
  const [inboxNotification, setInboxNotification] = useState("Your Plus Account expires in 9:16:14. beginner's protection: 57:16:14");
  const [alliance, setAlliance] = useState("No alliance");

  // Hero Manual Editing Settings override
  const [manualHeroOverride, setManualHeroOverride] = useState(false);

  // Oasis Data List
  const [oases, setOases] = useState<OasisItem[]>([
    { id: 1, coords: "(64|-31)", type: "Crop +25%", conquered: false, owner: "Unoccupied" },
    { id: 2, coords: "(61|-28)", type: "Wood +25%, Crop +25%", conquered: true, owner: "jshasan" },
    { id: 3, coords: "(66|-27)", type: "Clay +25%", conquered: false, owner: "Unoccupied" }
  ]);

  // Battle Reports
  const [battleReports, setBattleReports] = useState<BattleReport[]>([
    { id: 1, attacker: "jshasan", defender: "Natars", coords: "(61|-28)", date: "2026-07-10 14:22", attackerLosses: "0 Clubswingers", defenderLosses: "2 Rat, 1 Spider", loot: "140 Wood, 120 Clay, 180 Crop", outcome: "WON" },
    { id: 2, attacker: "Vandal", defender: "jshasan", coords: "(62|-29)", date: "2026-07-10 16:10", attackerLosses: "10 Imperians", defenderLosses: "0 Phalanx", loot: "0 Wood, 0 Clay, 0 Crop", outcome: "BOUNTY" }
  ]);

  // Potential Settlements
  const [settlements, setSettlements] = useState<PotentialSettlement[]>([
    { id: 1, coords: "(58|-25)", type: "15-Cropper (15c)", status: "Unoccupied" },
    { id: 2, coords: "(66|-32)", type: "9-Cropper (9c)", status: "Occupied" },
    { id: 3, coords: "(60|-35)", type: "Standard (4-4-4-6)", status: "Unoccupied" }
  ]);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('villageos_villages');
    if (saved) {
      try {
        setVillages(JSON.parse(saved));
      } catch (e) {
        loadDefaultVillages();
      }
    } else {
      loadDefaultVillages();
    }
  }, []);

  const loadDefaultVillages = () => {
    const defaultData: Village[] = [
      {
        id: 1,
        name: "Capital 01",
        coords: "(62|-29)",
        isCapital: true,
        population: 89,
        resources: { wood: 83, clay: 88, iron: 71, crop: 54, woodProd: 420, clayProd: 480, ironProd: 320, cropProd: 120 },
        buildings: [
          { id: 1, category: "resource", slot: 1, name: "Woodcutter", current: 3, target: 10, priority: 5 },
          { id: 2, category: "resource", slot: 2, name: "Cropland", current: 2, target: 10, priority: 5 },
          { id: 3, category: "resource", slot: 3, name: "Woodcutter", current: 3, target: 10, priority: 4 },
          { id: 4, category: "resource", slot: 4, name: "Iron Mine", current: 2, target: 10, priority: 5 },
          { id: 5, category: "resource", slot: 5, name: "Clay Pit", current: 4, target: 10, priority: 3 },
          { id: 6, category: "resource", slot: 6, name: "Clay Pit", current: 3, target: 10, priority: 3 },
          { id: 7, category: "resource", slot: 7, name: "Iron Mine", current: 2, target: 10, priority: 3 },
          { id: 8, category: "resource", slot: 8, name: "Cropland", current: 1, target: 10, priority: 4 },
          { id: 9, category: "resource", slot: 9, name: "Cropland", current: 2, target: 10, priority: 3 },
          { id: 10, category: "resource", slot: 10, name: "Iron Mine", current: 2, target: 10, priority: 3 },
          { id: 11, category: "resource", slot: 11, name: "Iron Mine", current: 2, target: 10, priority: 3 },
          { id: 12, category: "resource", slot: 12, name: "Cropland", current: 1, target: 10, priority: 3 },
          { id: 13, category: "resource", slot: 13, name: "Cropland", current: 1, target: 10, priority: 3 },
          { id: 14, category: "resource", slot: 14, name: "Woodcutter", current: 2, target: 10, priority: 3 },
          { id: 15, category: "resource", slot: 15, name: "Cropland", current: 3, target: 10, priority: 3 },
          { id: 16, category: "resource", slot: 16, name: "Clay Pit", current: 3, target: 10, priority: 3 },
          { id: 17, category: "resource", slot: 17, name: "Woodcutter", current: 3, target: 10, priority: 3 },
          { id: 18, category: "resource", slot: 18, name: "Clay Pit", current: 3, target: 10, priority: 3 },
          
          { id: 19, category: "urban", slot: 19, name: "Main Building", current: 5, target: 10, priority: 3 },
          { id: 20, category: "urban", slot: 20, name: "Warehouse", current: 3, target: 10, priority: 4 },
          { id: 21, category: "urban", slot: 21, name: "Granary", current: 5, target: 10, priority: 4 },
          { id: 22, category: "urban", slot: 22, name: "Barracks", current: 3, target: 5, priority: 2 },
          { id: 23, category: "urban", slot: 23, name: "Academy", current: 3, target: 5, priority: 2 },
          { id: 24, category: "urban", slot: 24, name: "Marketplace", current: 1, target: 5, priority: 2 },
          { id: 25, category: "urban", slot: 25, name: "Embassy", current: 0, target: 1, priority: 1 }
        ],
        plannerQueue: [
          { id: 1, building: "Clay Pit", level: 4, wood: 450, clay: 580, iron: 420, crop: 210, time: 240, status: "NOW" },
          { id: 2, building: "Main Building", level: 6, wood: 200, clay: 150, iron: 180, crop: 90, time: 180, status: "NEXT" }
        ]
      }
    ];
    setVillages(defaultData);
    localStorage.setItem('villageos_villages', JSON.stringify(defaultData));
  };

  const handleSaveToLocalStorage = (data: Village[]) => {
    localStorage.setItem('villageos_villages', JSON.stringify(data));
  };

  const activeVillage = villages.find(v => v.id === activeVillageId) || villages[0] || {
    id: 1, name: "Capital 01", coords: "(0|0)", isCapital: true, population: 83,
    resources: { wood: 0, clay: 0, iron: 0, crop: 0, woodProd: 0, clayProd: 0, ironProd: 0, cropProd: 0 },
    buildings: [], plannerQueue: []
  };

  // Dynamic capacities sums
  const getWarehouseCapacity = (v: Village) => {
    if (!v.buildings) return 800;
    const warehouses = v.buildings.filter(b => b.name === "Warehouse");
    if (warehouses.length === 0) return 2300;
    return warehouses.reduce((sum, w) => sum + getCapForLevel(w.current), 0);
  };

  const getGranaryCapacity = (v: Village) => {
    if (!v.buildings) return 800;
    const granaries = v.buildings.filter(b => b.name === "Granary");
    if (granaries.length === 0) return 4000;
    return granaries.reduce((sum, g) => sum + getCapForLevel(g.current), 0);
  };

  const currentWoodCap = getWarehouseCapacity(activeVillage);
  const currentClayCap = currentWoodCap;
  const currentIronCap = currentWoodCap;
  const currentCropCap = getGranaryCapacity(activeVillage);

  // Real-time ticking engine: updates resource stocks every 1 second based on production rate
  useEffect(() => {
    const timer = setInterval(() => {
      setVillages(prev => {
        if (!prev || prev.length === 0) return prev;
        const updated = prev.map(v => {
          if (!v.resources) return v;
          const woodAdd = (v.resources.woodProd || 0) / 3600;
          const clayAdd = (v.resources.clayProd || 0) / 3600;
          const ironAdd = (v.resources.ironProd || 0) / 3600;
          const cropAdd = (v.resources.cropProd || 0) / 3600;

          const wCap = getWarehouseCapacity(v);
          const cCap = getGranaryCapacity(v);

          return {
            ...v,
            resources: {
              ...v.resources,
              wood: Math.min(wCap, Math.max(0, v.resources.wood + woodAdd)),
              clay: Math.min(wCap, Math.max(0, v.resources.clay + clayAdd)),
              iron: Math.min(wCap, Math.max(0, v.resources.iron + ironAdd)),
              crop: Math.min(cCap, Math.max(0, v.resources.crop + cropAdd))
            }
          };
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Background sync polling for Chrome Extension updates
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/villageos/sync');
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;

          // Apply account currencies
          if (d.gold !== undefined) setGold(d.gold);
          if (d.silver !== undefined) setSilver(d.silver);

          // Apply village update
          setVillages(prev => prev.map(v => {
            // Find by matching name or coordinate
            const isMatch = (d.coords && v.coords === d.coords) || (d.villageName && v.name === d.villageName);
            if (!isMatch) return v;

            let updatedB = v.buildings ? [...v.buildings] : [];
            if (d.buildings && d.buildings.length) {
              d.buildings.forEach((newB: any) => {
                const idx = updatedB.findIndex(b => b.slot === newB.slot);
                if (idx !== -1) {
                  updatedB[idx].current = newB.level;
                  if (newB.name) updatedB[idx].name = newB.name;
                } else if (newB.slot) {
                  updatedB.push({
                    id: updatedB.length + 1,
                    slot: newB.slot,
                    name: newB.name || 'Structure',
                    current: newB.level,
                    target: 10,
                    priority: 3,
                    category: newB.category || 'urban'
                  });
                }
              });
            }

            return {
              ...v,
              name: d.villageName || v.name,
              coords: d.coords || v.coords,
              resources: {
                ...v.resources,
                wood: d.resources.wood ?? v.resources.wood,
                clay: d.resources.clay ?? v.resources.clay,
                iron: d.resources.iron ?? v.resources.iron,
                crop: d.resources.crop ?? v.resources.crop,
                woodProd: d.resources.woodProd ?? v.resources.woodProd,
                clayProd: d.resources.clayProd ?? v.resources.clayProd,
                ironProd: d.resources.ironProd ?? v.resources.ironProd,
                cropProd: d.resources.cropProd ?? v.resources.cropProd,
              },
              buildings: updatedB
            };
          }));

          // Apply hero update
          if (d.hero && Object.keys(d.hero).length) {
            setHero(prev => ({
              ...prev,
              name: d.hero.name || prev.name,
              level: d.hero.level ?? prev.level,
              hp: d.hero.health ?? prev.hp,
              strength: d.hero.fightingStrength ?? prev.strength,
              xp: d.hero.experience ?? prev.xp,
              bagWood: d.bagWood ?? prev.bagWood,
              bagClay: d.bagClay ?? prev.bagClay,
              bagIron: d.bagIron ?? prev.bagIron,
              bagCrop: d.bagCrop ?? prev.bagCrop,
            }));
          }

          // Apply consumables
          if (d.consumables && Object.keys(d.consumables).length) {
            setConsumables(prev => ({
              ointments: d.consumables.ointments ?? prev.ointments,
              scrolls: d.consumables.scrolls ?? prev.scrolls,
              cages: d.consumables.cages ?? prev.cages,
              wisdomBooks: d.consumables.booksOfWisdom ?? prev.wisdomBooks,
              artwork: d.consumables.artwork ?? prev.artwork,
              buckets: d.consumables.buckets ?? prev.buckets,
            }));
          }

          setStatusMsg(`SUCCESS: Instantly synced "${d.villageName || 'Active Village'}" via Browser Extension.`);
        }
      } catch (err) {
        // Suppress polling network errors
      }
    }, 1500);

    return () => clearInterval(syncInterval);
  }, [activeVillageId]);


  // Settings State
  const [settings, setSettings] = useState({
    accountName: "Swayam",
    tribe: "Gauls",
    serverSpeed: 3,
    goldStrategy: "Light Gold",
    timezone: "GMT+5:30",
    startDate: "2026-07-01",
    targetCropper: "15c"
  });

  // Hero RPG & Resource State
  const [hero, setHero] = useState({
    name: "jshasan",
    level: 3,
    xp: 342,
    nextLvlXp: 1000,
    hp: 63,
    strength: 740,
    resBonusPercent: 20,
    weapon: "Sword of the Gaul",
    armor: "Plated Chestplate",
    helmet: "Helmet of Awareness",
    boots: "Boots of Speed",
    shield: "Gaulish Buckler",
    bagWood: 396,
    bagClay: 1111,
    bagIron: 1415,
    bagCrop: 4044,
    status: "Idle",
    cropUpkeep: 4
  });

  // preloaded consumables inventory
  const [consumables, setConsumables] = useState({
    ointments: 20,
    scrolls: 15,
    cages: 1,
    wisdomBooks: 0,
    artwork: 0,
    buckets: 1
  });

  // Full Travian: Legends gear lists — T1 (basic craft) → T2 (silver) → T3 (gold/rare)
  const standardGearOptions = {
    helmet: {
      T1: [
        "Helmet of Awareness",
        "Helmet of the Horseman",
        "Helmet of the Scout",
        "Helmet of the Cavalry",
        "Helmet of the Mercenary",
      ],
      T2: [
        "Helmet of the Gladiator",
        "Helmet of the Consul",
        "Helmet of the Health",
        "Helmet of the Commander",
        "Helmet of the Duelist",
      ],
      T3: [
        "Helmet of the Archon",
        "Helmet of the Conqueror",
        "Helmet of the Champion",
        "Helmet of the Warlord",
      ],
    },
    weapon: {
      T1: [
        "Sword of the Gaul",
        "Spear of the Roman",
        "Club of the Teuton",
        "Bow of the Hun",
        "Crook of the Egyptian",
        "Spear of the Spartan",
      ],
      T2: [
        "Axe of the Barbarian",
        "Lance of the Mercenary",
        "Sword of the Commander",
        "Dagger of the Scout",
        "Blade of the Consul",
      ],
      T3: [
        "Sword of the Archon",
        "Lance of the Champion",
        "Crossbow of the Warlord",
        "Blade of the Conqueror",
        "Staff of the Pharaoh",
      ],
    },
    shield: {
      T1: [
        "Gaulish Buckler",
        "Roman Tower Shield",
        "Teutonic Round Shield",
        "Pouch of the Thief",
        "Torch",
      ],
      T2: [
        "Standard",
        "Pennant",
        "Bag of the Scout",
        "Lantern",
        "Signum of the Commander",
      ],
      T3: [
        "Map",
        "Shield of the Archon",
        "Shield of the Consul",
        "Aegis of the Champion",
      ],
    },
    armor: {
      T1: [
        "Leather Armour",
        "Segmented Armour",
        "Light Plated Armour",
        "Quilted Jacket",
      ],
      T2: [
        "Scale Armour",
        "Plated Chestplate",
        "Breastplate",
        "Reinforced Hauberk",
        "Lorica Segmentata",
      ],
      T3: [
        "Heavy Scale Armour",
        "Heavy Breastplate",
        "Breastplate of the Archon",
        "Cuirass of the Conqueror",
        "Armour of the Champion",
      ],
    },
    boots: {
      T1: [
        "Boots of the Warrior",
        "Spurs of the Cavalry",
        "Sandals of the Scout",
      ],
      T2: [
        "Boots of Speed",
        "Boots of the Mercenary",
        "Sandals of the Consul",
        "Stirrups",
      ],
      T3: [
        "Boots of the Archon",
        "Boots of the Consul",
        "Greaves of the Champion",
        "Sabatons of the Conqueror",
      ],
    },
  };

  // CP / Culture State
  const [culture, setCulture] = useState({
    currentCp: 423,
    goalCp: 2000,
    cpPerDay: 120
  });

  // Build queue selectors
  const [newBuildName, setNewBuildName] = useState("Woodcutter");
  const [newBuildLvl, setNewBuildLvl] = useState(1);

  // Selected Slot Builder form states
  const [editBuildingName, setEditBuildingName] = useState("Warehouse");
  const [editBuildingLvl, setEditBuildingLvl] = useState(1);

  // Global consolidated values
  const totalPop = villages.reduce((acc, v) => acc + (v.population || 0), 0);

  const handleSettleVillage = () => {
    const newId = villages.length > 0 ? Math.max(...villages.map(v => v.id)) + 1 : 1;
    const newName = `Feeder 0${newId}`;
    const newCoords = `(${Math.floor(Math.random() * 50 - 25)}|${Math.floor(Math.random() * 50 - 25)})`;
    const newVil = {
      id: newId,
      name: newName,
      coords: newCoords,
      isCapital: false,
      population: 83,
      resources: { wood: 1000, clay: 1000, iron: 1000, crop: 1000, woodProd: 40, clayProd: 40, ironProd: 40, cropProd: 10 },
      buildings: [
        { id: 1, category: "resource" as const, slot: 1, name: "Woodcutter", current: 1, target: 10, priority: 5 },
        { id: 2, category: "resource" as const, slot: 2, name: "Clay Pit", current: 1, target: 10, priority: 5 },
        { id: 3, category: "urban" as const, slot: 19, name: "Main Building", current: 1, target: 5, priority: 4 }
      ],
      plannerQueue: []
    };
    const updated = [...villages, newVil];
    setVillages(updated);
    setActiveVillageId(newId);
    handleSaveToLocalStorage(updated);
  };

  const currentSlotBuilding = activeVillage.buildings?.find(b => b.slot === selectedSlot);

  const handleSaveMapSlot = () => {
    if (selectedSlot === null) return;
    const updated = villages.map(v => {
      if (v.id === activeVillageId) {
        const exists = v.buildings.some(b => b.slot === selectedSlot);
        if (exists) {
          return {
            ...v,
            buildings: v.buildings.map(b => b.slot === selectedSlot ? { ...b, name: editBuildingName, current: editBuildingLvl } : b)
          };
        } else {
          const nextId = v.buildings.length > 0 ? Math.max(...v.buildings.map(b => b.id)) + 1 : 1;
          const newB: BuildingItem = {
            id: nextId,
            category: selectedSlot <= 18 ? "resource" : "urban",
            slot: selectedSlot,
            name: editBuildingName,
            current: editBuildingLvl,
            target: 10,
            priority: 3
          };
          return {
            ...v,
            buildings: [...v.buildings, newB]
          };
        }
      }
      return v;
    });
    setVillages(updated);
    handleSaveToLocalStorage(updated);
  };

  const handleDeleteMapSlot = () => {
    if (selectedSlot === null) return;
    const updated = villages.map(v => {
      if (v.id === activeVillageId) {
        return {
          ...v,
          buildings: v.buildings.filter(b => b.slot !== selectedSlot)
        };
      }
      return v;
    });
    setVillages(updated);
    handleSaveToLocalStorage(updated);
  };

  const addNewBuildItem = () => {
    const updated = villages.map(v => {
      if (v.id === activeVillageId) {
        const newId = v.plannerQueue.length > 0 ? Math.max(...v.plannerQueue.map(q => q.id)) + 1 : 1;
        const item: QueueItem = {
          id: newId,
          building: newBuildName,
          level: newBuildLvl,
          wood: 100 * newBuildLvl,
          clay: 120 * newBuildLvl,
          iron: 90 * newBuildLvl,
          crop: 50 * newBuildLvl,
          time: 120 * newBuildLvl,
          status: "FUTURE"
        };
        return {
          ...v,
          plannerQueue: [...v.plannerQueue, item]
        };
      }
      return v;
    });
    setVillages(updated);
    handleSaveToLocalStorage(updated);
  };

  const completeBuildItem = (qId: number) => {
    const item = activeVillage.plannerQueue.find(q => q.id === qId);
    if (!item) return;
    const updated = villages.map(v => {
      if (v.id === activeVillageId) {
        return {
          ...v,
          buildings: v.buildings.map(b => b.name === item.building ? { ...b, current: item.level } : b),
          plannerQueue: v.plannerQueue.filter(q => q.id !== qId)
        };
      }
      return v;
    });
    setVillages(updated);
    handleSaveToLocalStorage(updated);
  };

  const triggerParsing = () => {
    setParsing(true);
    setStatusMsg("Analyzing layout coordinates...");
    
    setTimeout(() => {
      const updated = villages.map(v => {
        if (v.id === activeVillageId) {
          const parsedResourceBuildings = [
            { id: 1, category: "resource" as const, slot: 1, name: "Woodcutter", current: 3, target: 10, priority: 5 },
            { id: 2, category: "resource" as const, slot: 2, name: "Cropland", current: 2, target: 10, priority: 5 },
            { id: 3, category: "resource" as const, slot: 3, name: "Woodcutter", current: 3, target: 10, priority: 4 },
            { id: 4, category: "resource" as const, slot: 4, name: "Iron Mine", current: 3, target: 10, priority: 5 },
            { id: 5, category: "resource" as const, slot: 5, name: "Clay Pit", current: 4, target: 10, priority: 3 },
            { id: 6, category: "resource" as const, slot: 6, name: "Clay Pit", current: 3, target: 10, priority: 3 },
            { id: 7, category: "resource" as const, slot: 7, name: "Iron Mine", current: 2, target: 10, priority: 3 },
            { id: 8, category: "resource" as const, slot: 8, name: "Cropland", current: 1, target: 10, priority: 4 },
            { id: 9, category: "resource" as const, slot: 9, name: "Cropland", current: 2, target: 10, priority: 3 },
            { id: 10, category: "resource" as const, slot: 10, name: "Iron Mine", current: 3, target: 10, priority: 3 },
            { id: 11, category: "resource" as const, slot: 11, name: "Iron Mine", current: 2, target: 10, priority: 3 },
            { id: 12, category: "resource" as const, slot: 12, name: "Cropland", current: 1, target: 10, priority: 3 },
            { id: 13, category: "resource" as const, slot: 13, name: "Cropland", current: 1, target: 10, priority: 3 },
            { id: 14, category: "resource" as const, slot: 14, name: "Woodcutter", current: 3, target: 10, priority: 3 },
            { id: 15, category: "resource" as const, slot: 15, name: "Cropland", current: 2, target: 10, priority: 3 },
            { id: 16, category: "resource" as const, slot: 16, name: "Clay Pit", current: 3, target: 10, priority: 3 },
            { id: 17, category: "resource" as const, slot: 17, name: "Woodcutter", current: 3, target: 10, priority: 3 },
            { id: 18, category: "resource" as const, slot: 18, name: "Clay Pit", current: 3, target: 10, priority: 3 }
          ];

          const parsedUrbanBuildings = [
            { id: 19, category: "urban" as const, slot: 19, name: "Main Building", current: 5, target: 10, priority: 3 },
            { id: 20, category: "urban" as const, slot: 20, name: "Warehouse", current: 3, target: 10, priority: 4 },
            { id: 21, category: "urban" as const, slot: 21, name: "Granary", current: 5, target: 10, priority: 4 },
            { id: 22, category: "urban" as const, slot: 22, name: "Barracks", current: 3, target: 5, priority: 2 },
            { id: 23, category: "urban" as const, slot: 23, name: "Academy", current: 3, target: 5, priority: 2 },
            { id: 24, category: "urban" as const, slot: 24, name: "Marketplace", current: 1, target: 5, priority: 2 },
            { id: 25, category: "urban" as const, slot: 25, name: "Embassy", current: 0, target: 1, priority: 1 }
          ];

          return {
            ...v,
            population: 96,
            name: "B1",
            coords: "(62|-29)",
            resources: { ...v.resources, wood: 739, clay: 558, iron: 447, crop: 321 },
            buildings: [...parsedResourceBuildings, ...parsedUrbanBuildings]
          };
        }
        return v;
      });
      setVillages(updated);
      handleSaveToLocalStorage(updated);
      setHero(prev => ({ ...prev, level: 3, hp: 63, status: "Idle" }));
      setParsing(false);
      setStatusMsg("SUCCESS: Screen synchronized successfully.");
    }, 1200);
  };

  // ─── Precision Travian text parser ──────────────────────────────────────────
  // Handles standard copy-pastes from dorf1 (resources/production), dorf2 (buildings),
  // hero attributes (level/health/strength), and hero inventory (materials/consumables).
  const parseRawClipboardText = () => {
    if (!rawPasteInput.trim()) {
      setStatusMsg('FAILURE: No text supplied.');
      return;
    }

    const raw = rawPasteInput
      .replace(/[\u202a-\u202f\u200e\u200f\u00a0]/g, ' ')
      .replace(/\u2212/g, '-')
      .replace(/\u2011/g, '-');
    const clean = raw.replace(/,(\d{3})/g, '$1'); // "2,300" → "2300"
    const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
    const matched: string[] = [];

    let buildingsCopy = activeVillage.buildings ? [...activeVillage.buildings] : [];
    let newCoords  = activeVillage.coords;
    let newName    = activeVillage.name;
    let newPop     = activeVillage.population;
    let newRes     = activeVillage.resources
      ? { ...activeVillage.resources }
      : { wood: 0, clay: 0, iron: 0, crop: 0, woodProd: 0, clayProd: 0, ironProd: 0, cropProd: 0 };

    // ── 1. Coordinates + Village Name ─────────────────────────────────────────
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/\((-?\d+)\s*\|\s*(-?\d+)\)/);
      if (m) {
        newCoords = `(${m[1]}|${m[2]})`;
        matched.push('coords');
        if (i > 0 && lines[i - 1].length < 40 && !/\d/.test(lines[i - 1])) {
          newName = lines[i - 1];
          matched.push('name');
        }
        break;
      }
    }

    // ── 2. Population ─────────────────────────────────────────────────────────
    const popM = clean.match(/Population[:\s]+(-?\d+)/i);
    if (popM) { newPop = parseInt(popM[1]); matched.push('pop'); }

    // ── 3. Gold & Silver ──────────────────────────────────────────────────────
    const goldM   = clean.match(/Gold[:\s]+(\d+)/i);
    const silverM = clean.match(/Silver[:\s]+(\d+)/i);
    if (goldM)   { setGold(parseInt(goldM[1]));     matched.push('gold'); }
    if (silverM) { setSilver(parseInt(silverM[1])); matched.push('silver'); }

    // Fallback for gold/silver top lines on hero page (e.g. "130" on one line, "2,187" on next)
    const numericLines = lines.slice(0, 10).map(l => parseInt(l.replace(/[^\d]/g, ''))).filter(n => !isNaN(n));
    if (numericLines.length >= 2 && !goldM && !silverM) {
      // Typically gold, silver, wood, clay, iron, crop are at the top of the hero page.
      // Let's extract the gold and silver if we find the pattern
      if (clean.includes('Hero') || clean.includes('Attributes')) {
        setGold(numericLines[0]);
        setSilver(numericLines[1]);
        matched.push('gold', 'silver');
      }
    }

    // ── 4. Resource Stocks (dorf1 layout) ─────────────────────────────────────
    // Resource values are often pasted as a sequence of numbers:
    // e.g. "739", "558", "447", "4000", "321", "84"
    // Let's search for sequences of isolated numbers that match wood, clay, iron, warehouse, crop, granary
    const standaloneNums = lines.map(l => parseInt(l.replace(/[^\d-]/g, ''))).filter(n => !isNaN(n));
    if (standaloneNums.length >= 6 && clean.includes('Server time')) {
      // Standard header pattern: [gold, silver, warehouse, clay, iron, crop, granary, free_crop]
      // Let's identify the block from the top
      newRes.wood = standaloneNums[3] ?? newRes.wood;
      newRes.clay = standaloneNums[4] ?? newRes.clay;
      newRes.iron = standaloneNums[5] ?? newRes.iron;
      newRes.crop = standaloneNums[7] ?? newRes.crop;
      setFreeCrop(standaloneNums[8] ?? 84);
      matched.push('resources');
    }

    // Direct labels fallback
    const lumberM = clean.match(/(?:Lumber|Wood)[:\s]+(\d+)/i);
    const clayRM  = clean.match(/Clay[:\s]+(\d+)/i);
    const ironRM  = clean.match(/Iron[:\s]+(\d+)/i);
    const cropRM  = clean.match(/(?:Crop|Grain)[:\s]+(\d+)/i);
    if (lumberM) { newRes.wood = parseInt(lumberM[1]); matched.push('wood'); }
    if (clayRM)  { newRes.clay = parseInt(clayRM[1]);  matched.push('clay'); }
    if (ironRM)  { newRes.iron = parseInt(ironRM[1]);  matched.push('iron'); }
    if (cropRM)  { newRes.crop = parseInt(cropRM[1]);  matched.push('crop'); }

    // ── 5. Production rates ────────────────────────────────────────────────────
    const wpM = clean.match(/(?:Lumber|Wood)\s*(?:production)?[:\s]+(\d+)\s*\/\s*h/i);
    const cpM = clean.match(/Clay\s*(?:production)?[:\s]+(\d+)\s*\/\s*h/i);
    const ipM = clean.match(/Iron\s*(?:production)?[:\s]+(\d+)\s*\/\s*h/i);
    const crpM = clean.match(/(?:Crop|Grain)\s*(?:production)?[:\s]+(\d+)\s*\/\s*h/i);
    if (wpM)  { newRes.woodProd = parseInt(wpM[1]);  matched.push('woodProd'); }
    if (cpM)  { newRes.clayProd = parseInt(cpM[1]);  matched.push('clayProd'); }
    if (ipM)  { newRes.ironProd = parseInt(ipM[1]);  matched.push('ironProd'); }
    if (crpM) { newRes.cropProd = parseInt(crpM[1]); matched.push('cropProd'); }

    // Fallback: 4 numbers in a row on Production / Economy tab
    const prodRow = clean.match(/(\d{2,5})\s+(\d{2,5})\s+(\d{2,5})\s+(\d{2,5})/);
    if (prodRow && !wpM && !cpM && !ipM && !crpM) {
      newRes.woodProd = parseInt(prodRow[1]);
      newRes.clayProd = parseInt(prodRow[2]);
      newRes.ironProd = parseInt(prodRow[3]);
      newRes.cropProd = parseInt(prodRow[4]);
      matched.push('production');
    }

    // ── 6. Free crop ──────────────────────────────────────────────────────────
    const freeCropM = clean.match(/Free\s+crop[:\s]+(\d+)/i) || clean.match(/(\d+)\s*Free\s+crop/i);
    if (freeCropM) { setFreeCrop(parseInt(freeCropM[1])); matched.push('freeCrop'); }

    // ── 7. Server time ────────────────────────────────────────────────────────
    const timeM = clean.match(/Server\s*time[:\s]+([\d:]+)/i);
    if (timeM) { setLastSyncTime(timeM[1]); matched.push('time'); }

    // ── 8. Alliance ───────────────────────────────────────────────────────────
    const allianceM = clean.match(/Alliance[:\s]+([^\n]{1,40})/i);
    if (allianceM) {
      const a = allianceM[1].trim();
      setAlliance(a === 'No alliance' || a === '-' ? 'No alliance' : a);
      matched.push('alliance');
    } else if (clean.includes('No alliance')) {
      setAlliance('No alliance'); matched.push('alliance');
    }

    // ── 9. Hero level and name ────────────────────────────────────────────────
    const heroLvlM = clean.match(/([a-zA-Z0-9_]{2,20})\s*[-–]\s*level\s*(\d+)/i)
                  || clean.match(/Hero[:\s]+([a-zA-Z0-9_]{2,20})[^\n]*Level\s*(\d+)/i);
    if (heroLvlM) {
      setHero(prev => ({ ...prev, name: heroLvlM[1].trim(), level: parseInt(heroLvlM[2]) }));
      matched.push('hero');
    }

    const hpM    = clean.match(/Health[:\s]+(\d+)\s*%/i) || clean.match(/(\d+)\s*%[^\n]*health/i);
    if (hpM) { setHero(prev => ({ ...prev, hp: parseInt(hpM[1]) })); matched.push('hp'); }

    const xpM    = clean.match(/Experience[:\s]+(\d+)/i);
    if (xpM) { setHero(prev => ({ ...prev, xp: parseInt(xpM[1]) })); matched.push('xp'); }

    const strM   = clean.match(/Fighting\s*[Ss]trength[:\s]+(\d+)/i);
    if (strM) { setHero(prev => ({ ...prev, strength: parseInt(strM[1]) })); matched.push('strength'); }

    // ── 10. Hero Inventory / Consumables (Trade Items format) ─────────────────
    // Trailing numbers under Trade Items section:
    // e.g. "396", "1111", "1415", "4044", "20", "1"
    const tradeIdx = lines.findIndex(l => /trade\s*items/i.test(l));
    if (tradeIdx !== -1 && lines.length > tradeIdx + 4) {
      const bW  = parseInt(lines[tradeIdx + 1]);
      const bC  = parseInt(lines[tradeIdx + 2]);
      const bI  = parseInt(lines[tradeIdx + 3]);
      const bCr = parseInt(lines[tradeIdx + 4]);
      if (!isNaN(bW)) {
        setHero(prev => ({
          ...prev,
          bagWood: bW,
          bagClay: bC || 0,
          bagIron: bI || 0,
          bagCrop: bCr || 0
        }));
        matched.push('heroBag');
      }

      // Consumables typically follow after the resources bag
      const bOint  = parseInt(lines[tradeIdx + 5]);
      const bCages = parseInt(lines[tradeIdx + 6]);
      if (!isNaN(bOint)) {
        setConsumables(prev => ({
          ...prev,
          ointments: bOint,
          cages: isNaN(bCages) ? prev.cages : bCages
        }));
        matched.push('consumables');
      }
    }

    // ── 11. Field Levels (dorf1 fields matrix) ────────────────────────────────
    const fieldM = clean.match(/(?<![\d])([1-9]{18})(?![\d])/);
    if (fieldM) {
      const digits = fieldM[1];
      const woodSlots = [1,3,14,17], claySlots = [5,6,16,18], ironSlots = [4,7,10,11];
      for (let i = 0; i < 18; i++) {
        const slot = i + 1;
        const lvl  = parseInt(digits[i]);
        let name   = 'Cropland';
        if (woodSlots.includes(slot)) name = 'Woodcutter';
        else if (claySlots.includes(slot)) name = 'Clay Pit';
        else if (ironSlots.includes(slot)) name = 'Iron Mine';
        const idx = buildingsCopy.findIndex(b => b.slot === slot);
        if (idx !== -1) { buildingsCopy[idx].current = lvl; buildingsCopy[idx].name = name; }
      }
      matched.push('fields');
    }

    // ── 12. Building Levels (dorf2 layout) ────────────────────────────────────
    lines.forEach(line => {
      const bm = line.match(/(Iron Mine|Woodcutter|Clay Pit|Cropland|Warehouse|Granary|Marketplace|Main Building|Barracks|Stable|Workshop|Academy|Embassy|Rally Point|City Wall|Sawmill|Brickworks|Iron Foundry|Grain Mill|Bakery)\s+Level\s+(\d+)/i);
      if (bm) {
        const idx = buildingsCopy.findIndex(b => b.name.toLowerCase() === bm[1].toLowerCase() && b.category === 'urban');
        if (idx !== -1) { buildingsCopy[idx].current = parseInt(bm[2]); matched.push('buildings'); }
      }
    });

    // ── Apply ──────────────────────────────────────────────────────────────────
    const updated = villages.map(v =>
      v.id === activeVillageId
        ? { ...v, name: newName, coords: newCoords, resources: newRes, population: newPop, buildings: buildingsCopy }
        : v
    );
    setVillages(updated);
    handleSaveToLocalStorage(updated);

    if (matched.length > 0) {
      setStatusMsg(`SUCCESS: Parsed [${[...new Set(matched)].join(', ')}] — Village "${newName}" ${newCoords}, Pop ${newPop}.`);
    } else {
      setStatusMsg('FAILURE: Text parser did not find standard patterns. Make sure you copy the entire page.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-8 flex flex-col lg:flex-row gap-6">
      
      {/* LEFT CONTENT AREA */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* COCKPIT HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1E293B] border border-slate-700/50 p-6 rounded-2xl shadow-xl gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="bg-cyan-500 text-[#0F172A] px-2 py-0.5 rounded-lg text-lg italic">V</span> VillageOS
            </h1>
            <p className="text-xs text-slate-400 mt-1">Industrial F1 Decision Suite</p>
          </div>
          
          {/* ACTIVE SELECTORS */}
          <div className="flex flex-wrap items-center gap-2">
            <select 
              value={activeVillageId} 
              onChange={(e) => setActiveVillageId(parseInt(e.target.value))}
              className="bg-[#0F172A] border border-slate-700 text-slate-100 rounded-xl px-3 py-2 font-bold text-xs focus:outline-none focus:border-cyan-500"
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.coords} (Pop: {v.population || 0}) {v.isCapital ? '(Capital)' : ''}
                </option>
              ))}
            </select>
            <button 
              onClick={() => {
                handleSaveToLocalStorage(villages);
                setStatusMsg("SUCCESS: Infrastructure configuration saved to browser storage.");
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-[#0f172a] text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Save Configuration
            </button>
            <button 
              onClick={handleSettleVillage}
              className="bg-cyan-500 text-[#0F172A] hover:bg-cyan-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Settle Slot
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)} 
              className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 transition-colors"
            >
              <SettingsIcon className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* CORE 5 TABS */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'overview', label: 'Overview & Planner', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'infrastructure', label: 'Infrastructure Map', icon: <Database className="w-3.5 h-3.5" /> },
            { id: 'economy', label: 'Economy & Production', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'hero', label: 'Hero Command', icon: <User className="w-3.5 h-3.5" /> },
            { id: 'intel', label: 'Expansion & Combat Intel', icon: <Compass className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-cyan-500 text-[#0F172A] shadow-md shadow-cyan-500/20' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {statusMsg && (
          <div className={`border text-xs p-3 rounded-xl flex items-center justify-between font-semibold ${
            statusMsg.startsWith("SUCCESS") 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg("")} className="hover:text-white ml-2">✕</button>
          </div>
        )}

        {/* DYNAMIC SCREEN AREA */}
        <div className="bg-[#1E293B]/40 border border-slate-800 p-6 rounded-2xl min-h-[400px]">
          
          {/* TAB 1: OVERVIEW & PLANNER */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              
              {/* CONSOLIDATED STATS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1E293B] border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between h-28">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Total Account Pop</span>
                  <div className="text-2xl font-bold">{totalPop} Pop</div>
                  <span className="text-[10px] text-cyan-400">Alliance: {alliance}</span>
                </div>
                <div className="bg-[#1E293B] border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between h-28">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Village Coordinates</span>
                  <div className="text-2xl font-bold">{activeVillage.coords}</div>
                  <span className="text-[10px] text-slate-300">Name: {activeVillage.name}</span>
                </div>
                <div className="bg-[#1E293B] border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between h-28">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Account Currencies</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🥇</span>
                      <span className="text-lg font-black text-yellow-400">{gold.toLocaleString()}</span>
                      <span className="text-[10px] text-yellow-500/70 font-semibold">Gold</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🪙</span>
                      <span className="text-lg font-black text-slate-300">{silver.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Silver</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">Sync: {lastSyncTime}</span>
                </div>
                <div className="bg-[#1E293B] border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between h-28">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Hero Condition</span>
                  <div className="text-2xl font-bold">Lvl {hero.level}</div>
                  <span className="text-[10px] text-slate-300">HP: {hero.hp}% | {hero.status}</span>
                </div>
              </div>

              {/* ACTIVE VILLAGE RESOURCES, CAPACITY, & PRODUCTION SUB-TALLIES */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400">Village Resource Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-[#1E293B]/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                    <span className="text-amber-500 font-bold">Wood Reserves</span>
                    <div className="text-lg font-bold text-white mt-1">
                      {Math.floor(activeVillage.resources?.wood || 0)} <span className="text-[#64748B] text-xs">/ {currentWoodCap}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">(+{activeVillage.resources?.woodProd || 0} / hr)</span>
                  </div>
                  
                  <div className="bg-[#1E293B]/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                    <span className="text-orange-400 font-bold">Clay Reserves</span>
                    <div className="text-lg font-bold text-white mt-1">
                      {Math.floor(activeVillage.resources?.clay || 0)} <span className="text-[#64748B] text-xs">/ {currentClayCap}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">(+{activeVillage.resources?.clayProd || 0} / hr)</span>
                  </div>

                  <div className="bg-[#1E293B]/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                    <span className="text-slate-300 font-bold">Iron Reserves</span>
                    <div className="text-lg font-bold text-white mt-1">
                      {Math.floor(activeVillage.resources?.iron || 0)} <span className="text-[#64748B] text-xs">/ {currentIronCap}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">(+{activeVillage.resources?.ironProd || 0} / hr)</span>
                  </div>

                  <div className="bg-[#1E293B]/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
                    <span className="text-green-400 font-bold">Crop Reserves</span>
                    <div className="text-lg font-bold text-white mt-1">
                      {Math.floor(activeVillage.resources?.crop || 0)} <span className="text-[#64748B] text-xs">/ {currentCropCap}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      (+{activeVillage.resources?.cropProd || 0} / hr) | <span className="text-yellow-400 font-semibold">{freeCrop} Free</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* INFO BOX NOTIFICATION PANEL */}
              {inboxNotification && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs p-4 rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{inboxNotification}</span>
                </div>
              )}

              {/* RECOMMENDATIONS & NEXT STEPS */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs uppercase font-bold tracking-widest text-slate-400">Next Action Strategy Recommendations</h2>
                  <button 
                    onClick={triggerParsing}
                    className="text-xs text-cyan-400 font-bold flex items-center gap-1 hover:underline hover:text-cyan-300"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${parsing ? 'animate-spin' : ''}`} />
                    Sync Screen (Auto-Parse Map Placements)
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-amber-500 font-bold mr-2">★★★★★</span>
                      <span className="font-bold text-white">Upgrade Clay Pit to Lvl 6</span>
                      <p className="text-[10px] text-slate-400 mt-1">ROI Score is highest to balance Wood/Clay ratio in {activeVillage.name}.</p>
                    </div>
                    <span className="text-cyan-400 font-bold">+48 Clay/hr</span>
                  </div>
                </div>
              </div>

              {/* QUEUE CONSOLE */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400">Current Queue Orders for {activeVillage.name}</h3>
                  <div className="flex gap-2 text-xs">
                    <select 
                      value={newBuildName} 
                      onChange={(e) => setNewBuildName(e.target.value)}
                      className="bg-[#0F172A] border border-slate-700 text-slate-100 rounded px-2 py-1 font-bold"
                    >
                      {activeVillage.buildings?.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                    <button onClick={addNewBuildItem} className="bg-cyan-500 text-[#0F172A] px-3 py-1 rounded-lg font-bold">Queue Build</button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!activeVillage.plannerQueue || activeVillage.plannerQueue.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-2">No active build orders.</div>
                  ) : (
                    activeVillage.plannerQueue.map(item => (
                      <div key={item.id} className="bg-[#1E293B]/60 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="bg-[#1E293B] border border-slate-700 px-2 py-0.5 rounded font-mono text-[9px] font-bold text-cyan-400 mr-2">{item.status}</span>
                          <span className="font-bold text-white">{item.building} Level {item.level}</span>
                        </div>
                        <button onClick={() => completeBuildItem(item.id)} className="bg-cyan-500 text-[#0F172A] px-3 py-1 rounded-lg font-bold">Complete</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INFRASTRUCTURE (TRAVIAN STYLE MAP IN HIGH GRAPHICS CSS/SVG) */}
          {activeTab === 'infrastructure' && (
            <div className="flex flex-col gap-6">
              
              {/* VIEW SELECTOR */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Visual Village Map - {activeVillage.name}</h2>
                  <p className="text-[10px] text-slate-400">Click any coordinate slot to build, upgrade, or inspect buildings</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setInfraMapType('resource'); setSelectedSlot(null); }} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      infraMapType === 'resource' ? 'bg-cyan-500 text-[#0F172A]' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Resource Fields (d2)
                  </button>
                  <button 
                    onClick={() => { setInfraMapType('urban'); setSelectedSlot(null); }} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      infraMapType === 'urban' ? 'bg-cyan-500 text-[#0F172A]' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Village Center (d1)
                  </button>
                </div>
              </div>

              {/* MAP & BUILD MODIFIER SPLIT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* REALISTIC HIGH GRAPHIC BOARD PANEL */}
                <div className="lg:col-span-2 bg-[#1A2518] border border-[#2f402c] rounded-3xl p-8 relative flex items-center justify-center min-h-[440px] shadow-2xl overflow-hidden bg-cover" style={{ backgroundImage: "linear-gradient(to bottom, rgba(26,37,24,0.85), rgba(12,18,12,0.95))" }}>
                  
                  {/* 1. RESOURCE MAP (ACCURATE TRAVIAN TILE PLACEMENTS) */}
                  {infraMapType === 'resource' && (
                    <div className="w-[420px] h-[320px] relative border border-[#2f402c]/50 rounded-2xl bg-[#526B4E]/20">
                      
                      {/* Center Village HUD */}
                      <div className="absolute left-[45%] top-[40%] w-12 h-12 rounded-full bg-[#8C6239] border-2 border-[#5C3F24] flex flex-col items-center justify-center shadow-lg z-10">
                        <span className="text-[7px] text-amber-100 font-extrabold uppercase">d1</span>
                      </div>

                      {/* Exact placements on the map */}
                      {resourceSlotPositions.map((pos) => {
                        const activeB = activeVillage.buildings?.find(b => b.slot === pos.slot);
                        const isSelected = selectedSlot === pos.slot;
                        
                        const typeColors = pos.type === 'wood' ? 'bg-emerald-800/90 border-emerald-500 text-emerald-200' 
                                        : pos.type === 'clay' ? 'bg-amber-900/90 border-amber-600 text-amber-200'
                                        : pos.type === 'iron' ? 'bg-slate-800/90 border-slate-500 text-slate-200'
                                        : 'bg-yellow-700/90 border-yellow-500 text-yellow-200';

                        return (
                          <button
                            key={pos.slot}
                            onClick={() => {
                              setSelectedSlot(pos.slot);
                              setEditBuildingName(activeB?.name || pos.name);
                              setEditBuildingLvl(activeB?.current || 1);
                            }}
                            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                            className={`absolute w-10 h-10 rounded-full border flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-md ${typeColors} ${
                              isSelected ? 'ring-4 ring-yellow-400 scale-110 z-20' : ''
                            }`}
                          >
                            <BuildingIcon name={activeB?.name || pos.name} />
                            
                            {/* Circular Level Badge similar to Travian */}
                            <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#FEF9C3] border border-[#CA8A04] text-[#854D0E] text-[8px] font-black rounded-full flex items-center justify-center shadow">
                              {activeB ? activeB.current : 0}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. Village Inner Map */}
                  {infraMapType === 'urban' && (
                    <div className="w-[420px] h-[320px] relative border border-[#2f402c]/50 rounded-2xl bg-[#615243]/20">
                      
                      {urbanSlotPositions.map((pos) => {
                        const activeB = activeVillage.buildings?.find(b => b.slot === pos.slot);
                        const isSelected = selectedSlot === pos.slot;
                        const isBuilt = !!activeB;

                        return (
                          <button
                            key={pos.slot}
                            onClick={() => {
                              setSelectedSlot(pos.slot);
                              setEditBuildingName(activeB?.name || "Warehouse");
                              setEditBuildingLvl(activeB?.current || 1);
                            }}
                            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                            className={`absolute transition-all cursor-pointer ${
                              isBuilt 
                                ? 'w-11 h-11 bg-[#1E293B]/90 border border-cyan-500 rounded-xl flex flex-col items-center justify-center' 
                                : 'w-8 h-5 bg-[#5b6e2d]/60 border border-[#475723] rounded-[50%] flex items-center justify-center opacity-60 hover:opacity-90'
                            } ${isSelected ? 'ring-4 ring-yellow-400 scale-110 z-20' : ''}`}
                          >
                            {isBuilt ? (
                              <>
                                <BuildingIcon name={activeB.name} />
                                <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#FEF9C3] border border-[#CA8A04] text-[#854D0E] text-[8px] font-black rounded-full flex items-center justify-center shadow">
                                  {activeB.current}
                                </span>
                              </>
                            ) : (
                              <span className="text-[7px] text-amber-200 font-extrabold">{pos.slot}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* SLOT PLANNER INSPECTOR (1 COL) */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 text-xs h-full min-h-[400px]">
                  <h3 className="font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2">Slot Inspector</h3>
                  
                  {selectedSlot === null ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 h-64 text-center">
                      <Database className="w-8 h-8 mb-2 opacity-50" />
                      <span>Select a coordinate slot on the map to modify or configure infrastructure.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="bg-[#1E293B] p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400">Selected coordinate slot:</span>
                        <div className="text-lg font-bold text-white mt-1">Slot #{selectedSlot} ({selectedSlot <= 18 ? 'Resource Field' : 'Village Center'})</div>
                      </div>

                      {/* Building Name Input (Sorted according to type) */}
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400">Building Type:</span>
                        {selectedSlot <= 18 ? (
                          <select 
                            value={editBuildingName} 
                            onChange={(e) => setEditBuildingName(e.target.value)}
                            className="bg-[#0F172A] border border-slate-700 text-slate-100 rounded px-2 py-1.5 font-bold focus:outline-none focus:border-cyan-500"
                          >
                            <optgroup label="Resource Fields">
                              <option value="Woodcutter">Woodcutter</option>
                              <option value="Clay Pit">Clay Pit</option>
                              <option value="Iron Mine">Iron Mine</option>
                              <option value="Cropland">Cropland</option>
                            </optgroup>
                          </select>
                        ) : (
                          <select 
                            value={editBuildingName} 
                            onChange={(e) => setEditBuildingName(e.target.value)}
                            className="bg-[#0F172A] border border-slate-700 text-slate-100 rounded px-2 py-1.5 font-bold focus:outline-none focus:border-cyan-500"
                          >
                            <optgroup label="Infrastructure">
                              <option value="Main Building">Main Building</option>
                              <option value="Warehouse">Warehouse</option>
                              <option value="Granary">Granary</option>
                              <option value="Marketplace">Marketplace</option>
                              <option value="Embassy">Embassy</option>
                              <option value="Cranny">Cranny</option>
                            </optgroup>
                            <optgroup label="Military / Tech">
                              <option value="Rally Point">Rally Point</option>
                              <option value="Barracks">Barracks</option>
                              <option value="Stable">Stable</option>
                              <option value="Workshop">Workshop</option>
                              <option value="Academy">Academy</option>
                              <option value="Treasury">Treasury</option>
                              <option value="Town Hall">Town Hall</option>
                              <option value="City Wall">City Wall</option>
                            </optgroup>
                            <optgroup label="Resource Production Bonuses">
                              <option value="Sawmill">Sawmill</option>
                              <option value="Brickworks">Brickworks</option>
                              <option value="Iron Foundry">Iron Foundry</option>
                              <option value="Grain Mill">Grain Mill</option>
                              <option value="Bakery">Bakery</option>
                            </optgroup>
                          </select>
                        )}
                      </div>

                      {/* Building Level Input */}
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400">Building Level:</span>
                        <div className="flex items-center gap-2 bg-[#0F172A] border border-slate-700 rounded px-3 py-1 font-bold">
                          <button onClick={() => setEditBuildingLvl(prev => Math.max(0, prev - 1))} className="hover:text-cyan-400 font-bold px-1">-</button>
                          <input 
                            type="number" 
                            value={editBuildingLvl} 
                            onChange={(e) => setEditBuildingLvl(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-transparent w-full text-center focus:outline-none"
                          />
                          <button onClick={() => setEditBuildingLvl(prev => Math.min(20, prev + 1))} className="hover:text-cyan-400 font-bold px-1">+</button>
                        </div>
                      </div>

                      {/* Save or Clear Buttons */}
                      <div className="flex flex-col gap-2 mt-4">
                        <button 
                          onClick={handleSaveMapSlot}
                          className="bg-cyan-500 text-[#0F172A] hover:bg-cyan-400 py-2 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Position on Map
                        </button>
                        {currentSlotBuilding && (
                          <button 
                            onClick={handleDeleteMapSlot}
                            className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 border border-rose-500/30"
                          >
                            <Trash2 className="w-4 h-4" /> Clear Slot
                          </button>
                        )}
                      </div>

                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: ECONOMY & PRODUCTION */}
          {activeTab === 'economy' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Production, Capacity, & Overflows for {activeVillage.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { key: 'wood', label: 'Wood', cap: currentWoodCap, color: 'text-amber-500' },
                  { key: 'clay', label: 'Clay', cap: currentClayCap, color: 'text-orange-400' },
                  { key: 'iron', label: 'Iron', cap: currentIronCap, color: 'text-slate-300' },
                  { key: 'crop', label: 'Crop', cap: currentCropCap, color: 'text-green-400' }
                ].map(({ key, label, cap, color }) => {
                  const stock = activeVillage.resources?.[key as keyof typeof activeVillage.resources] || 0;
                  const prod = activeVillage.resources?.[`${key}Prod` as keyof typeof activeVillage.resources] || 0;
                  
                  return (
                    <div key={key} className="bg-[#1E293B] p-4 rounded-xl border border-slate-700/30 flex flex-col justify-between">
                      <div>
                        <span className={`text-xs font-bold ${color}`}>{label}</span>
                        <div className="text-lg font-bold mt-1">{Math.floor(stock)} / {cap}</div>
                        <div className="text-[10px] text-slate-400">+{prod}/hr</div>
                      </div>
                      
                      {/* FULL VALUE EDITING OPTIONS */}
                      <div className="flex flex-col gap-1.5 mt-3 pt-2 border-t border-slate-800">
                        <div className="flex gap-1 text-[9px] text-slate-400 items-center justify-between">
                          <span>Reserves:</span>
                          <input 
                            type="number" 
                            value={Math.floor(stock)} 
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              const updated = villages.map(v => v.id === activeVillageId ? { ...v, resources: { ...v.resources, [key]: val } } : v);
                              setVillages(updated);
                              handleSaveToLocalStorage(updated);
                            }}
                            className="bg-[#0F172A] border border-slate-700 w-16 text-right px-1 rounded text-white font-bold"
                          />
                        </div>
                        <div className="flex gap-1 text-[9px] text-slate-400 items-center justify-between">
                          <span>Production:</span>
                          <input 
                            type="number" 
                            value={prod} 
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              const updated = villages.map(v => v.id === activeVillageId ? { ...v, resources: { ...v.resources, [`${key}Prod`]: val } } : v);
                              setVillages(updated);
                              handleSaveToLocalStorage(updated);
                            }}
                            className="bg-[#0F172A] border border-slate-700 w-16 text-right px-1 rounded text-white font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-300">Capacity Engine Note:</span>
                <p className="text-slate-400 mt-1">Warehouse capacity is dynamically derived by summing all **Warehouse** levels in the active village infrastructure table. Similarly, Granary capacity sums all **Granary** levels. If no buildings exist, base capacities default to 800.</p>
              </div>
            </div>
          )}

          {/* TAB 4: HERO COMMAND */}
          {activeTab === 'hero' && (
            <div className="flex flex-col gap-6">
              
              {/* Manual Override Controls Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Hero RPG Attributes, Equipment & Consumables</h2>
                  <p className="text-[10px] text-slate-400">Configure equipped gear slots, consumables tallies, and location statuses</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-400 font-semibold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={manualHeroOverride} 
                    onChange={(e) => setManualHeroOverride(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 w-4 h-4"
                  />
                  Enable Manual Override
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. RPG Attributes Card */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Primary RPG Attributes</div>
                  
                  <div className="flex justify-between border-b border-slate-800 pb-2 text-xs items-center">
                    <span className="text-slate-400">Hero Name:</span>
                    {manualHeroOverride ? (
                      <input 
                        type="text" 
                        value={hero.name} 
                        onChange={(e) => setHero(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-[#0F172A] border border-slate-700 text-white rounded px-2 py-0.5 font-bold focus:outline-none focus:border-cyan-500 text-right w-32"
                      />
                    ) : (
                      <span className="text-white font-bold">{hero.name}</span>
                    )}
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-2 text-xs items-center">
                    <span className="text-slate-400">Hero Level:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">Lvl {hero.level}</span>
                      <button 
                        onClick={() => setHero(prev => ({ ...prev, level: prev.level + 1 }))} 
                        className="p-1 bg-slate-850 border border-slate-700 text-xs rounded hover:bg-slate-700 transition-colors font-bold text-cyan-400 flex items-center justify-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> 1
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-2 text-xs items-center">
                    <span className="text-slate-400">Health State:</span>
                    {manualHeroOverride ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={hero.hp} 
                          onChange={(e) => setHero(prev => ({ ...prev, hp: parseInt(e.target.value) }))}
                          className="w-24 accent-cyan-500"
                        />
                        <span className="text-emerald-400 font-bold w-8 text-right">{hero.hp}%</span>
                      </div>
                    ) : (
                      <span className="text-emerald-400 font-bold">{hero.hp}%</span>
                    )}
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-2 text-xs items-center">
                    <span className="text-slate-400">Fighting Strength:</span>
                    {manualHeroOverride ? (
                      <input 
                        type="number" 
                        value={hero.strength} 
                        onChange={(e) => setHero(prev => ({ ...prev, strength: parseInt(e.target.value) || 0 }))}
                        className="bg-[#0F172A] border border-slate-700 text-white rounded px-2 py-0.5 font-bold focus:outline-none focus:border-cyan-500 text-right w-24"
                      />
                    ) : (
                      <span className="text-white font-bold">{hero.strength} points</span>
                    )}
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-2 text-xs items-center">
                    <span className="text-slate-400">Experience Score:</span>
                    {manualHeroOverride ? (
                      <input 
                        type="number" 
                        value={hero.xp} 
                        onChange={(e) => setHero(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                        className="bg-[#0F172A] border border-slate-700 text-white rounded px-2 py-0.5 font-bold focus:outline-none focus:border-cyan-500 text-right w-24"
                      />
                    ) : (
                      <span className="text-white font-bold">{hero.xp} XP</span>
                    )}
                  </div>

                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-400">Current Status:</span>
                    <select 
                      value={hero.status} 
                      onChange={(e) => setHero(prev => ({ ...prev, status: e.target.value }))}
                      className="bg-[#0F172A] border border-slate-700 text-slate-100 rounded px-2 py-0.5 font-bold focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Idle">Idle</option>
                      <option value="Adventuring">Adventuring</option>
                      <option value="Dead">Dead</option>
                      <option value="Healing">Healing</option>
                    </select>
                  </div>
                </div>

                {/* 2. Equipped Gear Dropdown Selection Card with Nest Tier Optgroups */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Equipped Gear items</div>
                  
                  {[
                    { key: 'helmet', label: 'Helmet Slot', options: standardGearOptions.helmet },
                    { key: 'weapon', label: 'Right Hand (Weapon)', options: standardGearOptions.weapon },
                    { key: 'shield', label: 'Left Hand (Shield/Item)', options: standardGearOptions.shield },
                    { key: 'armor', label: 'Armour (Body)', options: standardGearOptions.armor },
                    { key: 'boots', label: 'Shoes (Boots)', options: standardGearOptions.boots }
                  ].map(({ key, label, options }) => (
                    <div key={key} className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">{label}:</span>
                      {manualHeroOverride ? (
                        <select 
                          value={hero[key as keyof typeof hero] as string} 
                          onChange={(e) => setHero(prev => ({ ...prev, [key]: e.target.value }))}
                          className="bg-[#0F172A] border border-slate-700 text-cyan-400 rounded px-2 py-1 font-semibold focus:outline-none focus:border-cyan-500 text-right w-44"
                        >
                          <option value="None">None</option>
                          <optgroup label="Tier 1 (Base)">
                            {options.T1.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </optgroup>
                          <optgroup label="Tier 2 (Improved)">
                            {options.T2.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </optgroup>
                          <optgroup label="Tier 3 (Master)">
                            {options.T3.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </optgroup>
                        </select>
                      ) : (
                        <span className="text-cyan-400 font-semibold">{hero[key as keyof typeof hero] as string}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* 3. Hero Resources Bag */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col gap-3 md:col-span-2">
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Hero Resources Bag</div>
                  <div className="grid grid-cols-4 gap-4 text-center text-xs">
                    {[
                      { key: 'bagWood', label: 'Wood', color: 'text-amber-500' },
                      { key: 'bagClay', label: 'Clay', color: 'text-orange-400' },
                      { key: 'bagIron', label: 'Iron', color: 'text-slate-300' },
                      { key: 'bagCrop', label: 'Crop', color: 'text-green-400' }
                    ].map(({ key, label, color }) => (
                      <div key={key} className="bg-[#1E293B]/60 p-3 rounded-lg border border-slate-800 flex flex-col items-center">
                        <span className={`font-bold ${color}`}>{label}</span>
                        {manualHeroOverride ? (
                          <input 
                            type="number" 
                            value={hero[key as keyof typeof hero] as number} 
                            onChange={(e) => setHero(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                            className="bg-[#0F172A] border border-slate-700 text-white rounded px-2 py-0.5 mt-2 font-bold w-20 text-center focus:outline-none focus:border-cyan-500"
                          />
                        ) : (
                          <span className="text-white font-extrabold text-sm mt-1">{hero[key as keyof typeof hero] as number}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Consumables Tracker — Tier-grouped */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col gap-5 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Inventory Consumables</div>
                    {manualHeroOverride && (
                      <span className="text-[9px] text-amber-400 font-semibold">Manual Override — click any number to edit directly</span>
                    )}
                  </div>

                  {/* BASIC TIER */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-slate-600">Basic</span>
                      <div className="flex-1 border-t border-slate-800" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      {([
                        {
                          key: 'ointments', label: 'Ointment', tier: 'basic', desc: 'Restores 10% HP',
                          icon: (<svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 2h6l1 7H8L9 2z"/><rect x="7" y="9" width="10" height="13" rx="1"/><path d="M12 12v5M9.5 14.5h5"/></svg>)
                        },
                        {
                          key: 'cages', label: 'Cage', tier: 'basic', desc: 'Captures animals',
                          icon: (<svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M12 5v14M16 5v14M3 10h18M3 14h18"/></svg>)
                        },
                        {
                          key: 'buckets', label: 'Bucket', tier: 'basic', desc: 'Extinguishes fires',
                          icon: (<svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 007-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 007 7z"/><path d="M9 15h6"/></svg>)
                        },
                      ] as const).map(({ key, label, desc, icon }) => (
                        <div key={key} className="bg-[#1E293B]/60 p-3 rounded-xl border border-slate-800 flex flex-col items-center gap-2 hover:border-slate-700 transition-colors">
                          <div className="p-2 bg-slate-800/60 rounded-lg">{icon}</div>
                          <div>
                            <div className="text-slate-200 font-bold text-[11px]">{label}</div>
                            <div className="text-slate-500 text-[9px]">{desc}</div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <button onClick={() => setConsumables(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }))} className="w-5 h-5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center transition-colors">−</button>
                            <input
                              type="number"
                              min={0}
                              value={consumables[key]}
                              onChange={(e) => setConsumables(prev => ({ ...prev, [key]: Math.max(0, parseInt(e.target.value) || 0) }))}
                              className="w-10 bg-[#0f172a] border border-slate-700 text-white rounded text-center text-xs font-black focus:outline-none focus:border-cyan-500 py-0.5"
                            />
                            <button onClick={() => setConsumables(prev => ({ ...prev, [key]: prev[key] + 1 }))} className="w-5 h-5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center transition-colors">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADVANCED TIER */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-amber-600">Advanced</span>
                      <div className="flex-1 border-t border-amber-900/30" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center text-xs">
                      {([
                        {
                          key: 'scrolls', label: 'Scroll of Triumph', tier: 'advanced', desc: '+10% off / def bonus',
                          icon: (<svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>)
                        },
                        {
                          key: 'wisdomBooks', label: 'Book of Wisdom', tier: 'advanced', desc: 'Instant level-up',
                          icon: (<svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M12 7v5M9.5 9.5h5"/></svg>)
                        },
                      ] as const).map(({ key, label, desc, icon }) => (
                        <div key={key} className="bg-[#1E293B]/60 p-3 rounded-xl border border-amber-900/20 flex flex-col items-center gap-2 hover:border-amber-700/30 transition-colors">
                          <div className="p-2 bg-amber-900/20 rounded-lg">{icon}</div>
                          <div>
                            <div className="text-amber-200 font-bold text-[11px]">{label}</div>
                            <div className="text-slate-500 text-[9px]">{desc}</div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <button onClick={() => setConsumables(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }))} className="w-5 h-5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center transition-colors">−</button>
                            <input
                              type="number"
                              min={0}
                              value={consumables[key]}
                              onChange={(e) => setConsumables(prev => ({ ...prev, [key]: Math.max(0, parseInt(e.target.value) || 0) }))}
                              className="w-10 bg-[#0f172a] border border-slate-700 text-white rounded text-center text-xs font-black focus:outline-none focus:border-amber-500 py-0.5"
                            />
                            <button onClick={() => setConsumables(prev => ({ ...prev, [key]: prev[key] + 1 }))} className="w-5 h-5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center transition-colors">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RARE TIER */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-purple-500">Rare</span>
                      <div className="flex-1 border-t border-purple-900/30" />
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-center text-xs">
                      {([
                        {
                          key: 'artwork', label: 'Artwork', tier: 'rare', desc: '+500 Culture Points',
                          icon: (<svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>)
                        },
                      ] as const).map(({ key, label, desc, icon }) => (
                        <div key={key} className="bg-[#1E293B]/60 p-3 rounded-xl border border-purple-900/20 flex items-center gap-4 hover:border-purple-700/30 transition-colors">
                          <div className="p-2 bg-purple-900/20 rounded-lg flex-shrink-0">{icon}</div>
                          <div className="flex-1 text-left">
                            <div className="text-purple-200 font-bold text-[11px]">{label}</div>
                            <div className="text-slate-500 text-[9px]">{desc}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setConsumables(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }))} className="w-5 h-5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center transition-colors">−</button>
                            <input
                              type="number"
                              min={0}
                              value={consumables[key]}
                              onChange={(e) => setConsumables(prev => ({ ...prev, [key]: Math.max(0, parseInt(e.target.value) || 0) }))}
                              className="w-10 bg-[#0f172a] border border-slate-700 text-white rounded text-center text-xs font-black focus:outline-none focus:border-purple-500 py-0.5"
                            />
                            <button onClick={() => setConsumables(prev => ({ ...prev, [key]: prev[key] + 1 }))} className="w-5 h-5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 font-bold flex items-center justify-center transition-colors">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}




          {/* TAB 5: EXPANSION & COMBAT INTEL */}
          {activeTab === 'intel' && (
            <div className="flex flex-col gap-6">
              
              {/* Distance HUD alert */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-400 font-bold">Active Village Coordinate Benchmark:</span>
                  <div className="text-cyan-400 font-extrabold text-sm mt-0.5">{activeVillage.name} {activeVillage.coords}</div>
                </div>
                <div className="text-[10px] text-slate-500 italic">All distance measurements are calculated in fields dynamically from these coordinates.</div>
              </div>

              {/* Oasis Tracker */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-300">Surrounding Mapped Oases</h3>
                  <button 
                    onClick={() => {
                      const newCoords = `(${Math.floor(Math.random() * 20 + 55)}|${Math.floor(Math.random() * 20 - 35)})`;
                      setOases(prev => [...prev, { id: prev.length + 1, coords: newCoords, type: "Crop +25%", conquered: false, owner: "Unoccupied" }]);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Mapped Oasis
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5">Coords</th>
                        <th>Oasis Type</th>
                        <th>Distance (Fields)</th>
                        <th>Conquered Status</th>
                        <th>Owner</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {oases.map(o => (
                        <tr key={o.id} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                          <td className="py-2 font-mono text-cyan-400 font-semibold">{o.coords}</td>
                          <td className="text-white font-medium">{o.type}</td>
                          <td className="font-mono text-yellow-400 font-bold">{calculateDistance(activeVillage.coords, o.coords)} fields</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.conquered ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border border-slate-700 text-slate-400'}`}>
                              {o.conquered ? 'Conquered' : 'Wild'}
                            </span>
                          </td>
                          <td className="text-slate-300">{o.owner}</td>
                          <td>
                            <button 
                              onClick={() => {
                                setOases(prev => prev.map(item => item.id === o.id ? { ...item, conquered: !item.conquered, owner: item.conquered ? "Unoccupied" : "jshasan" } : item));
                              }}
                              className="text-cyan-500 hover:underline hover:text-cyan-400"
                            >
                              Toggle Ownership
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Potential Settlements Finder */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-300">Potential Expansion Settlements</h3>
                  <button 
                    onClick={() => {
                      const newCoords = `(${Math.floor(Math.random() * 20 + 55)}|${Math.floor(Math.random() * 20 - 35)})`;
                      setSettlements(prev => [...prev, { id: prev.length + 1, coords: newCoords, type: "15-Cropper (15c)", status: "Unoccupied" }]);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Expansion Slot
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5">Coords</th>
                        <th>Settlement Type</th>
                        <th>Distance (Fields)</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlements.map(s => (
                        <tr key={s.id} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                          <td className="py-2 font-mono text-cyan-400 font-semibold">{s.coords}</td>
                          <td className="text-white font-medium">{s.type}</td>
                          <td className="font-mono text-yellow-400 font-bold">{calculateDistance(activeVillage.coords, s.coords)} fields</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              s.status === 'Unoccupied' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : s.status === 'Occupied' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              onClick={() => {
                                setSettlements(prev => prev.map(item => item.id === s.id ? { ...item, status: item.status === 'Unoccupied' ? 'Occupied' : 'Unoccupied' } : item));
                              }}
                              className="text-cyan-500 hover:underline hover:text-cyan-400"
                            >
                              Toggle Occupied
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RAID PLANNER CHART */}
              <RaidPlannerPanel activeVillageCoords={activeVillage.coords} serverSpeed={settings.serverSpeed} tribe={settings.tribe} />

              {/* Battle Reports Logs */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-slate-300 border-b border-slate-800 pb-2">Recent Combat & Raid Logs</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5">Date</th>
                        <th>Attacker</th>
                        <th>Defender</th>
                        <th>Coords</th>
                        <th>Attacker Losses</th>
                        <th>Defender Losses</th>
                        <th>Bounty / Loot</th>
                        <th>Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {battleReports.map(r => (
                        <tr key={r.id} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                          <td className="py-2 text-slate-400 font-mono text-[10px]">{r.date}</td>
                          <td className="text-white font-semibold">{r.attacker}</td>
                          <td className="text-white font-semibold">{r.defender}</td>
                          <td className="font-mono text-cyan-400">{r.coords}</td>
                          <td className="text-rose-300">{r.attackerLosses}</td>
                          <td className="text-emerald-300">{r.defenderLosses}</td>
                          <td className="text-amber-300">{r.loot}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              r.outcome === 'WON' ? 'bg-emerald-500/10 text-emerald-400' 
                              : r.outcome === 'BOUNTY' ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {r.outcome}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* RIGHT SIDE DRAWER: UNIFIED SCREENSHOT + TEXT ANALYSER */}
      <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 text-xs h-fit sticky top-6">
        <div>
          <h3 className="font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" /> VillageOS Analyser
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Upload screenshots directly to dedicated slots below for instant parser mapping.</p>
        </div>

        {/* 4 TARGETED UPLOAD SLOTS */}
        <div className="flex flex-col gap-3">
          {([
            { id: 'dorf1', label: 'Resource Fields (dorf1)', desc: 'Wood, clay, iron, crop production & levels' },
            { id: 'dorf2', label: 'Village Center (dorf2)', desc: 'Main building, warehouse, barracks levels' },
            { id: 'heroAttrs', label: 'Hero RPG & Gear', desc: 'Hero name, lvl, hp, strength, equipped gear' },
            { id: 'heroInv', label: 'Hero Inventory bag', desc: 'Ointments, cages, artwork, scrolls, resources' }
          ] as const).map(({ id, label, desc }) => {
            const slot = slotImages[id];
            return (
              <div key={id} className="bg-[#1E293B]/40 border border-slate-800 p-3 rounded-xl flex flex-col gap-2 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300 text-[10px]">{label}</span>
                  {slot.preview && (
                    <button 
                      onClick={() => setSlotImages(prev => ({ ...prev, [id]: { file: null, preview: null } }))}
                      className="text-red-400 hover:text-red-300 text-[9px] font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div
                  className={`border border-dashed rounded-lg p-3 text-center transition-all cursor-pointer relative overflow-hidden ${
                    slot.preview ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-700 bg-[#0f172a]/30'
                  }`}
                  onClick={() => {
                    const el = document.getElementById(`file-input-${id}`);
                    el?.click();
                  }}
                  tabIndex={0}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      setSlotImages(prev => ({
                        ...prev,
                        [id]: { file, preview: URL.createObjectURL(file) }
                      }));
                    }
                  }}
                  onPaste={(e) => {
                    const items = Array.from(e.clipboardData?.items || []);
                    const imgItem = items.find(it => it.type.startsWith('image/'));
                    if (imgItem) {
                      e.preventDefault();
                      const file = imgItem.getAsFile();
                      if (file) {
                        setSlotImages(prev => ({
                          ...prev,
                          [id]: { file, preview: URL.createObjectURL(file) }
                        }));
                      }
                    }
                  }}
                >
                  <input 
                    type="file"
                    id={`file-input-${id}`}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        setSlotImages(prev => ({
                          ...prev,
                          [id]: { file, preview: URL.createObjectURL(file) }
                        }));
                      }
                    }}
                  />
                  {slot.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slot.preview} alt={label} className="w-full rounded object-contain max-h-20" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span className="text-[9px] text-slate-500">Drop, click or paste</span>
                    </div>
                  )}
                </div>

                {slot.file && (
                  <button
                    disabled={imageAnalysing}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!slot.file) return;
                      setImageAnalysing(true);
                      setStatusMsg('');
                      try {
                        const fd = new FormData();
                        fd.append('image', slot.file);
                        fd.append('targetSlot', id); // Let the backend know the target context
                        
                        const res = await fetch('/api/villageos/analyze-screenshot', { method: 'POST', body: fd });
                        const json = await res.json();
                        if (!res.ok || !json.success) {
                          setStatusMsg(`FAILURE: ${json.error || 'API call failed.'}`);
                          return;
                        }
                        const d = json.result?.data ?? {};

                        // Apply to state cleanly depending on what target is
                        if (id === 'dorf1') {
                          if (d.lumber || d.clay || d.iron || d.crop || d.woodProd) {
                            setVillages(prev => prev.map(v => {
                              if (v.id !== activeVillageId) return v;
                              return {
                                ...v,
                                resources: {
                                  wood:      d.lumber    ?? v.resources.wood,
                                  clay:      d.clay      ?? v.resources.clay,
                                  iron:      d.iron      ?? v.resources.iron,
                                  crop:      d.crop      ?? v.resources.crop,
                                  woodProd:  d.woodProd  ?? v.resources.woodProd,
                                  clayProd:  d.clayProd  ?? v.resources.clayProd,
                                  ironProd:  d.ironProd  ?? v.resources.ironProd,
                                  cropProd:  d.cropProd  ?? v.resources.cropProd,
                                }
                              };
                            }));
                          }
                          if (d.gold !== undefined) setGold(d.gold);
                          if (d.silver !== undefined) setSilver(d.silver);
                        } else if (id === 'dorf2') {
                          // Dorf2 levels
                          if (d.buildingLevels) {
                            setVillages(prev => prev.map(v => {
                              if (v.id !== activeVillageId) return v;
                              const updatedB = (v.buildings || []).map(b => {
                                const level = d.buildingLevels[b.name];
                                return level !== undefined ? { ...b, current: level } : b;
                              });
                              return { ...v, buildings: updatedB };
                            }));
                          }
                        } else if (id === 'heroAttrs') {
                          setHero(prev => ({
                            ...prev,
                            name:     d.heroName     || prev.name,
                            level:    d.heroLevel    ?? prev.level,
                            hp:       d.heroHealth   ?? prev.hp,
                            strength: d.heroFightingStrength ?? prev.strength,
                            xp:       d.heroExperience ?? prev.xp,
                            ...(d.heroEquipment ? {
                              helmet: d.heroEquipment.helmet    ?? prev.helmet,
                              weapon: d.heroEquipment.rightHand ?? prev.weapon,
                              shield: d.heroEquipment.leftHand  ?? prev.shield,
                              armor:  d.heroEquipment.armour    ?? prev.armor,
                              boots:  d.heroEquipment.shoes     ?? prev.boots,
                            } : {}),
                          }));
                        } else if (id === 'heroInv') {
                          if (d.consumables) {
                            setConsumables(prev => ({
                              ointments:   d.consumables.ointments    ?? prev.ointments,
                              scrolls:     d.consumables.scrolls      ?? prev.scrolls,
                              cages:       d.consumables.cages        ?? prev.cages,
                              wisdomBooks: d.consumables.booksOfWisdom ?? prev.wisdomBooks,
                              artwork:     d.consumables.artwork      ?? prev.artwork,
                              buckets:     d.consumables.buckets      ?? prev.buckets,
                            }));
                          }
                          if (d.bagWood || d.bagClay) {
                            setHero(prev => ({
                              ...prev,
                              bagWood: d.bagWood ?? prev.bagWood,
                              bagClay: d.bagClay ?? prev.bagClay,
                              bagIron: d.bagIron ?? prev.bagIron,
                              bagCrop: d.bagCrop ?? prev.bagCrop,
                            }));
                          }
                        }

                        setStatusMsg(`SUCCESS: Sync completed for ${label}.`);
                        setSlotImages(prev => ({ ...prev, [id]: { file: null, preview: null } }));
                      } catch (err: any) {
                        setStatusMsg(`FAILURE: ${err.message}`);
                      } finally {
                        setImageAnalysing(false);
                      }
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-1.5 rounded-lg active:scale-95 transition-all text-[9px] flex items-center justify-center gap-1 shadow"
                  >
                    <Eye className="w-3 h-3" />
                    {imageAnalysing ? 'Analysing...' : 'Analyse & Sync'}
                  </button>
                )}
              </div>
            );
          })}
        </div>



        <div className="border-t border-slate-800 pt-3">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Or paste text:</span>
        </div>

        {/* PASTE LOGS INPUT */}
        <div className="flex flex-col gap-1.5">
          <textarea
            value={rawPasteInput}
            onChange={(e) => setRawPasteInput(e.target.value)}
            placeholder="Paste raw copied text from any Travian page here..."
            className="bg-[#0f172a] border border-slate-800 rounded-xl p-3 h-28 text-xs font-mono focus:outline-none focus:border-cyan-500 text-slate-300 w-full"
          />
        </div>

        {/* TRIGGER TEXT PARSE BUTTON */}
        <button
          onClick={parseRawClipboardText}
          className="bg-cyan-500 text-[#0f172a] hover:bg-cyan-400 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/10"
        >
          <Sparkles className="w-4 h-4" /> Parse Text &amp; Auto-Fill
        </button>

        {/* WHAT EACH PAGE GIVES YOU */}
        <div className="bg-[#0F172A] border border-slate-800 p-3.5 rounded-xl flex flex-col gap-2">
          <span className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex items-center gap-1">
            <MessageSquareCode className="w-3.5 h-3.5 text-cyan-400" /> What each screenshot parses
          </span>
          <div className="text-[9px] text-slate-400 flex flex-col gap-1">
            <div><span className="text-cyan-400 font-bold">Home (dorf1)</span> → resources, production, capacities, gold, silver, queue</div>
            <div><span className="text-violet-400 font-bold">Hero Attrs</span> → level, health, speed, XP, strength, equipment</div>
            <div><span className="text-violet-400 font-bold">Hero Inventory</span> → bag resources, consumable counts</div>
            <div><span className="text-amber-400 font-bold">Rally Point</span> → incoming attacks, outgoing raids, troops at home</div>
            <div><span className="text-emerald-400 font-bold">Academy</span> → all research levels</div>
            <div><span className="text-rose-400 font-bold">Statistics</span> → rank, total troops, off/def points</div>
            <div><span className="text-sky-400 font-bold">Map</span> → visible oases + coords, nearby villages</div>
            <div><span className="text-orange-400 font-bold">Battle Report</span> → outcome, loot, losses → logged to Intel tab</div>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL OVERLAY */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 max-w-lg w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">00_Settings Panel</h2>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="grid grid-cols-1 gap-3 text-xs">
              <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Account Name</span>
                <input 
                  type="text" 
                  value={settings.accountName} 
                  onChange={(e) => setSettings(prev => ({ ...prev, accountName: e.target.value }))}
                  className="bg-[#0F172A] border border-slate-700 text-slate-100 rounded px-2 py-1 text-right focus:outline-none focus:border-cyan-500 font-bold w-40"
                />
              </div>

              <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Tribe Selection</span>
                <select 
                  value={settings.tribe} 
                  onChange={(e) => setSettings(prev => ({ ...prev, tribe: e.target.value }))}
                  className="bg-[#0F172A] border border-slate-700 text-slate-100 rounded px-2 py-1 focus:outline-none focus:border-cyan-500 font-bold w-40"
                >
                  <option value="Gauls">Gauls</option>
                  <option value="Romans">Romans</option>
                  <option value="Teutons">Teutons</option>
                  <option value="Huns">Huns</option>
                  <option value="Egyptians">Egyptians</option>
                  <option value="Spartans">Spartans</option>
                </select>
              </div>

              <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Server Speed Multiplier</span>
                <select 
                  value={settings.serverSpeed} 
                  onChange={(e) => setSettings(prev => ({ ...prev, serverSpeed: parseInt(e.target.value) }))}
                  className="bg-[#0F172A] border border-slate-700 text-slate-100 rounded px-2 py-1 focus:outline-none focus:border-cyan-500 font-bold w-40"
                >
                  <option value="1">1x Speed</option>
                  <option value="2">2x Speed</option>
                  <option value="3">3x Speed</option>
                  <option value="5">5x Speed</option>
                  <option value="10">10x Speed</option>
                </select>
              </div>

              <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Gold strategy</span>
                <select 
                  value={settings.goldStrategy} 
                  onChange={(e) => setSettings(prev => ({ ...prev, goldStrategy: e.target.value }))}
                  className="bg-[#0F172A] border border-slate-700 text-slate-100 rounded px-2 py-1 focus:outline-none focus:border-cyan-500 font-bold w-40"
                >
                  <option value="F2P">F2P</option>
                  <option value="Light Gold">Light Gold</option>
                  <option value="Heavy Gold">Heavy Gold</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => setShowSettingsModal(false)}
              className="bg-cyan-500 text-[#0F172A] hover:bg-cyan-400 py-2 rounded-xl text-xs font-bold w-full mt-4"
            >
              Apply and Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
