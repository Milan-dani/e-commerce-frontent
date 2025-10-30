/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "picsum.photos",
      "source.unsplash.com",
      "via.placeholder.com",
      "loremflickr.com",
      "*",
    ],
  },
};

export default nextConfig;
