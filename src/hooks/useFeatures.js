import features from "../config/features";

export default function useFeatures(user) {
  const credit = user?.credit ?? 0;

  const params = new URLSearchParams(window.location.search);
  const DEBUG = params.get("debug") === "true";
  const IS_DEV = import.meta.env.DEV;

  const can = (key) => {
    const f = features[key];
    if (!f || !f.enabled) return false;

    // v48.5: DEV debug override
    if (IS_DEV && DEBUG) return true;

    return credit >= (f.minCredit ?? 0);
  };

  return {
    can,
    raw: features,
    debug: IS_DEV && DEBUG,
  };
}
