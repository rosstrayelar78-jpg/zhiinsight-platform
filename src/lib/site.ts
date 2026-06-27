export const siteConfig = {
  name: "知璟银发智库 SERI",
  description: "AI 驱动的中国银发经济产业研究平台。",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

