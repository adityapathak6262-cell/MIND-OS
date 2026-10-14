import React, { useState, useEffect } from 'react';
import { PageId } from '../components/Header';
import { api } from '../services/api';
import { TaxonomyEntry, PrimaryCategoryInfo } from '../types';
import {
  BookOpen,
  Search,
  ShieldAlert,
  HelpCircle,
  Wrench,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Info
} from 'lucide-react';

interface TaxonomyRegistryProps {
  onNavigate: (page: PageId) => void;
}

export const TaxonomyRegistry: React.FC<TaxonomyRegistryProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<Record<string, PrimaryCategoryInfo>>({});
  const [taxonomy, setTaxonomy] = useState<Record<string, TaxonomyEntry>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('LG01');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const loadTaxonomy = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTaxonomy();
      setCategories(res.primary_categories);
      setTaxonomy(res.taxonomy);
    } catch (err: any) {
      setError(err.message || 'Failed to load taxonomy data');
    } finally {
      setLoading(false);
    }
  };

  const entriesList = Object.values(taxonomy);

  const filteredEntries = entriesList.filter((entry) => {
    const matchesCat = selectedCategory === 'ALL' || entry.primary_category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCat;

    const matchesName = entry.name.toLowerCase().includes(query);
    const matchesId = entry.id.toLowerCase().includes(query);
    const matchesSignals = entry.observable_signals.toLowerCase().includes(query);
    const matchesSub = Object.values(entry.subcategories || {}).some((s) => s.toLowerCase().includes(query));

    return matchesCat && (matchesName || matchesId || matchesSignals || matchesSub);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 pb-20">
      {/* Header and navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => onNavigate('class-check')}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Class Check
            </button>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider bg-neutral-100 px-2.5 py-0.5 rounded border border-neutral-200">
              Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-neutral-800" />
            COGNIVAULT Taxonomy Registry (LG01–LG50)
          </h1>
          <p className="text-base text-neutral-600 mt-1 max-w-3xl leading-relaxed">
            Version 1.0 structured library of 50 candidate learning-pattern hypotheses across Class 10 CBSE subjects.
            Used strictly to interpret observable quiz and check responses — never to label a student from a single answer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('class-check')}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]"
          >
            Post-Lesson Class Check
          </button>
        </div>
      </div>

      {/* Trust & Ethics Banner */}
      <div className="p-5 bg-neutral-50 border border-neutral-300 rounded-lg flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5" />
        <div className="text-sm text-neutral-800 space-y-1">
          <div className="font-semibold text-neutral-900">
            Pedagogical & Privacy Boundary
          </div>
          <p className="leading-relaxed">
            These entries represent <strong>observable response patterns</strong> generated in educational tasks (written steps, explanations, and options).
            They are <strong>not ground truth</strong> and must never be used to infer hidden mindset, personality, intelligence, mental health, or learning disabilities.
            A single incorrect response only generates candidate hypotheses to explore further.
          </p>
        </div>
      </div>

      {/* Category Filter and Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap min-h-[36px] ${
                selectedCategory === 'ALL'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              All Categories ({entriesList.length})
            </button>
            {Object.entries(categories).map(([code, info]) => {
              const count = entriesList.filter((e) => e.primary_category === code).length;
              return (
                <button
                  key={code}
                  onClick={() => setSelectedCategory(code)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap min-h-[36px] ${
                    selectedCategory === code
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {code}: {info.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID, name, or signal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 transition-colors placeholder:text-neutral-400 min-h-[40px]"
            />
          </div>
        </div>

        {selectedCategory !== 'ALL' && categories[selectedCategory] && (
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800">
            <span className="font-semibold text-neutral-900 mr-1.5">
              {selectedCategory} — {categories[selectedCategory].name}:
            </span>
            {categories[selectedCategory].description}
          </div>
        )}
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="py-16 text-center text-neutral-600 text-base">
          <p>Loading COGNIVAULT taxonomy registry...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 text-center space-y-3">
          <p className="font-semibold">Error loading taxonomy registry</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadTaxonomy}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium cursor-pointer min-h-[44px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Registry List */}
      {!loading && !error && (
        <div className="space-y-3">
          <div className="text-sm text-neutral-600 px-1 flex items-center justify-between">
            <span>Showing {filteredEntries.length} of {entriesList.length} patterns</span>
            <span>Click any entry to inspect observable signals, repair strategy, and safeguards</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredEntries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const catInfo = categories[entry.primary_category];
              const subKeys = Object.keys(entry.subcategories || {});

              return (
                <div
                  key={entry.id}
                  className="bg-white border border-neutral-200 rounded-lg transition-colors overflow-hidden"
                >
                  {/* Header Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none hover:bg-neutral-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-900 rounded border border-neutral-300">
                          {entry.id}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded border border-neutral-300 bg-neutral-50 text-neutral-800">
                          {entry.primary_category} · {catInfo?.name || 'Category'}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900">
                        {entry.name}
                      </h3>
                      <span className="text-sm text-neutral-500 font-normal">
                        ({subKeys.length} subcategories)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-neutral-500 hidden md:inline">
                        {isExpanded ? 'Collapse' : 'Details'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-neutral-200 space-y-4 bg-neutral-50">
                      {/* Subcategories */}
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                          Specific Subcategories ({subKeys.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {subKeys.map((subId) => (
                            <div
                              key={subId}
                              className="p-3 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-800 flex items-start gap-2"
                            >
                              <span className="font-mono text-xs font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 shrink-0">
                                {subId}
                              </span>
                              <span className="leading-snug">{entry.subcategories[subId]}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Signals & Verification Prompt */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                        <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-1">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                            <Info className="w-4 h-4 text-neutral-700" />
                            Observable Response Signals
                          </div>
                          <p className="text-sm text-neutral-700 leading-relaxed">
                            {entry.observable_signals}
                          </p>
                        </div>

                        <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-1">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                            <HelpCircle className="w-4 h-4 text-neutral-700" />
                            Verification Prompt
                          </div>
                          <p className="text-sm text-neutral-800 italic leading-relaxed">
                            &quot;{entry.verification_prompt}&quot;
                          </p>
                        </div>
                      </div>

                      {/* Repair Strategy */}
                      <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                          <Wrench className="w-4 h-4 text-neutral-700" />
                          Recommended Pedagogical Repair Strategy
                        </div>
                        <p className="text-sm text-neutral-700 leading-relaxed">
                          {entry.repair_strategy}
                        </p>
                      </div>

                      {/* Safeguard Note */}
                      <div className="p-4 bg-white border border-neutral-300 rounded-lg space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                          <ShieldAlert className="w-4 h-4 text-neutral-700" />
                          Do Not Infer (Safeguard)
                        </div>
                        <p className="text-sm text-neutral-800 leading-relaxed">
                          {entry.do_not_infer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
