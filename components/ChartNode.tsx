'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Button } from '@/components/ui/button';
import { X, Move } from 'lucide-react';

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartNodeData {
  title: string;
  type: 'bar' | 'pie' | 'line' | 'area' | 'donut';
  description: string;
  color: string;
  chartData?: ChartData;
  onDelete: (id: string) => void;
}

const ChartNode = memo(({ id, data }: NodeProps<ChartNodeData>) => {
  const renderDynamicChart = () => {
    if (!data.chartData) return renderPlaceholderChart();
    
    const { labels, datasets } = data.chartData;
    
    // Helper function to format large numbers
    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num/1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num/1000).toFixed(1)}K`;
      return num.toString();
    };
    
    switch (data.type) {
      case 'bar':
        return (
          <svg viewBox="0 0 200 150" className="w-full h-full">
            {/* Y-axis */}
            <line x1="40" y1="10" x2="40" y2="120" stroke="#6e1d27" strokeWidth="1" />
            {/* X-axis */}
            <line x1="40" y1="120" x2="190" y2="120" stroke="#6e1d27" strokeWidth="1" />
            
            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map((tick, i) => {
              const value = Math.round(tick * Math.max(...datasets[0].data) / 100);
              return (
                <g key={`y-${tick}`}>
                  <line
                    x1="37"
                    y1={120 - (tick * 1.1)}
                    x2="43"
                    y2={120 - (tick * 1.1)}
                    stroke="#6e1d27"
                    strokeWidth="1"
                  />
                  <text
                    x="35"
                    y={120 - (tick * 1.1) + 3}
                    textAnchor="end"
                    fontSize="6"
                    fill="#6e1d27"
                  >
                    {formatNumber(value)}
                  </text>
                </g>
              );
            })}

            {/* Bars and Labels */}
            {datasets[0]?.data.map((value, index) => {
              const maxValue = Math.max(...datasets[0].data);
              const height = (value / maxValue) * 100;
              const barWidth = 130 / datasets[0].data.length;
              const barPadding = barWidth * 0.2;
              const x = 50 + index * barWidth + barPadding / 2;
              
              return (
                <g key={index}>
                  {/* Bar */}
                  <rect
                    x={x}
                    y={120 - height}
                    width={barWidth - barPadding}
                    height={height}
                    fill={Array.isArray(datasets[0].backgroundColor) 
                      ? datasets[0].backgroundColor[index] || data.color 
                      : datasets[0].backgroundColor || data.color}
                    opacity={0.8}
                  />
                  {/* Value on top of bar */}
                  <text
                    x={x + (barWidth - barPadding) / 2}
                    y={115 - height}
                    textAnchor="middle"
                    fontSize="6"
                    fill="#6e1d27"
                  >
                    {formatNumber(value)}
                  </text>
                  {/* X-axis label */}
                  {labels && labels[index] && (
                    <text
                      x={x + (barWidth - barPadding) / 2}
                      y={132}
                      textAnchor="end"
                      fontSize="6"
                      fill="#6e1d27"
                      transform={`rotate(-45, ${x + (barWidth - barPadding) / 2}, 132)`}
                    >
                      {labels[index]}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Chart Title */}
            <text
              x="100"
              y="15"
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="#6e1d27"
            >
              {datasets[0]?.label || data.title}
            </text>
          </svg>
        );

      case 'line':
        return (
          <svg viewBox="0 0 200 150" className="w-full h-full">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((tick, i) => (
              <g key={`grid-${tick}`}>
                <line
                  x1="40"
                  y1={120 - (tick * 1.1)}
                  x2="190"
                  y2={120 - (tick * 1.1)}
                  stroke="#6e1d27"
                  strokeWidth="0.2"
                  opacity="0.3"
                />
              </g>
            ))}
            
            {/* Axes */}
            <line x1="40" y1="10" x2="40" y2="120" stroke="#6e1d27" strokeWidth="1" />
            <line x1="40" y1="120" x2="190" y2="120" stroke="#6e1d27" strokeWidth="1" />
            
            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map((tick, i) => {
              const value = Math.round(tick * Math.max(...datasets[0].data) / 100);
              return (
                <g key={`y-${tick}`}>
                  <text
                    x="35"
                    y={120 - (tick * 1.1) + 3}
                    textAnchor="end"
                    fontSize="6"
                    fill="#6e1d27"
                  >
                    {formatNumber(value)}
                  </text>
                </g>
              );
            })}

            {/* Line and Points */}
            {datasets.map((dataset, datasetIndex) => {
              const maxValue = Math.max(...dataset.data);
              const points = dataset.data.map((value, index) => {
                const x = 50 + (index * (130 / (dataset.data.length - 1 || 1)));
                const y = 120 - ((value / maxValue) * 100);
                return `${x},${y}`;
              }).join(' ');

              return (
                <g key={datasetIndex}>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={Array.isArray(dataset.backgroundColor) 
                      ? dataset.backgroundColor[0] 
                      : dataset.backgroundColor || data.color}
                    strokeWidth="2"
                  />
                  {dataset.data.map((value, index) => {
                    const x = 50 + (index * (130 / (dataset.data.length - 1 || 1)));
                    const y = 120 - ((value / maxValue) * 100);
                    return (
                      <g key={`point-${index}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="2"
                          fill={Array.isArray(dataset.backgroundColor) 
                            ? dataset.backgroundColor[0] 
                            : dataset.backgroundColor || data.color}
                        />
                        {/* Value above point */}
                        <text
                          x={x}
                          y={y - 5}
                          textAnchor="middle"
                          fontSize="6"
                          fill="#6e1d27"
                        >
                          {formatNumber(value)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* X-axis labels */}
            {labels && labels.map((label, index) => {
              const x = 50 + (index * (130 / (labels.length - 1 || 1)));
              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={132}
                  textAnchor="end"
                  fontSize="6"
                  fill="#6e1d27"
                  transform={`rotate(-45, ${x}, 132)`}
                >
                  {label}
                </text>
              );
            })}

            {/* Chart Title */}
            <text
              x="100"
              y="15"
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="#6e1d27"
            >
              {datasets[0]?.label || data.title}
            </text>
          </svg>
        );

      case 'pie':
      case 'donut':
        return (
          <svg viewBox="0 0 200 150" className="w-full h-full">
            <g transform="translate(40, 0)">
              {/* Title */}
              <text
                x="60"
                y="15"
                textAnchor="middle"
                fontSize="8"
                fontWeight="bold"
                fill="#6e1d27"
              >
                {datasets[0]?.label || data.title}
              </text>

              {/* Pie/Donut Chart */}
              <g transform="translate(0, 25)">
                {data.type === 'pie' ? renderPieChart(datasets[0]?.data || []) : renderDonutChart(datasets[0]?.data || [])}
              </g>

              {/* Legend */}
              <g transform="translate(120, 40)">
                {(datasets[0]?.data || []).map((value, index) => {
                  const total = datasets[0].data.reduce((sum, val) => sum + val, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return (
                    <g key={index} transform={`translate(0, ${index * 15})`}>
                      <rect
                        width="8"
                        height="8"
                        fill={Array.isArray(datasets[0].backgroundColor) 
                          ? datasets[0].backgroundColor[index] 
                          : data.color}
                        opacity={0.8}
                      />
                      <text
                        x="12"
                        y="6"
                        fontSize="6"
                        fill="#6e1d27"
                      >
                        {`${labels?.[index] || `Item ${index + 1}`} (${percentage}%)`}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        );

      case 'area':
        return (
          <svg viewBox="0 0 200 150" className="w-full h-full">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((tick, i) => (
              <g key={`grid-${tick}`}>
                <line
                  x1="40"
                  y1={120 - (tick * 1.1)}
                  x2="190"
                  y2={120 - (tick * 1.1)}
                  stroke="#6e1d27"
                  strokeWidth="0.2"
                  opacity="0.3"
                />
              </g>
            ))}
            
            {/* Axes */}
            <line x1="40" y1="10" x2="40" y2="120" stroke="#6e1d27" strokeWidth="1" />
            <line x1="40" y1="120" x2="190" y2="120" stroke="#6e1d27" strokeWidth="1" />
            
            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map((tick, i) => {
              const value = Math.round(tick * Math.max(...datasets[0].data) / 100);
              return (
                <g key={`y-${tick}`}>
                  <text
                    x="35"
                    y={120 - (tick * 1.1) + 3}
                    textAnchor="end"
                    fontSize="6"
                    fill="#6e1d27"
                  >
                    {formatNumber(value)}
                  </text>
                </g>
              );
            })}

            {/* Area Chart */}
            {datasets.map((dataset, datasetIndex) => {
              const maxValue = Math.max(...dataset.data);
              const points = dataset.data.map((value, index) => {
                const x = 50 + (index * (130 / (dataset.data.length - 1 || 1)));
                const y = 120 - ((value / maxValue) * 100);
                return `${x},${y}`;
              }).join(' ');

              // Create area by adding bottom corners
              const areaPoints = `${points} ${180},120 50,120`;

              return (
                <g key={datasetIndex}>
                  <path 
                    d={`M ${areaPoints}`} 
                    fill={Array.isArray(dataset.backgroundColor) 
                      ? dataset.backgroundColor[0] 
                      : dataset.backgroundColor || data.color}
                    opacity="0.2" 
                  />
                  <polyline 
                    points={points} 
                    fill="none" 
                    stroke={Array.isArray(dataset.backgroundColor) 
                      ? dataset.backgroundColor[0] 
                      : dataset.backgroundColor || data.color}
                    strokeWidth="2"
                  />
                  {dataset.data.map((value, index) => {
                    const x = 50 + (index * (130 / (dataset.data.length - 1 || 1)));
                    const y = 120 - ((value / maxValue) * 100);
                    return (
                      <g key={`point-${index}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="2"
                          fill={Array.isArray(dataset.backgroundColor) 
                            ? dataset.backgroundColor[0] 
                            : dataset.backgroundColor || data.color}
                        />
                        {/* Value above point */}
                        <text
                          x={x}
                          y={y - 5}
                          textAnchor="middle"
                          fontSize="6"
                          fill="#6e1d27"
                        >
                          {formatNumber(value)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* X-axis labels */}
            {labels && labels.map((label, index) => {
              const x = 50 + (index * (130 / (labels.length - 1 || 1)));
              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={132}
                  textAnchor="end"
                  fontSize="6"
                  fill="#6e1d27"
                  transform={`rotate(-45, ${x}, 132)`}
                >
                  {label}
                </text>
              );
            })}

            {/* Chart Title */}
            <text
              x="100"
              y="15"
              textAnchor="middle"
              fontSize="8"
              fontWeight="bold"
              fill="#6e1d27"
            >
              {datasets[0]?.label || data.title}
            </text>
          </svg>
        );

      default:
        return renderPlaceholderChart();
    }
  };
  
  const renderPieChart = (chartData: number[]) => {
    if (chartData.length === 0) return null;
    
    const total = chartData.reduce((sum, value) => sum + value, 0);
    let startAngle = 0;
    
    return (
      <>
        <circle cx="60" cy="60" r="40" fill="none" stroke={data.color} strokeWidth="2" />
        {chartData.map((value, index) => {
          const percentage = value / total;
          const endAngle = startAngle + percentage * 2 * Math.PI;
          
          // Calculate SVG arc path
          const x1 = 60 + 40 * Math.cos(startAngle);
          const y1 = 60 + 40 * Math.sin(startAngle);
          const x2 = 60 + 40 * Math.cos(endAngle);
          const y2 = 60 + 40 * Math.sin(endAngle);
          
          const largeArcFlag = percentage > 0.5 ? 1 : 0;
          
          const pathData = `M 60 60 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          
          const backgroundColor = Array.isArray(data.chartData?.datasets[0].backgroundColor)
            ? data.chartData?.datasets[0].backgroundColor[index] || data.color
            : data.color;
            
          const opacity = 0.8 - (index * 0.1);
          
          const result = (
            <path
              key={index}
              d={pathData}
              fill={backgroundColor}
              opacity={opacity > 0.3 ? opacity : 0.3}
            />
          );
          
          startAngle = endAngle;
          return result;
        })}
      </>
    );
  };
  
  const renderLineChart = (chartData: number[]) => {
    if (chartData.length === 0) return null;
    
    const maxValue = Math.max(...chartData);
    const points = chartData.map((value, index) => {
      const x = 20 + (index * (160 / (chartData.length - 1 || 1)));
      const y = 100 - ((value / maxValue) * 80);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <>
        <polyline
          points={points}
          fill="none"
          stroke={data.color}
          strokeWidth="3"
        />
        {chartData.map((value, index) => {
          const x = 20 + (index * (160 / (chartData.length - 1 || 1)));
          const y = 100 - ((value / maxValue) * 80);
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
      </>
    );
  };
  
  const renderAreaChart = (chartData: number[]) => {
    if (chartData.length === 0) return null;
    
    const maxValue = Math.max(...chartData);
    const points = chartData.map((value, index) => {
      const x = 20 + (index * (160 / (chartData.length - 1 || 1)));
      const y = 100 - ((value / maxValue) * 80);
      return `${x},${y}`;
    }).join(' ');
    
    // Create area by adding bottom corners
    const areaPoints = `${points} ${20 + ((chartData.length - 1) * (160 / (chartData.length - 1 || 1)))},100 20,100`;
    
    return (
      <>
        <path 
          d={`M ${areaPoints}`} 
          fill={data.color} 
          opacity="0.3" 
        />
        <polyline 
          points={points} 
          fill="none" 
          stroke={data.color} 
          strokeWidth="3"
        />
      </>
    );
  };
  
  const renderDonutChart = (chartData: number[]) => {
    if (chartData.length === 0) return null;
    
    const total = chartData.reduce((sum, value) => sum + value, 0);
    let startAngle = 0;
    
    return (
      <>
        <circle cx="60" cy="60" r="35" fill="none" stroke={data.color} strokeWidth="2" />
        <circle cx="60" cy="60" r="20" fill="white" stroke={data.color} strokeWidth="1" />
        {chartData.map((value, index) => {
          const percentage = value / total;
          const endAngle = startAngle + percentage * 2 * Math.PI;
          
          // Calculate SVG arc path for donut
          const x1 = 60 + 35 * Math.cos(startAngle);
          const y1 = 60 + 35 * Math.sin(startAngle);
          const x2 = 60 + 35 * Math.cos(endAngle);
          const y2 = 60 + 35 * Math.sin(endAngle);
          
          const x1Inner = 60 + 20 * Math.cos(startAngle);
          const y1Inner = 60 + 20 * Math.sin(startAngle);
          const x2Inner = 60 + 20 * Math.cos(endAngle);
          const y2Inner = 60 + 20 * Math.sin(endAngle);
          
          const largeArcFlag = percentage > 0.5 ? 1 : 0;
          
          const pathData = `M ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x2Inner} ${y2Inner} A 20 20 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner} Z`;
          
          const backgroundColor = Array.isArray(data.chartData?.datasets[0].backgroundColor)
            ? data.chartData?.datasets[0].backgroundColor[index] || data.color
            : data.color;
            
          const opacity = 0.8 - (index * 0.1);
          
          const result = (
            <path
              key={index}
              d={pathData}
              fill={backgroundColor}
              opacity={opacity > 0.3 ? opacity : 0.3}
            />
          );
          
          startAngle = endAngle;
          return result;
        })}
      </>
    );
  };

  const renderPlaceholderChart = () => {
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
            {data.chartData ? renderDynamicChart() : renderPlaceholderChart()}
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