import features from "../config/features";

export default function AdminFeatures() {
  return (
    <div style={{ padding: 20 }}>
      <h1>🛠 Feature Control</h1>

      {Object.entries(features).map(([key, f]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <strong>{key}</strong> →
          enabled: {String(f.enabled)} |
          minCredit: {f.minCredit}
        </div>
      ))}
    </div>
  );
}
