import { StatCard, StatGrid } from "@youtwo/ui-kit";

export function StudioDashboard() {
  return (
    <div style={{ width: 720 }}>
      <StatGrid>
        <StatCard label="Subscribers" value={128000} />
        <StatCard label="Total views" value={2400000} />
        <StatCard label="Videos" value={42} />
      </StatGrid>
    </div>
  );
}

export function WithTrends() {
  return (
    <div style={{ width: 720 }}>
      <StatGrid>
        <StatCard label="Views" value={184000} delta="+12%" trend="up" />
        <StatCard label="Likes" value={9400} delta="+3%" trend="up" />
        <StatCard label="Comments" value={1280} delta="-8%" trend="down" />
      </StatGrid>
    </div>
  );
}
