
interface DataPoint {
  label: string;
  value: number;
}

interface MiniChartProps {
  data: DataPoint[];
  type?: 'bar' | 'line';
  height?: number;
  color?: 'primary' | 'secondary' | 'success';
}

export function MiniChart({ 
  data, 
  type = 'bar', 
  height = 120,
  color = 'primary' 
}: MiniChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  if (type === 'bar') {
    return (
      <div className={`mini-chart mini-chart--bar mini-chart--${color}`} style={{ height }}>
        <div className="mini-chart__bars">
          {data.map((point, index) => (
            <div key={index} className="mini-chart__bar-wrapper">
              <div 
                className="mini-chart__bar"
                style={{ height: `${(point.value / maxValue) * 100}%` }}
              />
              <span className="mini-chart__label">{point.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Line chart placeholder
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (point.value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`mini-chart mini-chart--line mini-chart--${color}`} style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mini-chart__svg">
        <polyline
          points={points}
          fill="none"
          className="mini-chart__line"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mini-chart__labels">
        {data.map((point, index) => (
          <span key={index} className="mini-chart__label">{point.label}</span>
        ))}
      </div>
    </div>
  );
}

export default MiniChart;
