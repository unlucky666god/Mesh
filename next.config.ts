import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Игнорируем ошибки типов при сборке
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
