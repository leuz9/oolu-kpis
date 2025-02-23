import React from 'react';
import { Clock, TrendingUp, TrendingDown, Minus, User } from 'lucide-react';
import type { Objective } from '../../../../types';

interface HistoryProps {
  history?: Array<{
    progress: number;
    comment: string;
    timestamp: string;
    updatedBy?: string;
  }>;
  currentProgress: number;
}

export default function History({ history = [], currentProgress }: HistoryProps) {
  if (!history.length) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No updates recorded yet
      </div>
    );
  }

  const getTrendIcon = (oldProgress: number, newProgress: number) => {
    if (newProgress > oldProgress) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (newProgress < oldProgress) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {history.map((update, idx) => {
          const isLast = idx === history.length - 1;
          const previousProgress = idx > 0 ? history[idx - 1].progress : 0;
          
          return (
            <li key={update.timestamp}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                      {getTrendIcon(previousProgress, update.progress)}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-600">{update.comment}</p>
                      <div className="mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-medium text-gray-900">
                            {update.progress}%
                          </span>
                          <span className="mx-2">•</span>
                          {update.updatedBy && (
                            <>
                              <User className="h-4 w-4 mr-1" />
                              <span>{update.updatedBy}</span>
                              <span className="mx-2">•</span>
                            </>
                          )}
                          <Clock className="h-4 w-4 mr-1" />
                          <time dateTime={update.timestamp}>
                            {new Date(update.timestamp).toLocaleString()}
                          </time>
                        </div>
                        <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 bg-primary-600 rounded-full transition-all duration-300"
                            style={{ width: `${update.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        update.progress >= 90 ? 'bg-green-100 text-green-800' :
                        update.progress >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {update.progress >= 90 ? 'On Track' :
                         update.progress >= 60 ? 'At Risk' :
                         'Behind'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}