import { FEATURES } from "../src/config/features";

export function requireFeature(name) {
  if (!FEATURES[name]) {
    throw new Error("Feature disabled");
  }
}
