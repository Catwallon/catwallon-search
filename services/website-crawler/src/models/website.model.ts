import {
  Schema,
  InferSchemaType,
  Model,
  model,
  HydratedDocument,
} from "mongoose";

const WebsiteSchema = new Schema(
  {
    domain: { type: String, required: true },
    allowedPaths: { type: [String], default: [] },
    disallowedPaths: { type: [String], default: [] },
    sitemapUrls: { type: [String], default: [] },
    crawlDelay: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

export type WebsiteDocument = HydratedDocument<
  InferSchemaType<typeof WebsiteSchema>
>;

export class Website {
  id: string;
  domain: string;
  allowedPaths: string[];
  disallowedPaths: string[];
  sitemapUrls: string[];
  updatedAt: Date;
  createdAt: Date;
}

export function toWebsite(doc: WebsiteDocument): Website {
  return {
    id: doc._id.toString(),
    domain: doc.domain,
    allowedPaths: doc.allowedPaths,
    disallowedPaths: doc.disallowedPaths,
    sitemapUrls: doc.sitemapUrls,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const WebsiteModel: Model<WebsiteDocument> = model<WebsiteDocument>(
  "Website",
  WebsiteSchema
);
