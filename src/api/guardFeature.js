import features from "../config/features";
import { spendCredit } from "../utils/creditAction";

export async function guardFeature({ user, feature }) {
  const f = features[feature];

  if (!f || !f.enabled) {
    throw new Error("FEATURE_DISABLED");
  }

  if (user.credit < (f.minCredit ?? 0)) {
    throw new Error("NOT_ENOUGH_CREDIT");
  }

  // kredi düş
  if (f.minCredit > 0) {
    await spendCredit(user.id, f.minCredit);
  }

  return true;
}
