import {
  Schema,
  InferSchemaType,
  Model,
  model,
  HydratedDocument,
} from "mongoose";

const PageSchema = new Schema(
  {
    url: { type: String, required: true },
    title: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export type PageDocument = HydratedDocument<InferSchemaType<typeof PageSchema>>;

export class Page {
  id: string;
  url: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
}

export function toPage(doc: PageDocument): Page {
  return {
    id: doc._id.toString(),
    url: doc.url,
    title: doc.title,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const PageModel: Model<PageDocument> = model<PageDocument>(
  "Page",
  PageSchema
);
