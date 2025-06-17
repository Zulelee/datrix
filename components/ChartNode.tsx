'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Button } from '@/components/ui/button';
import { X, Move } from 'lucide-react';

interface ChartNodeData {
  title: string;
  type: 'bar' | 'pie' | 'line' | 'area' | 'donut';
  description: string;
  color: string;
  onDelete: (id: string) => void;
}

const ChartNode = memo(({ id, data }: NodeProps<ChartNodeData>) => {
  const renderChart = () => {
    switch (data.type) {
      case 'bar':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            {[40, 60, 80, 55, 70].map((height, index) => (
              <rect
                key={index}
                x={20 + index * 30}
                y={120 - height}
                width={20}
                height={height}
                fill={data.color}
                opacity={0.8}
              />
            ))}
          </svg>
        );
      case 'pie':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="60" cy="60" r="40" fill="none" stroke={data.color} strokeWidth="2" />
            <path d="M 60 20 A 40 40 0 0 1 100 60 L 60 60 Z" fill={data.color} opacity="0.8" />
            <path d="M 100 60 A 40 40 0 0 1 60 100 L 60 60 Z" fill={data.color} opacity="0.6" />
            <path d="M 60 100 A 40 40 0 0 1 20 60 L 60 60 Z" fill={data.color} opacity="0.4" />
          </svg>
        );
      case 'line':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <polyline
              points="20,100 50,70 80,80 110,50 140,60 170,30"
              fill="none"
              stroke={data.color}
              strokeWidth="3"
            />
            {[20, 50, 80, 110, 140, 170].map((x, index) => {
              const y = [100, 70, 80, 50, 60, 30][index];
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={data.color}
                />
              );
            })}
          </svg>
        );
      case 'area':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full">
            <path 
              d="M 20 100 L 50 70 L 80 80 L 110 50 L 140 60 L 170 30 L 170 100 Z" 
              fill={data.color} 
              opacity="0.3" 
            />
            <polyline 
              points="20,100 50,70 80,80 110,50 140,60 170,30" 
              fill="none" 
              stroke={data.color} 
              strokeWidth="3"
            />
          </svg>
        );
      case 'donut':
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="60" cy="60" r="35" fill="none" stroke={data.color} strokeWidth="2" />
            <circle cx="60" cy="60" r="20" fill="white" stroke={data.color} strokeWidth="1" />
            <path d="M 60 25 A 35 35 0 0 1 95 60 L 80 60 A 20 20 0 0 0 60 40 Z" fill={data.color} opacity="0.8" />
            <path d="M 95 60 A 35 35 0 0 1 60 95 L 60 80 A 20 20 0 0 0 80 60 Z" fill={data.color} opacity="0.6" />
          </svg>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full" style={{ backgroundColor: data.color }} />
          </div>
        );
    }
  };

  return (
    <div className="group relative">
      {/* Sticky Note Container */}
      <div 
        className="relative w-80 h-56 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 group-hover:scale-105"
        style={{ 
          borderLeftColor: data.color,
          boxShadow: `4px 4px 12px rgba(110, 29, 39, 0.15), 0 0 0 1px ${data.color}20`,
          transform: `rotate(${(Math.random() - 0.5) * 4}deg)`
        }}
      >
        {/* Sticky Note Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-[#3d0e15] font-ibm-plex text-sm mb-1 hand-drawn-text">
                {data.title}
              </h3>
              <p className="text-xs text-[#6e1d27] font-ibm-plex opacity-75">
                {data.description}
              </p>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDelete(id);
                }}
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-4 h-32">
          <div className="w-full h-full flex items-center justify-center">
            {renderChart()}
          </div>
        </div>

        {/* Sticky Note Corner Fold */}
        <div 
          className="absolute top-0 right-0 w-6 h-6 bg-gray-200 opacity-30"
          style={{
            clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
            borderTopRightRadius: '8px'
          }}
        />

        {/* Move Handle */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Move className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* React Flow Handles (invisible) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0 }}
      />
    </div>
  );
});

ChartNode.displayName = 'ChartNode';

export default ChartNode;