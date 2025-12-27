import { defineCollection, z } from "astro:content";
import { microCMSContentLoader } from "microcms-astro-loader";

// Lecture Collection
const lectureCollection = defineCollection({
  loader: microCMSContentLoader({
    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: import.meta.env.MICROCMS_API_KEY,
    endpoint: "lectures",
    queries: {
      fields: [
        "id",
        "title",
        "guest_name",
        "belonging",
        "event_date",
        "eyecatch",
        "content",
        "createdAt",
        "updatedAt",
        "publishedAt",
        "revisedAt",
      ],
      limit: 100,
    },
  }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    guest_name: z.string(),
    belonging: z.string().optional(),
    event_date: z.string(),
    eyecatch: z
      .object({
        url: z.string().url(),
        height: z.number(),
        width: z.number(),
      })
      .optional(),
    content: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
    revisedAt: z.string(),
  }),
});

// Member Collection
const memberCollection = defineCollection({
  loader: microCMSContentLoader({
    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: import.meta.env.MICROCMS_API_KEY,
    endpoint: "members",
    queries: {
      fields: [
        "id",
        "name",
        "position",
        "year",
        "description",
        "status",
        "image",
        "createdAt",
        "updatedAt",
        "publishedAt",
        "revisedAt",
      ],
      limit: 100,
    },
  }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    position: z.string(),
    year: z.string(),
    description: z.string(),
    status: z
      .union([
        z.literal("current"),
        z.literal("graduate"),
        z.array(z.union([z.literal("current"), z.literal("graduate")])),
      ])
      .optional(),
    image: z
      .object({
        url: z.string().url(),
        height: z.number(),
        width: z.number(),
      })
      .optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
    revisedAt: z.string(),
  }),
});

// Upcoming Event Collection
const upcomingEventCollection = defineCollection({
  loader: microCMSContentLoader({
    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: import.meta.env.MICROCMS_API_KEY,
    endpoint: "upcoming_events",
    queries: {
      fields: [
        "id",
        "title",
        "event_date",
        "description",
        "location",
        "createdAt",
        "updatedAt",
        "publishedAt",
        "revisedAt",
      ],
      limit: 100,
    },
  }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    event_date: z.string(),
    description: z.string(),
    location: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
    revisedAt: z.string(),
  }),
});

// Media Coverage Collection
const mediaCoverageCollection = defineCollection({
  loader: microCMSContentLoader({
    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: import.meta.env.MICROCMS_API_KEY,
    endpoint: "media_coverage",
    queries: {
      fields: [
        "id",
        "title",
        "media_name",
        "publish_date",
        "url",
        "description",
        "createdAt",
        "updatedAt",
        "publishedAt",
        "revisedAt",
      ],
      limit: 100,
    },
  }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    media_name: z.string(),
    publish_date: z.string(),
    url: z.string().url().optional(),
    description: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
    revisedAt: z.string(),
  }),
});

// Note: faqs and sponsors are repeater fields in the "pages" singleton endpoint,
// not independent list endpoints. They should be accessed via getPages() from microcms.ts

export const collections = {
  lectures: lectureCollection,
  members: memberCollection,
  upcoming_events: upcomingEventCollection,
  media_coverage: mediaCoverageCollection,
};
