import CommandBar from "../components/CommandBar";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  return (
    <>
      <CommandBar />

      <div className="stats-grid">
        <StatCard title="System Status" value="🟢 Stable" />
        <StatCard title="Credit Burn" value="Normal" />
        <StatCard title="Spam Risk" value="Low" />
        <StatCard title="AI Load" value="OK" />
      </div>
    </>
  );
}
