import features from "../config/features";

export default function useFeatures(user) {
  const credit = user?.credit ?? 0;

  const can = (key) => {
    const f = features[key];
    if (!f || !f.enabled) return false;
    return credit >= (f.minCredit ?? 0);
  };

  return {
    can,
    raw: features,
  };
}
