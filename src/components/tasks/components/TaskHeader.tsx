import React from 'react';
import { Sparkles, RotateCcw, Timer, Plus } from 'lucide-react';

interface TaskHeaderProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    dueToday: number;
    overdue: number;
  };
  refreshing: boolean;
  loading: boolean;
  onRefresh: () => void;
  onFocusMode: () => void;
  onCreateTask: () => void;
}

export default function TaskHeader({
  stats,
  refreshing,
  loading,
  onRefresh,
  onFocusMode,
  onCreateTask
}: TaskHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-4 sm:p-5 text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse flex-shrink-0" />
              <span className="truncate">Task Management</span>
            </h1>
            <p className="text-primary-100 text-xs sm:text-sm">
              Stay organized, stay productive
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh tasks"
            >
              <RotateCcw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onFocusMode}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30 text-xs sm:text-sm"
            >
              <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Focus</span>
            </button>
            <button
              onClick={onCreateTask}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-white text-primary-600 rounded-lg hover:bg-primary-50 font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
        
        {/* Quick Stats in Header */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 mt-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20">
            <div className="text-base sm:text-lg md:text-xl font-bold">{stats.total}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-primary-100">Total</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20">
            <div className="text-base sm:text-lg md:text-xl font-bold text-green-300">{stats.completed}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-primary-100">Done</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20">
            <div className="text-base sm:text-lg md:text-xl font-bold text-yellow-300">{stats.inProgress}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-primary-100">Active</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20 hidden sm:block">
            <div className="text-base sm:text-lg md:text-xl font-bold text-orange-300">{stats.dueToday}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-primary-100">Today</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20 hidden sm:block">
            <div className="text-base sm:text-lg md:text-xl font-bold text-red-300">{stats.overdue}</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-primary-100">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  );
}
