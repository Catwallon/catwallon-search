import { CrawlerService } from "./service/crawler.service";
import mongoose from "mongoose";
import pLimit, { LimitFunction } from "p-limit";

const crawlerService: CrawlerService = new CrawlerService();

try {
  await mongoose.connect("mongodb://mongo:27017");

  const limit: LimitFunction = pLimit(8);
  const tasks = Array(9)
    .fill(null)
    .map(() => limit(() => crawlerService.crawl("https://www.wikipedia.org/")));

  await Promise.all(tasks);
} catch (error) {
  console.error("Connection error:", error);
}
