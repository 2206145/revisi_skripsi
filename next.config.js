const nextConfig = {
  images: { unoptimized: true },
  // Percepat bundling dengan tree-shaking library besar
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react"],
  },
  // Kompres response HTTP (gzip/brotli)
  compress: true,
};

module.exports = nextConfig;
