import { createClient, type MicroCMSQueries, type MicroCMSImage } from "microcms-js-sdk";

// Lecture Type Definition
export type Lecture = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  guest_name: string;
  belonging?: string; // Speaker's organization/affiliation
  event_date: string;
  eyecatch?: MicroCMSImage;
  content?: string;
};

export type LectureResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Lecture[];
};

// Pages Type Definition (Object format - singleton)
export type Pages = {
  hero_title: string;
  hero_subtitle: string;
  about_content: string;
  history_content: string;
};

// Member Type Definition
export type Member = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  name: string;
  position: string;
  year: string;
  description: string;
  status?: 'current' | 'graduate' | ('current' | 'graduate')[]; // 在校生 or 卒業生 (配列対応)
  image?: MicroCMSImage;
};

export type MemberResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Member[];
};

// Upcoming Event Type Definition
export type UpcomingEvent = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  event_date: string;
  description: string;
  location?: string;
};

export type UpcomingEventResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: UpcomingEvent[];
};

// Media Coverage Type Definition
export type MediaCoverage = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  media_name: string;
  publish_date: string;
  url?: string;
  description: string;
};

export type MediaCoverageResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: MediaCoverage[];
};

// MicroCMS Client
export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

// Helper functions for Lectures
export const getLectures = async (queries?: MicroCMSQueries) => {
  return await client.get<LectureResponse>({ endpoint: "lectures", queries });
};

export const getLectureDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return await client.getListDetail<Lecture>({
    endpoint: "lectures",
    contentId,
    queries,
  });
};

// Helper function for Pages (Object format)
export const getPages = async () => {
  return await client.getObject<Pages>({ endpoint: "pages" });
};

// Helper functions for Members
export const getMembers = async (queries?: MicroCMSQueries) => {
  return await client.get<MemberResponse>({ endpoint: "members", queries });
};

// Helper functions for Upcoming Events
export const getUpcomingEvents = async (queries?: MicroCMSQueries) => {
  return await client.get<UpcomingEventResponse>({ endpoint: "upcoming_events", queries });
};

// Helper functions for Media Coverage
export const getMediaCoverage = async (queries?: MicroCMSQueries) => {
  return await client.get<MediaCoverageResponse>({ endpoint: "media_coverage", queries });
};
