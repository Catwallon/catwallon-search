import { CrawlerService } from "./service/crawler.service";

const crawlerService: CrawlerService = new CrawlerService();

crawlerService.crawlWebsite("https://en.wikipedia.org");
