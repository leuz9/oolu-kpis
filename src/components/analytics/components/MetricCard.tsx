import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  period: string;
  icon: React.ReactNode;
  color: string;
}

export default function MetricCard({ title, value, change, trend, period, icon, color }: MetricCardProps) {
  const getCardColor = (color: string) => {
    const colors = {
      primary: 'bg-primary-50 text-primary-700',
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      purple: 'bg-purple-50 text-purple-700'
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className={`rounded-lg shadow-sm ${getCardColor(color)} p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <div className="ml-4">
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        </div>
        {getTrendIcon()}
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`font-medium ${
          change > 0 ? 'text-green-600' : 
          change < 0 ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
        <span className="ml-2 opacity-75">{period}</span>
      </div>
    </div>
  );
}