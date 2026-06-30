import type { GeheimtippDerWoche, Neighborhood, Spot } from "../data/types";
import type { Lang } from "./lang";

// Pickers for localized DATA content (spots/neighborhoods/hidden gem). The base
// fields are English; the `de`/`*De` fields hold the German variant. RN-free so
// it stays unit-testable.

/** Localized text fields of a spot (name/hook/description/tags/imageNote). */
export function spotText(s: Spot, lang: Lang) {
  if (lang === "de" && s.de) {
    return {
      name: s.de.name ?? s.name,
      hook: s.de.hook,
      description: s.de.description,
      tags: s.de.tags,
      imageNote: s.de.imageNote,
    };
  }
  return {
    name: s.name,
    hook: s.hook,
    description: s.description,
    tags: s.tags,
    imageNote: s.imageNote,
  };
}

/** Localized neighborhood one-liner. */
export function neighborhoodBlurb(n: Neighborhood, lang: Lang): string {
  return lang === "de" && n.blurbDe ? n.blurbDe : n.blurb;
}

/** Localized hidden-gem loading teaser. */
export function geheimtippTeaser(g: GeheimtippDerWoche, lang: Lang): string {
  return lang === "de" && g.teaserDe ? g.teaserDe : g.teaser;
}
