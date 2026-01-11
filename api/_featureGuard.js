import features from "../src/config/features";

export function requireFeature(name) {
  if (!features[name]?.enabled) {
    throw new Error("Feature disabled");
  }
}
