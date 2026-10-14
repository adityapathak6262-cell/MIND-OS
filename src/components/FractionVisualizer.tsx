import React, { useState } from 'react';

export const FractionVisualizer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'common' | 'flawed'>('common');
  const [highlightPart, setHighlightPart] = useState<'both' | 'half' | 'third'>('both');

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="text-base font-semibold text-white">Interactive Fraction Bar Model: 1/2 + 1/3</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare proper common denominator partitioning against the &apos;add across&apos; misconception.
          </p>
        </div>

        {/* Segmented Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('common')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'common'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Correct LCD (Sixths: 5/6)
          </button>
          <button
            onClick={() => setViewMode('flawed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'flawed'
                ? 'bg-amber-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Flawed Model (2/5)
          </button>
        </div>
      </div>

      {viewMode === 'common' ? (
        <div className="space-y-6">
          {/* Reference Whole */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Unit Whole (1.0)</span>
              <span>100%</span>
            </div>
            <div className="h-6 w-full bg-slate-800 rounded-md border border-slate-700 overflow-hidden flex">
              <div className="h-full w-full bg-slate-700/60 flex items-center justify-center text-[10px] text-slate-300">
                1 Whole (6/6)
              </div>
            </div>
          </div>

          {/* Component Fraction Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>First Fraction: 1/2 = 3/6</span>
                <span className="text-indigo-400 font-mono">0.50</span>
              </div>
              <div className="h-8 w-full bg-slate-800 rounded-md border border-slate-700 overflow-hidden flex">
                <div className="h-full w-1/2 bg-indigo-500/80 flex items-center justify-center text-xs font-medium text-white">
                  1/2 (3 sixths)
                </div>
                <div className="h-full w-1/2 bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                  empty
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Second Fraction: 1/3 = 2/6</span>
                <span className="text-emerald-400 font-mono">0.33</span>
              </div>
              <div className="h-8 w-full bg-slate-800 rounded-md border border-slate-700 overflow-hidden flex">
                <div className="h-full w-1/3 bg-emerald-500/80 flex items-center justify-center text-xs font-medium text-white">
                  1/3 (2 sixths)
                </div>
                <div className="h-full w-2/3 bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                  empty
                </div>
              </div>
            </div>
          </div>

          {/* Combined Sum in Sixths */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
              <span>Combined Sum (Placed End-to-End in 6ths)</span>
              <span className="text-indigo-400 font-mono">5/6 (~0.833)</span>
            </div>
            <div className="h-10 w-full bg-slate-800 rounded-md border border-slate-700 overflow-hidden flex">
              <div className="h-full w-[50%] bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white border-r border-indigo-400/30">
                1/2 (3/6)
              </div>
              <div className="h-full w-[33.33%] bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white border-r border-emerald-400/30">
                1/3 (2/6)
              </div>
              <div className="h-full w-[16.67%] bg-slate-800 flex items-center justify-center text-[11px] text-slate-500">
                1/6 left
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-2">
              <span>0</span>
              <span>1/6</span>
              <span>2/6</span>
              <span>3/6 (1/2)</span>
              <span>4/6</span>
              <span className="text-indigo-400 font-semibold">5/6 (Sum)</span>
              <span>1 Whole</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/50 border border-indigo-900 rounded-lg text-xs text-indigo-200">
            <strong>Key Concept:</strong> Fractions can only be combined once they share identical partition units. Converting 1/2 to 3/6 and 1/3 to 2/6 allows counting unit pieces directly: 3 + 2 = 5 pieces out of 6.
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Flawed View: Visual Contradiction Demonstration */}
          <div className="p-4 bg-amber-950/40 border border-amber-900/60 rounded-lg">
            <h5 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
              Visual Proof of Contradiction
            </h5>
            <p className="text-xs text-amber-200 leading-relaxed">
              If 1/2 + 1/3 were 2/5, the combined total would be <strong>0.40</strong>. But you started with 1/2 (<strong>0.50</strong>)! Adding a positive amount (1/3) cannot shrink your starting amount.
            </p>
          </div>

          {/* Direct Size Comparison Bar */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Original Starting Fraction: 1/2</span>
                <span className="font-mono text-indigo-400">0.50</span>
              </div>
              <div className="h-7 w-full bg-slate-800 rounded-md overflow-hidden flex">
                <div className="h-full w-1/2 bg-indigo-500/80 flex items-center justify-center text-xs font-medium text-white">
                  1/2
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Claimed Result: 2/5 (from 1+1 / 2+3)</span>
                <span className="font-mono text-rose-400">0.40 (Smaller than 1/2!)</span>
              </div>
              <div className="h-7 w-full bg-slate-800 rounded-md overflow-hidden flex">
                <div className="h-full w-[40%] bg-rose-500/80 flex items-center justify-center text-xs font-medium text-white">
                  2/5
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Actual Correct Sum: 5/6</span>
                <span className="font-mono text-emerald-400">0.833</span>
              </div>
              <div className="h-7 w-full bg-slate-800 rounded-md overflow-hidden flex">
                <div className="h-full w-[83.33%] bg-emerald-500/80 flex items-center justify-center text-xs font-medium text-white">
                  5/6
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
