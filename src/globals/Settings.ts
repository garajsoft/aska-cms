import type { GlobalConfig, Field } from "payload";

const providerFields = (
  provider: "stripe" | "paypal" | "square",
  extra: Field[] = []
): Field[] => [
  {
    name: "enabled",
    type: "checkbox",
    defaultValue: false,
    admin: { description: `Turn ${provider} on at checkout.` },
  },
  {
    name: "mode",
    type: "select",
    defaultValue: "test",
    options: [
      { label: "Test / sandbox", value: "test" },
      { label: "Live", value: "live" },
    ],
    admin: {
      condition: (_data, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  ...extra,
  {
    name: "publishableKey",
    type: "text",
    admin: {
      description: "Client-side (publishable) key.",
      condition: (_data, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: "secretKey",
    type: "text",
    admin: {
      description:
        "Server secret. Stored in the database — restrict admin access accordingly.",
      condition: (_data, siblingData) => Boolean(siblingData?.enabled),
    },
  },
  {
    name: "webhookSecret",
    type: "text",
    admin: {
      description: "Signing secret for provider webhooks.",
      condition: (_data, siblingData) => Boolean(siblingData?.enabled),
    },
  },
];

export const Settings: GlobalConfig = {
  slug: "settings",
  access: { read: () => true },
  admin: { description: "Site-wide settings." },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "General",
          fields: [
            {
              name: "homepage",
              type: "relationship",
              relationTo: "pages",
              admin: {
                description:
                  "The page rendered at /. Leave empty to show the page list.",
              },
            },
          ],
        },
        {
          label: "Payments",
          description:
            "Connect payment providers. Keys are stored in the database — until we wire dedicated flows, edits here don't automatically override any env-var credentials used by the ecommerce plugin.",
          fields: [
            {
              name: "stripe",
              type: "group",
              label: "Stripe",
              fields: providerFields("stripe"),
            },
            {
              name: "paypal",
              type: "group",
              label: "PayPal",
              fields: providerFields("paypal", [
                {
                  name: "clientId",
                  type: "text",
                  admin: {
                    description: "PayPal client ID.",
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
              ]),
            },
            {
              name: "square",
              type: "group",
              label: "Square",
              fields: providerFields("square", [
                {
                  name: "locationId",
                  type: "text",
                  admin: {
                    description: "Square location ID.",
                    condition: (_data, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
              ]),
            },
          ],
        },
      ],
    },
  ],
};
