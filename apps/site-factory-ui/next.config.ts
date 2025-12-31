import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@sf/shared"],
  turbopack: {
    root: path.join(__dirname, "../.."), // -> /Agence
  },
};

export default nextConfig;
