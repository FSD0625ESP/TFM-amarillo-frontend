const displayNamesCache = new Map();

const getDisplayNames = (locale = "es") => {
  if (!displayNamesCache.has(locale)) {
    displayNamesCache.set(
      locale,
      new Intl.DisplayNames([locale], { type: "region" })
    );
  }
  return displayNamesCache.get(locale);
};

export const formatCountry = (code, locale = "es") => {
  if (!code) return "";
  const normalized = code.toString().trim().toUpperCase();
  if (!normalized) return "";

  try {
    const names = getDisplayNames(locale);
    return names.of(normalized) || normalized;
  } catch {
    return normalized;
  }
};
