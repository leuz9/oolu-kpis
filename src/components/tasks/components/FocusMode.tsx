import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Clock, Zap, Target } from 'lucide-react';
import type { Task } from '../../../types';
import { renderTextWithLinks } from '../../../utils/textUtils';

interface FocusModeProps {
  tasks: Task[];
  onClose: () => void;
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
}

export default function FocusMode({ tasks, onClose, onUpdateTask }: FocusModeProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0] || null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionType, setSessionType] = useState<'focus' | 'short-break' | 'long-break'>('focus');
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessionDurations = {
    focus: 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60,
  };

  const handleSessionComplete = useCallback(() => {
    if (sessionType === 'focus') {
      setCompletedSessions(prev => prev + 1);
      // Auto-complete task if selected
      if (selectedTask && selectedTask.status !== 'done') {
        onUpdateTask(selectedTask.id, { status: 'done' });
      }
    }
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        sessionType === 'focus' ? 'Focus session complete! 🎉' : 'Break time is over!',
        {
          body: sessionType === 'focus' 
            ? 'Great work! Time for a break.' 
            : 'Ready to get back to work?',
          icon: '/logo.png',
        }
      );
    }
  }, [sessionType, selectedTask, onUpdateTask]);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleSessionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionDurations[sessionType]);
  };

  const changeSessionType = (type: 'focus' | 'short-break' | 'long-break') => {
    setSessionType(type);
    setTimeLeft(sessionDurations[type]);
    setIsRunning(false);
  };

  const progress = ((sessionDurations[sessionType] - timeLeft) / sessionDurations[sessionType]) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-500" />
                Focus Mode
              </h2>
              <p className="text-gray-600 mt-1">Stay focused, get things done</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timer Section */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl p-8 text-white">
                {/* Session Type Selector */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => changeSessionType('focus')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      sessionType === 'focus'
                        ? 'bg-white text-primary-600'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    Focus
                  </button>
                  <button
                    onClick={() => changeSessionType('short-break')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      sessionType === 'short-break'
                        ? 'bg-white text-primary-600'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    Short Break
                  </button>
                  <button
                    onClick={() => changeSessionType('long-break')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      sessionType === 'long-break'
                        ? 'bg-white text-primary-600'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    Long Break
                  </button>
                </div>

                {/* Timer Display */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="text-8xl font-bold mb-4">{formatTime(timeLeft)}</div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={resetTimer}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <RotateCcw className="h-6 w-6" />
                  </button>
                  {isRunning ? (
                    <button
                      onClick={pauseTimer}
                      className="px-8 py-4 bg-white text-primary-600 rounded-full font-semibold text-lg hover:bg-primary-50 transition-colors flex items-center gap-2"
                    >
                      <Pause className="h-6 w-6" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={startTimer}
                      className="px-8 py-4 bg-white text-primary-600 rounded-full font-semibold text-lg hover:bg-primary-50 transition-colors flex items-center gap-2"
                    >
                      <Play className="h-6 w-6" />
                      Start
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-8 flex items-center justify-center gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold">{completedSessions}</div>
                    <div className="text-sm text-white/80">Sessions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{Math.floor(completedSessions * 25 / 60)}h</div>
                    <div className="text-sm text-white/80">Focused</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Selection */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary-600" />
                  Current Task
                </h3>
                
                {selectedTask ? (
                  <div className="bg-white rounded-lg p-4 border-2 border-primary-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedTask.title}</h4>
                    {selectedTask.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {renderTextWithLinks(selectedTask.description)}
                      </p>
                    )}
                    {selectedTask.dueDate && (() => {
                      try {
                        const date = new Date(selectedTask.dueDate);
                        if (isNaN(date.getTime())) return null;
                        return (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                            <Clock className="h-4 w-4" />
                            Due: {date.toLocaleDateString()}
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                    <button
                      onClick={() => {
                        if (selectedTask.status !== 'done') {
                          onUpdateTask(selectedTask.id, { status: 'done' });
                        }
                      }}
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        selectedTask.status === 'done'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {selectedTask.status === 'done' ? (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed
                        </span>
                      ) : (
                        'Mark Complete'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks available</p>
                  </div>
                )}

                {tasks.length > 1 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Switch Task</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {tasks.slice(0, 5).map(task => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            selectedTask?.id === task.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm text-gray-900">{task.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {task.priority} priority
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

