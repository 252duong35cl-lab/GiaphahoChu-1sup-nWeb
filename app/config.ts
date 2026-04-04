const config = {
  siteName:
    process.env.SITE_NAME ||
    `Gia phả họ CHU`,
  exampleEmail: process.env.EXAMPLE_EMAIL || "",
  examplePassword: process.env.EXAMPLE_PASSWORD || "",
  demoDomain:
    process.env.DEMO_DOMAIN || "https://giaphahochu.vercel.app/dashboard",
};

export default config;
