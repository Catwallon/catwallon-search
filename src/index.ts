import { CrawlerService } from "./service/crawler.service";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

const crawlerService: CrawlerService = new CrawlerService();
const mongod: MongoMemoryServer = await MongoMemoryServer.create();

try {
  await mongoose.connect(mongod.getUri());
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Connection error:", error);
}

crawlerService.crawlWebsite("https://en.wikipedia.org");
