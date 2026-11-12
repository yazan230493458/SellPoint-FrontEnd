export function isSafeImageSrc(
  src: string | null | undefined,
): src is string {
  if (!src) return false;
  if (src.startsWith("data:image/")) return true;
  if (src.startsWith("/") && !src.startsWith("//") && !src.includes("\\")) {
    return true;
  }

  try {
    const url = new URL(src);
    if (url.protocol === "https:") return true;
    return (
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      url.pathname.startsWith("/uploads/")
    );
  } catch {
    return false;
  }
}

export function isSafeInternalHref(
  href: string | null | undefined,
): href is string {
  if (!href) return false;

  const value = href.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return false;
  }

  const lower = value.toLowerCase();
  return !lower.includes("javascript:") && !lower.includes("data:");
}
