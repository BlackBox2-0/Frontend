"use client";

import ActivityFeed from "./ActivityFeed";
import BottomStats from "./BottomStats";
import DashboardHeader from "./DashboardHeader";
import KPICards from "./KPICards";
import ThreatScoreRing from "./ThreatScoreRing";

export default function Dashboard() {
  return (
    <div className="text-[var(--text-primary)]">
      <DashboardHeader />
      <KPICards />
      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[38fr_62fr]">
        <ThreatScoreRing />
        <ActivityFeed />
      </section>
      <BottomStats />
    </div>
  );
}
