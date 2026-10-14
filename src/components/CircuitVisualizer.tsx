import React, { useState } from 'react';

export const CircuitVisualizer: React.FC = () => {
  const [batteryVoltage, setBatteryVoltage] = useState<number>(9);
  const [probeLocation, setProbeLocation] = useState<'before-b1' | 'between-bulbs' | 'after-b2'>('between-bulbs');

  const bulbResistance = 10; // ohms each
  const totalResistance = bulbResistance * 2;
  const current = (batteryVoltage / totalResistance).toFixed(2); // Amperes

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="text-base font-semibold text-white">Interactive Circuit Loop: Charge Conservation</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Test current at different probe points along a single series loop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400">Battery Voltage:</label>
          <input
            type="range"
            min="3"
            max="18"
            step="3"
            value={batteryVoltage}
            onChange={(e) => setBatteryVoltage(Number(e.target.value))}
            className="w-24 accent-indigo-500 cursor-pointer"
          />
          <span className="text-xs font-mono text-indigo-300 font-semibold">{batteryVoltage}V</span>
        </div>
      </div>

      {/* SVG Interactive Circuit Schematic */}
      <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 flex flex-col items-center justify-center">
        <svg viewBox="0 0 600 240" className="w-full max-w-xl h-auto">
          {/* Wire Loop */}
          <rect
            x="60"
            y="40"
            width="480"
            height="160"
            rx="12"
            fill="none"
            stroke="#475569"
            strokeWidth="4"
          />

          {/* Battery on Left Wire */}
          <g transform="translate(60, 120)">
            <line x1="-16" y1="-20" x2="16" y2="-20" stroke="#f59e0b" strokeWidth="4" />
            <line x1="-8" y1="-10" x2="8" y2="-10" stroke="#94a3b8" strokeWidth="3" />
            <line x1="-16" y1="0" x2="16" y2="0" stroke="#f59e0b" strokeWidth="4" />
            <line x1="-8" y1="10" x2="8" y2="10" stroke="#94a3b8" strokeWidth="3" />
            <text x="-32" y="-12" fill="#f59e0b" fontSize="11" fontWeight="bold">+{batteryVoltage}V</text>
            <text x="-32" y="16" fill="#94a3b8" fontSize="11">0V</text>
          </g>

          {/* Bulb 1 (Top wire, left) */}
          <g transform="translate(220, 40)">
            <circle cx="0" cy="0" r="18" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M-8,-8 L8,8 M-8,8 L8,-8" stroke="#fbbf24" strokeWidth="2" />
            <text x="-18" y="-24" fill="#e2e8f0" fontSize="12" fontWeight="600">Bulb 1 (10Ω)</text>
            <text x="-24" y="32" fill="#38bdf8" fontSize="10">V-drop: {(batteryVoltage / 2).toFixed(1)}V</text>
          </g>

          {/* Bulb 2 (Top wire, right) */}
          <g transform="translate(420, 40)">
            <circle cx="0" cy="0" r="18" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M-8,-8 L8,8 M-8,8 L8,-8" stroke="#fbbf24" strokeWidth="2" />
            <text x="-18" y="-24" fill="#e2e8f0" fontSize="12" fontWeight="600">Bulb 2 (10Ω)</text>
            <text x="-24" y="32" fill="#38bdf8" fontSize="10">V-drop: {(batteryVoltage / 2).toFixed(1)}V</text>
          </g>

          {/* Flow Direction Indicator Arrows */}
          <path d="M120,36 L130,40 L120,44 Z" fill="#38bdf8" />
          <path d="M310,36 L320,40 L310,44 Z" fill="#38bdf8" />
          <path d="M540,110 L540,120 L544,110 Z" fill="#38bdf8" transform="rotate(90, 540, 115)" />
          <path d="M330,204 L320,200 L330,196 Z" fill="#38bdf8" />

          {/* Probe Points */}
          <g
            className="cursor-pointer"
            onClick={() => setProbeLocation('before-b1')}
          >
            <circle
              cx="140"
              cy="40"
              r="10"
              fill={probeLocation === 'before-b1' ? '#6366f1' : '#334155'}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <text x="135" y="44" fill="#ffffff" fontSize="10" fontWeight="bold">A1</text>
          </g>

          <g
            className="cursor-pointer"
            onClick={() => setProbeLocation('between-bulbs')}
          >
            <circle
              cx="320"
              cy="40"
              r="10"
              fill={probeLocation === 'between-bulbs' ? '#6366f1' : '#334155'}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <text x="315" y="44" fill="#ffffff" fontSize="10" fontWeight="bold">A2</text>
          </g>

          <g
            className="cursor-pointer"
            onClick={() => setProbeLocation('after-b2')}
          >
            <circle
              cx="500"
              cy="40"
              r="10"
              fill={probeLocation === 'after-b2' ? '#6366f1' : '#334155'}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <text x="495" y="44" fill="#ffffff" fontSize="10" fontWeight="bold">A3</text>
          </g>
        </svg>

        {/* Live Ammeter Readout Display */}
        <div className="w-full mt-4 p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center font-mono text-indigo-300 font-bold text-sm">
              {probeLocation === 'before-b1' ? 'A1' : probeLocation === 'between-bulbs' ? 'A2' : 'A3'}
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Ammeter Reading at{' '}
                {probeLocation === 'before-b1'
                  ? 'Input (Before Bulb 1)'
                  : probeLocation === 'between-bulbs'
                  ? 'Junction (Between Bulb 1 & Bulb 2)'
                  : 'Return (After Bulb 2)'}
              </div>
              <div className="text-lg font-mono font-bold text-white">
                {current} Amperes
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-emerald-400 font-medium">
            ● Exact Same Current Throughout (Conserved)
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-800/60 border border-slate-700 rounded-lg text-xs text-slate-300">
        <strong>Scientific Principle:</strong> Current is the flow rate of electrons (Coulombs per second). Because there is nowhere for charges to leak or pool, the flow rate into Bulb 1 equals the flow rate out of Bulb 1, which equals the flow rate into Bulb 2. Energy is transformed into light, but current is strictly conserved.
      </div>
    </div>
  );
};
