/**
 * SEO Service — dynamic meta tags, Open Graph, JSON-LD structured data.
 *
 * Usage: Call these helpers and pass results to react-helmet-async.
 * No UI changes — only provides data for existing Helmet components.
 */

export interface SEOMeta {
  title: string;
  description: string;
  canonical?: string;
  og: {
    title: string;
    description: string;
    type: string;
    url?: string;
    image?: string;
  };
  jsonLd?: Record<string, any>;
}

const BASE_URL = "https://academic-forge-flow.lovable.app";
const SITE_NAME = "RCollab";

export function buildPageMeta(
  title: string,
  description: string,
  path?: string,
  image?: string
): SEOMeta {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical = path ? `${BASE_URL}${path}` : undefined;

  return {
    title: fullTitle.substring(0, 60),
    description: description.substring(0, 160),
    canonical,
    og: {
      title: fullTitle.substring(0, 60),
      description: description.substring(0, 160),
      type: "website",
      url: canonical,
      image: image ?? `${BASE_URL}/og-image.png`,
    },
  };
}

export function buildOfferMeta(offer: {
  title: string;
  description?: string;
  id: string;
}): SEOMeta {
  return buildPageMeta(
    offer.title,
    offer.description?.substring(0, 160) ?? `Professional opportunity on ${SITE_NAME}`,
    `/offers/${offer.id}`
  );
}

export function buildProfileMeta(profile: {
  full_name?: string;
  university?: string;
  id: string;
}): SEOMeta {
  const name = profile.full_name ?? "Professional";
  return buildPageMeta(
    `${name} - Profile`,
    `${name}${profile.university ? ` at ${profile.university}` : ""} on ${SITE_NAME}`,
    `/profile/${profile.id}`
  );
}

export function buildInstitutionMeta(org: {
  name: string;
  type: string;
  id: string;
}): SEOMeta {
  return buildPageMeta(
    `${org.name} - ${org.type}`,
    `${org.name} institutional dashboard and metrics on ${SITE_NAME}`,
    `/org/${org.id}`
  );
}

export function buildJsonLd(type: string, data: Record<string, any>): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };
}

export function buildOrganizationJsonLd(): Record<string, any> {
  return buildJsonLd("Organization", {
    name: SITE_NAME,
    url: BASE_URL,
    description: "Institutional-grade professional execution platform with trust-backed escrow and AI matching",
    sameAs: [],
  });
}

export function buildWebPageJsonLd(title: string, description: string, path: string): Record<string, any> {
  return buildJsonLd("WebPage", {
    name: title,
    description,
    url: `${BASE_URL}${path}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
  });
}
