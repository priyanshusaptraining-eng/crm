import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  UserCheck, 
  X, 
  Plus, 
  RotateCcw, 
  Check, 
  SlidersHorizontal,
  BookmarkCheck,
  ChevronDown,
  Layers
} from 'lucide-react';
import { User, LeadStatus, FilterCondition, AdvancedFilterQuery } from '../types/crm';

interface AdvancedFilterBarProps {
  currentUser: User;
  allUsers: User[];
  filterQuery: AdvancedFilterQuery;
  onFilterChange: (query: AdvancedFilterQuery) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  currentUser,
  allUsers,
  filterQuery,
  onFilterChange,
  onResetFilters,
  totalResultsCount,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const counselors = allUsers.filter(u => u.status === 'active' && (u.role === 'counselor' || u.role === 'sales_user'));

  const [isConditionBuilderOpen, setIsConditionBuilderOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Status Chip list
  const statusOptions: { label: string; value: LeadStatus | 'all' }[] = [
    { label: 'All Statuses', value: 'all' },
    { label: 'New Lead', value: 'New Lead' },
    { label: 'Demo Scheduled', value: 'Demo Scheduled' },
    { label: 'Demo Attended', value: 'Demo Attended' },
    { label: 'Fee Due', value: 'Fee Due' },
    { label: 'Admitted', value: 'Admitted' },
    { label: 'Lost / Not Interested', value: 'Lost' },
    { label: 'NPU (No Pickup)', value: 'NPU' },
  ];

  // Date Presets
  const datePresets = [
    { label: 'All Dates', value: 'all' },
    { label: 'Today (08 Nov)', value: 'today' },
    { label: 'Yesterday (07 Nov)', value: 'yesterday' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month (Nov)', value: 'this_month' },
    { label: 'Custom Range...', value: 'custom' },
  ];

  const handleSearchChange = (val: string) => {
    onFilterChange({ ...filterQuery, search: val });
  };

  const handleStatusSelect = (status: LeadStatus | 'all') => {
    if (status === 'all') {
      onFilterChange({ ...filterQuery, status: [] });
    } else {
      const currentList = filterQuery.status || [];
      const exists = currentList.includes(status);
      const newStatus = exists 
        ? currentList.filter(s => s !== status)
        : [...currentList, status];
      onFilterChange({ ...filterQuery, status: newStatus });
    }
  };

  const handleDatePresetSelect = (preset: string) => {
    if (preset === 'custom') {
      setIsCustomDateOpen(true);
      onFilterChange({ ...filterQuery, datePreset: 'custom' });
    } else {
      setIsCustomDateOpen(false);
      onFilterChange({ 
        ...filterQuery, 
        datePreset: preset as any,
        startDate: undefined,
        endDate: undefined
      });
    }
  };

  const handleNotInterestedModeToggle = (mode: 'all' | 'my' | 'none') => {
    onFilterChange({ ...filterQuery, notInterestedScope: mode });
  };

  // Add condition in builder
  const handleAddCondition = () => {
    const newCond: FilterCondition = {
      id: `cond_${Date.now()}`,
      field: 'course',
      operator: 'contains',
      value: '',
    };
    onFilterChange({
      ...filterQuery,
      conditions: [...(filterQuery.conditions || []), newCond],
    });
  };

  const handleRemoveCondition = (id: string) => {
    onFilterChange({
      ...filterQuery,
      conditions: (filterQuery.conditions || []).filter(c => c.id !== id),
    });
  };

  const handleUpdateCondition = (id: string, updates: Partial<FilterCondition>) => {
    onFilterChange({
      ...filterQuery,
      conditions: (filterQuery.conditions || []).map(c => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  // Active filter count
  const activeFiltersCount = 
    (filterQuery.search ? 1 : 0) +
    ((filterQuery.status?.length || 0) > 0 ? (filterQuery.status?.length || 0) : 0) +
    (filterQuery.counselorId && filterQuery.counselorId !== 'all' ? 1 : 0) +
    (filterQuery.datePreset && filterQuery.datePreset !== 'all' ? 1 : 0) +
    (filterQuery.notInterestedScope && filterQuery.notInterestedScope !== 'none' ? 1 : 0) +
    (filterQuery.conditions?.length || 0);

  return (
    <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3.5">
      {/* Search Input & Mobile Filter Drawer Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search candidate name, mobile, email, or city..."
            className="w-full pl-10 pr-8 py-2.5 bg-[#151F35] border border-[#1E2D4A] rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition"
          />
          {filterQuery.search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Trigger Button */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className={`md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition shrink-0 ${
            activeFiltersCount > 0
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-[#151F35] border-[#1E2D4A] text-slate-300'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Inline Controls */}
      <div className="hidden md:block space-y-3 pt-1 border-t border-[#1E2D4A]/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Counselor Selector */}
          {isSuperAdmin ? (
            <div className="flex items-center gap-2 bg-[#151F35] border border-[#1E2D4A] rounded-xl px-3 py-2">
              <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterQuery.counselorId || 'all'}
                onChange={(e) => onFilterChange({ ...filterQuery, counselorId: e.target.value })}
                className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#111827] text-white">All Counselors</option>
                {counselors.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#111827] text-white">
                    {c.name}
                  </option>
                ))}
                <option value="unassigned" className="bg-[#111827] text-white">Unassigned Leads</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#151F35] border border-[#1E2D4A] rounded-xl px-3 py-2 text-xs text-slate-300">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Assigned to: <strong className="text-white">{currentUser.name}</strong></span>
            </div>
          )}

          {/* Not Interested Scope Filter */}
          <div className="flex items-center gap-1 bg-[#151F35] border border-[#1E2D4A] rounded-xl p-1 text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Not Interested:</span>
            <button
              type="button"
              onClick={() => handleNotInterestedModeToggle(filterQuery.notInterestedScope === 'all' ? 'none' : 'all')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
                filterQuery.notInterestedScope === 'all'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Lost
            </button>
            <button
              type="button"
              onClick={() => handleNotInterestedModeToggle(filterQuery.notInterestedScope === 'my' ? 'none' : 'my')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
                filterQuery.notInterestedScope === 'my'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Lost Only
            </button>
          </div>

          {/* Rules Builder Toggle */}
          <button
            type="button"
            onClick={() => setIsConditionBuilderOpen(!isConditionBuilderOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              isConditionBuilderOpen || (filterQuery.conditions?.length || 0) > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-[#151F35] border-[#1E2D4A] text-slate-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Rules Builder ({(filterQuery.conditions?.length || 0)})
          </button>
        </div>

        {/* Date Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Created:
          </span>
          {datePresets.map((p) => {
            const isSelected = filterQuery.datePreset === p.value || (!filterQuery.datePreset && p.value === 'all');
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => handleDatePresetSelect(p.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#151F35] text-slate-400 hover:text-white border border-[#1E2D4A]'
                }`}
              >
                {p.label}
              </button>
            );
          })}

          {isCustomDateOpen && (
            <div className="flex items-center gap-2 bg-[#151F35] border border-[#1E2D4A] rounded-xl px-2.5 py-1 text-xs">
              <span className="text-slate-400 text-[10px]">From:</span>
              <input
                type="date"
                value={filterQuery.startDate || ''}
                onChange={(e) => onFilterChange({ ...filterQuery, startDate: e.target.value })}
                className="bg-transparent text-white text-[11px] focus:outline-none"
              />
              <span className="text-slate-400 text-[10px]">To:</span>
              <input
                type="date"
                value={filterQuery.endDate || ''}
                onChange={(e) => onFilterChange({ ...filterQuery, endDate: e.target.value })}
                className="bg-transparent text-white text-[11px] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Status Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1.5 flex items-center gap-1">
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            Status:
          </span>
          {statusOptions.map((opt) => {
            const isAll = opt.value === 'all';
            const isSelected = isAll 
              ? (!filterQuery.status || filterQuery.status.length === 0)
              : ((filterQuery.status || []).includes(opt.value as LeadStatus));

            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleStatusSelect(opt.value)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm'
                    : 'bg-[#151F35]/70 text-slate-400 hover:text-slate-200 border-[#1E2D4A]'
                }`}
              >
                {isSelected && !isAll && <Check className="w-2.5 h-2.5" />}
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Multi-Condition Rules Builder */}
        {isConditionBuilderOpen && (
          <div className="bg-[#0C1425] border border-[#1E2D4A] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Multi-Condition Rules Builder
                </span>
                <div className="flex items-center gap-1 bg-[#151F35] border border-[#1E2D4A] rounded-lg p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filterQuery, conditionLogic: 'AND' })}
                    className={`px-2 py-0.5 rounded font-bold transition ${
                      filterQuery.conditionLogic === 'AND' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Match ALL (AND)
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ ...filterQuery, conditionLogic: 'OR' })}
                    className={`px-2 py-0.5 rounded font-bold transition ${
                      filterQuery.conditionLogic === 'OR' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Match ANY (OR)
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddCondition}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Rule
              </button>
            </div>

            {(filterQuery.conditions || []).length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No custom rules added. Click "+ Add Rule" to filter by specific fields (e.g. Course contains 'Full Stack', Fee &gt; 30,000).
              </p>
            ) : (
              <div className="space-y-2">
                {(filterQuery.conditions || []).map((cond) => (
                  <div key={cond.id} className="flex flex-wrap items-center gap-2 bg-[#151F35] p-2 rounded-xl border border-[#1E2D4A]">
                    <select
                      value={cond.field}
                      onChange={(e) => handleUpdateCondition(cond.id, { field: e.target.value as any })}
                      className="bg-[#111827] border border-[#1E2D4A] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value="name">Candidate Name</option>
                      <option value="location">Location / City</option>
                      <option value="course">Course Program</option>
                      <option value="fee">Deal / Fee Value</option>
                      <option value="source">Lead Source</option>
                      <option value="counselor">Counselor Name</option>
                    </select>

                    <select
                      value={cond.operator}
                      onChange={(e) => handleUpdateCondition(cond.id, { operator: e.target.value as any })}
                      className="bg-[#111827] border border-[#1E2D4A] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value="contains">contains</option>
                      <option value="equals">equals</option>
                      <option value="greater_than">greater than</option>
                      <option value="less_than">less than</option>
                    </select>

                    <input
                      type="text"
                      value={cond.value}
                      onChange={(e) => handleUpdateCondition(cond.id, { value: e.target.value })}
                      placeholder="Enter value..."
                      className="flex-1 min-w-[140px] bg-[#111827] border border-[#1E2D4A] rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Counter & Reset Action */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1E2D4A]/40">
        <span className="text-slate-400">
          Showing <strong className="text-white font-semibold">{totalResultsCount}</strong> candidate leads
          {activeFiltersCount > 0 && ` (${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''})`}
        </span>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Mobile Slide-Up Filter Drawer */}
      {isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div 
            className="bg-[#111827] border-t border-[#1E2D4A] rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2D4A]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Filter Candidates ({totalResultsCount} Matches)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#151F35]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Counselor Filter */}
            {isSuperAdmin && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Assigned Counselor
                </label>
                <select
                  value={filterQuery.counselorId || 'all'}
                  onChange={(e) => onFilterChange({ ...filterQuery, counselorId: e.target.value })}
                  className="w-full p-2.5 bg-[#151F35] border border-[#1E2D4A] rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="all">All Active Counselors</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="unassigned">Unassigned Leads</option>
                </select>
              </div>
            )}

            {/* Date Preset */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Lead Creation Date
              </label>
              <div className="grid grid-cols-2 gap-2">
                {datePresets.map((p) => {
                  const isSelected = filterQuery.datePreset === p.value || (!filterQuery.datePreset && p.value === 'all');
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleDatePresetSelect(p.value)}
                      className={`p-2 rounded-xl text-xs font-medium border text-left transition ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-[#151F35] text-slate-300 border-[#1E2D4A]'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {isCustomDateOpen && (
                <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-[#151F35] rounded-xl border border-[#1E2D4A]">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">From Date</label>
                    <input
                      type="date"
                      value={filterQuery.startDate || ''}
                      onChange={(e) => onFilterChange({ ...filterQuery, startDate: e.target.value })}
                      className="w-full bg-[#111827] text-white p-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">To Date</label>
                    <input
                      type="date"
                      value={filterQuery.endDate || ''}
                      onChange={(e) => onFilterChange({ ...filterQuery, endDate: e.target.value })}
                      className="w-full bg-[#111827] text-white p-1.5 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Lead Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map((opt) => {
                  const isAll = opt.value === 'all';
                  const isSelected = isAll 
                    ? (!filterQuery.status || filterQuery.status.length === 0)
                    : ((filterQuery.status || []).includes(opt.value as LeadStatus));

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleStatusSelect(opt.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                        isSelected
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                          : 'bg-[#151F35] text-slate-300 border-[#1E2D4A]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#1E2D4A] flex items-center gap-3">
              <button
                type="button"
                onClick={onResetFilters}
                className="flex-1 py-3 bg-[#151F35] hover:bg-[#1E2D4A] text-slate-300 text-xs font-bold rounded-2xl border border-[#1E2D4A] transition"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
