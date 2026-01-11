// api/_featureGuard.js
import features from "../src/config/features.js";

export function requireFeature(name) {
  if (!features[name]?.enabled) {
    throw new Error("Feature disabled");
  }
}
