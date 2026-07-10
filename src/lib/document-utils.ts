export type DocumentKind = "Google Doc" | "Google Slides" | "Google Form" | "Google Sheet" | "Link";

const GOOGLE_DOC_PATTERN = /docs\.google\.com\/(document|presentation|spreadsheets|forms)\/d\/([a-zA-Z0-9_-]+)/;

/**
 * Detects the kind of a document from its share URL and derives an
 * iframe-embeddable URL for the Google types. Arbitrary non-Google links
 * often refuse to be iframed (X-Frame-Options/CSP), so those get no
 * embedUrl and fall back to "open in new tab" in the viewer.
 */
export function getDocumentEmbed(url: string): { kind: DocumentKind; embedUrl: string | null } {
  const match = url.match(GOOGLE_DOC_PATTERN);
  if (!match) return { kind: "Link", embedUrl: null };

  const [, type, id] = match;
  switch (type) {
    case "document":
      return { kind: "Google Doc", embedUrl: `https://docs.google.com/document/d/${id}/preview` };
    case "presentation":
      return {
        kind: "Google Slides",
        embedUrl: `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000`,
      };
    case "spreadsheets":
      return { kind: "Google Sheet", embedUrl: `https://docs.google.com/spreadsheets/d/${id}/preview` };
    case "forms":
      return { kind: "Google Form", embedUrl: `https://docs.google.com/forms/d/${id}/viewform?embedded=true` };
    default:
      return { kind: "Link", embedUrl: null };
  }
}
