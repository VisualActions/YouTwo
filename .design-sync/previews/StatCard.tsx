import { StatCard } from "@youtwo/ui-kit";

export function ChannelMetrics() {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div style={{ minWidth: 200 }}>
        <StatCard label="Subscribers" value={128000} />
      </div>
      <div style={{ minWidth: 200 }}>
        <StatCard label="Total views" value={2400000} />
      </div>
      <div style={{ minWidth: 200 }}>
        <StatCard label="Videos" value={42} />
      </div>
    </div>
  );
}

export function WithTrend() {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div style={{ minWidth: 220 }}>
        <StatCard label="Views this month" value={184000} delta="+12% vs last month" trend="up" />
      </div>
      <div style={{ minWidth: 220 }}>
        <StatCard label="Watch time (hours)" value="9,420" delta="-4% vs last month" trend="down" />
      </div>
    </div>
  );
}
