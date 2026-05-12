"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import type { ProbabilityPoint } from "@/hooks/usePredictionMarket";

interface Props {
  history: ProbabilityPoint[];
  height?: number;
  mini?: boolean; // compact version for card sparkline
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: ProbabilityPoint }[] }) {
  if (!active || !payload?.length) return null;
  const { t, yes } = payload[0].payload;
  return (
    <div className="bg-[#12121E] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-[#8B8FA8] mb-1">{format(new Date(t), "MMM d, HH:mm")}</p>
      <p className="text-[#35D07F] font-bold">YES {yes}%</p>
      <p className="text-[#E84040]">NO {100 - yes}%</p>
    </div>
  );
}

export function ProbabilityChart({ history, height = 140, mini = false }: Props) {
  if (history.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-[#5A5A78] text-xs rounded-xl border border-white/5"
        style={{ height }}
      >
        No bet history yet
      </div>
    );
  }

  const data = history.map((p) => ({
    ...p,
    no: 100 - p.yes,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradYes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#35D07F" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#35D07F" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradNo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E84040" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#E84040" stopOpacity={0} />
          </linearGradient>
        </defs>

        {!mini && (
          <XAxis
            dataKey="t"
            tickFormatter={(v) => format(new Date(v), "MMM d")}
            tick={{ fill: "#5A5A78", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
        )}
        {!mini && (
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#5A5A78", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={36}
          />
        )}

        <ReferenceLine y={50} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

        {!mini && <Tooltip content={<CustomTooltip />} />}

        <Area
          type="monotone"
          dataKey="yes"
          stroke="#35D07F"
          strokeWidth={mini ? 1.5 : 2}
          fill="url(#gradYes)"
          dot={false}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Sparkline — tiny, no axes, no tooltip, for card preview
export function Sparkline({ history }: { history: ProbabilityPoint[] }) {
  return <ProbabilityChart history={history} height={40} mini />;
}
