import { CrawlerService } from "./service/crawler.service";
import mongoose from "mongoose";

const crawlerService: CrawlerService = new CrawlerService();

try {
  await mongoose.connect("mongodb://mongo:27017");
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Connection error:", error);
}

crawlerService.crawl("https://youtube.com");
