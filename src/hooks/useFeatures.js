import features from "../config/features";

export default function useFeatures(user) {
  const credit = user?.credit ?? 0;
  const IS_DEV = import.meta.env.DEV;
  const DEBUG = new URLSearchParams(window.location.search).get("debug") === "true";

  const can = (key) => {
    const f = features[key];
    if (!f || !f.enabled) return false;
    if (IS_DEV && DEBUG) return true;
    return credit >= (f.minCredit ?? 0);
  };

  return { can, raw: features };
}
