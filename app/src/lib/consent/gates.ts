import type { ConsentCategories, ConsentDecision } from "./domain";
import { isCurrentConsentDecision } from "./persistence";

export type ConsentCategory = keyof ConsentCategories;

export function canUseConsentCategory(
  decision: ConsentDecision | null,
  category: ConsentCategory,
  now = new Date(),
): boolean {
  if (category === "necessary") return true;
  return isCurrentConsentDecision(decision, now) && decision.categories[category];
}
