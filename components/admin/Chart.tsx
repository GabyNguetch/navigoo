'use client';

import React, { useEffect, useRef } from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  type: 'line' | 'bar' | 'doughnut' | 'area';
  data: ChartData[];
  title?: string;
  height?: number;
}

export const Chart: React.FC<ChartProps> = ({ type, data, title, height = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = height + 'px';

    ctx.clearRect(0, 0, rect.width, height);

    const maxValue = Math.max(...data.map(d => d.value));
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = height - padding * 2;

    if (type === 'bar') {
      const barWidth = chartWidth / data.length - 10;
      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const x = padding + index * (chartWidth / data.length);
        const y = height - padding - barHeight;

        const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
        gradient.addColorStop(0, item.color || '#8b5cf6');
        gradient.addColorStop(1, item.color ? item.color + '40' : '#8b5cf640');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 5, y, barWidth, barHeight);

        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2 + 5, height - padding + 20);
      });
    } else if (type === 'line' || type === 'area') {
      ctx.beginPath();
      data.forEach((item, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = height - padding - (item.value / maxValue) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      if (type === 'area') {
        ctx.lineTo(padding + chartWidth, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, '#8b5cf680');
        gradient.addColorStop(1, '#8b5cf610');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.stroke();

      data.forEach((item, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = height - padding - (item.value / maxValue) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#8b5cf6';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    } else if (type === 'doughnut') {
      const centerX = rect.width / 2;
      const centerY = height / 2;
      const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
      const innerRadius = radius * 0.6;

      const total = data.reduce((sum, item) => sum + item.value, 0);
      let currentAngle = -Math.PI / 2;

      const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

      data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();

        ctx.fillStyle = item.color || colors[index % colors.length];
        ctx.fill();

        currentAngle += sliceAngle;
      });
    }

    // Y-axis
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(rect.width - padding, height - padding);
    ctx.stroke();
  }, [data, type, height]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      )}
      <canvas ref={canvasRef} className="w-full" />
      {type === 'doughnut' && (
        <div className="mt-4 flex flex-wrap gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: item.color || ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'][index % 5],
                }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.label}: {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};