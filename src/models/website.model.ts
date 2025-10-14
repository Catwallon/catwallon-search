import mongoose, { Schema, Document } from "mongoose";

export interface Website {
  domain: string;
  allowedPaths: string[];
  disallowedPaths: string[];
  sitemapUrls: string[];
  crawlDelay: number | null;
  lastCrawledAt: Date;
}

const WebsiteSchema: Schema = new Schema({
  domain: { type: String, required: true },
  allowedPaths: { type: [String], default: [] },
  disallowedPaths: { type: [String], default: [] },
  sitemapUrls: { type: [String], default: [] },
  crawlDelay: { type: Number, default: null },
  lastCrawledAt: { type: Date, default: null },
});

export const WebsiteModel: mongoose.Model<Website & Document> = mongoose.model<
  Website & Document
>("Website", WebsiteSchema);
