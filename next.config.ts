import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Type-check via `npx tsc --noEmit` in CI, not during `next build`,
  // so a full disk on the deploy host doesn't kill the whole build on
  // the .tsbuildinfo write.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default withPayload(nextConfig);
