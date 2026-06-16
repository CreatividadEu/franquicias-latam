'use client';

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export function Sparkline({
  data,
  valueKey,
}: {
  data: Array<Record<string, number | string>>;
  valueKey: string;
}) {
  if (data.length === 0) {
    return <div className="h-10 flex items-center text-xs text-foreground-subtle">no data</div>;
  }
  return (
    <div className="h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line
            type="monotone"
            dataKey={valueKey}
            stroke="#C9A55C"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
