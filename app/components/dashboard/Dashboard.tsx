"use client";

import ActivityFeed from "./ActivityFeed";
import BottomStats from "./BottomStats";
import DashboardHeader from "./DashboardHeader";
import IncidentSummary from "./IncidentSummary";
import KPICards from "./KPICards";
import NetworkActivityMap from "./NetworkActivityMap";
import ThreatScoreRing from "./ThreatScoreRing";

export default function Dashboard() {
  return (
    <div className="text-[var(--text-primary)]">
      <DashboardHeader />
      <KPICards />
      <IncidentSummary />
      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(280px,38fr)_minmax(0,62fr)]">
        <div className="min-w-0">
          <ThreatScoreRing />
        </div>
        <div className="min-w-0">
          <ActivityFeed />
        </div>
      </section>
      <NetworkActivityMap />
      <BottomStats />
    </div>
  );
}
