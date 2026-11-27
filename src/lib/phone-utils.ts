export interface PhoneCountry {
  iso: string;
  name: string;
  dialCode: string;
  displayCode: string;
  flag: string;
  placeholder: string;
}

/**
 * Supported country prefixes for WhatsApp / Evolution API phone normalization.
 * Argentina uses the mandatory `549` mobile prefix convention.
 */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "AR", name: "Argentina", dialCode: "549", displayCode: "+54 9", flag: "🇦🇷", placeholder: "2604821000" },
  { iso: "CL", name: "Chile", dialCode: "56", displayCode: "+56", flag: "🇨🇱", placeholder: "912345678" },
  { iso: "UY", name: "Uruguay", dialCode: "598", displayCode: "+598", flag: "🇺🇾", placeholder: "99123456" },
  { iso: "BR", name: "Brasil", dialCode: "55", displayCode: "+55", flag: "🇧🇷", placeholder: "11912345678" },
  { iso: "PY", name: "Paraguay", dialCode: "595", displayCode: "+595", flag: "🇵🇾", placeholder: "981123456" },
  { iso: "BO", name: "Bolivia", dialCode: "591", displayCode: "+591", flag: "🇧🇴", placeholder: "71234567" },
  { iso: "PE", name: "Perú", dialCode: "51", displayCode: "+51", flag: "🇵🇪", placeholder: "912345678" },
  { iso: "CO", name: "Colombia", dialCode: "57", displayCode: "+57", flag: "🇨🇴", placeholder: "3001234567" },
  { iso: "EC", name: "Ecuador", dialCode: "593", displayCode: "+593", flag: "🇪🇨", placeholder: "991234567" },
  { iso: "VE", name: "Venezuela", dialCode: "58", displayCode: "+58", flag: "🇻🇪", placeholder: "4121234567" },
  { iso: "MX", name: "México", dialCode: "52", displayCode: "+52", flag: "🇲🇽", placeholder: "5512345678" },
  { iso: "CR", name: "Costa Rica", dialCode: "506", displayCode: "+506", flag: "🇨🇷", placeholder: "81234567" },
  { iso: "PA", name: "Panamá", dialCode: "507", displayCode: "+507", flag: "🇵🇦", placeholder: "61234567" },
  { iso: "DO", name: "República Dominicana", dialCode: "1809", displayCode: "+1 809", flag: "🇩🇴", placeholder: "2345678" },
  { iso: "US", name: "Estados Unidos / Canadá", dialCode: "1", displayCode: "+1", flag: "🇺🇸", placeholder: "2025550123" },
  { iso: "ES", name: "España", dialCode: "34", displayCode: "+34", flag: "🇪🇸", placeholder: "612345678" },
  { iso: "IT", name: "Italia", dialCode: "39", displayCode: "+39", flag: "🇮🇹", placeholder: "3123456789" },
  { iso: "PT", name: "Portugal", dialCode: "351", displayCode: "+351", flag: "🇵🇹", placeholder: "912345678" },
  { iso: "FR", name: "Francia", dialCode: "33", displayCode: "+33", flag: "🇫🇷", placeholder: "612345678" },
  { iso: "DE", name: "Alemania", dialCode: "49", displayCode: "+49", flag: "🇩🇪", placeholder: "15123456789" },
  { iso: "GB", name: "Reino Unido", dialCode: "44", displayCode: "+44", flag: "🇬🇧", placeholder: "7123456789" },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0]; // Argentina (549)

const COUNTRIES_BY_PREFIX_DESC = [...PHONE_COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
);

/**
 * Strips all non-numeric characters from a phone string.
 */
export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Cleans a local phone number and combines it with the selected country dial code.
 * Returns an empty string when no local digits are present.
 */
export function normalizePhoneNumber(dialCode: string, localNumber: string): string {
  const cleanDial = stripNonDigits(dialCode);
  let cleanLocal = stripNonDigits(localNumber);

  if (!cleanLocal) return "";

  // Strip leading trunk '0' (e.g. 02604... -> 2604...)
  if (cleanLocal.startsWith("0")) {
    cleanLocal = cleanLocal.replace(/^0+/, "");
  }

  if (!cleanLocal) return "";

  return `${cleanDial}${cleanLocal}`;
}

/**
 * Parses a stored or pasted phone number into its matching country and local digits.
 * Legacy local numbers without a country prefix default to Argentina (`549`).
 */
export function parsePhoneNumber(fullPhone?: string | null): {
  country: PhoneCountry;
  localNumber: string;
} {
  const digits = stripNonDigits(fullPhone || "");
  if (!digits) {
    return { country: DEFAULT_PHONE_COUNTRY, localNumber: "" };
  }

  // Exact match for Argentina Evolution API format (549...)
  if (digits.startsWith("549")) {
    return {
      country: DEFAULT_PHONE_COUNTRY,
      localNumber: digits.slice(3),
    };
  }

  // Legacy Argentina format without mobile '9' (54...)
  if (digits.startsWith("54") && digits.length >= 10) {
    return {
      country: DEFAULT_PHONE_COUNTRY,
      localNumber: digits.slice(2).replace(/^0+/, ""),
    };
  }

  // Match other known country prefixes (longest prefix first)
  for (const country of COUNTRIES_BY_PREFIX_DESC) {
    if (country.iso === "AR") continue;
    if (digits.startsWith(country.dialCode) && digits.length > country.dialCode.length + 4) {
      return {
        country,
        localNumber: digits.slice(country.dialCode.length),
      };
    }
  }

  // Fallback: assume local number for default country (Argentina)
  return {
    country: DEFAULT_PHONE_COUNTRY,
    localNumber: digits.replace(/^0+/, ""),
  };
}

