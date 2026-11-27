export type DocumentKind = "DNI" | "CUIT";

/**
 * Strips all non-numeric characters from a document value.
 */
export function stripDocumentDigits(value?: string | number | null): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\D/g, "");
}

/**
 * Detects whether a numeric document string represents a DNI (7-9 digits)
 * or a CUIT/CUIL (10-11 digits).
 */
export function detectDocumentKind(value?: string | number | null): DocumentKind {
  const digits = stripDocumentDigits(value);
  return digits.length > 9 ? "CUIT" : "DNI";
}

/**
 * Applies the visual XX-XXXXXXXX-X hyphen mask to a raw digit string for CUIT/CUIL.
 */
export function formatCuitMask(rawDigits: string): string {
  const digits = stripDocumentDigits(rawDigits).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
}

/**
 * Formats a raw document number according to its detected or forced kind.
 */
export function formatDocumentValue(
  value?: string | number | null,
  forcedKind?: DocumentKind
): string {
  const digits = stripDocumentDigits(value);
  if (!digits) return "";
  const kind = forcedKind ?? detectDocumentKind(digits);
  return kind === "CUIT" ? formatCuitMask(digits) : digits.slice(0, 9);
}

/**
 * Validates that a document string is either a valid DNI (7-9 digits)
 * or a valid CUIT/CUIL (11 digits).
 */
export function isValidDniOrCuit(value?: string | number | null): boolean {
  const digits = stripDocumentDigits(value);
  return (digits.length >= 7 && digits.length <= 9) || digits.length === 11;
}

/**
 * Returns structured display metadata for badges, cards, tables, and ARCA mapping.
 */
export function getDocumentDisplayInfo(value?: string | number | null): {
  kind: DocumentKind;
  label: "DNI" | "CUIT/CUIL";
  formatted: string;
  badgeText: string;
  arcaDocTipo: 96 | 80 | 99;
} {
  const digits = stripDocumentDigits(value);
  if (!digits || digits === "0") {
    return {
      kind: "DNI",
      label: "DNI",
      formatted: "---",
      badgeText: "Sin Identificar",
      arcaDocTipo: 99,
    };
  }

  const kind = detectDocumentKind(digits);
  if (kind === "CUIT") {
    const formatted = formatCuitMask(digits);
    return {
      kind: "CUIT",
      label: "CUIT/CUIL",
      formatted,
      badgeText: `CUIT/CUIL: ${formatted}`,
      arcaDocTipo: 80,
    };
  }

  return {
    kind: "DNI",
    label: "DNI",
    formatted: digits,
    badgeText: `DNI: ${digits}`,
    arcaDocTipo: 96,
  };
}

