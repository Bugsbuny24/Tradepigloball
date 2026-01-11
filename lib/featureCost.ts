import registry from "./feature_registry.json";

export function getFeatureCost(feature: string) {
  return registry[feature]?.cost ?? null;
}
