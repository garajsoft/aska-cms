import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";
import { buildStyleTokensCss, type StyleDoc } from "./tokens";
import { buildTypographyCss, type TypographyStyleDoc } from "./typography";

export async function getStyleTokensCss(): Promise<string> {
  const p = await getPayload({ config });
  const { docs } = await p.find({
    collection: "styles",
    limit: 500,
    depth: 0,
  });
  return buildStyleTokensCss(docs as unknown as StyleDoc[]);
}

export async function getStyleTypographyCss(): Promise<string> {
  const p = await getPayload({ config });
  // depth: 1 so a Typography Scale doc's `customFontFile` upload relationship
  // resolves to its `url`/`filename`.
  const { docs } = await p.find({
    collection: "styles",
    limit: 500,
    depth: 1,
  });
  return buildTypographyCss(docs as unknown as TypographyStyleDoc[]);
}
