// app/admin/components/ChartComponent.tsx (Fixed - Hydration Error)
'use client';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartComponentProps {
  type: 'line' | 'bar';
}

const ChartComponent: React.FC<ChartComponentProps> = ({ type }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'User Activities',
        data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 85, 90],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Page Views',
        data: [28, 48, 40, 19, 86, 27, 90, 65, 45, 50, 60, 75],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
    },
  };

  if (!isMounted) {
    return (
      <div className="h-80 bg-gray-700 rounded animate-pulse"></div>
    );
  }

  return (
    <div className="h-80">
      <Line data={data} options={options} />
    </div>
  );
};

export default ChartComponent;