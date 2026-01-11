import useFeatures from "../hooks/useFeatures";

export default function Feature({ on, children }) {
  const f = useFeatures();
  if (!f[on]) return null;
  return children;
}
