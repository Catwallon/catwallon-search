import { Page, PageModel } from "../models/page.model";
import { Website, WebsiteModel } from "../models/website.model";
import { PageService } from "./page.service";
import { WebsiteService } from "./website.service";
import Redis from "ioredis";

export class CrawlerService {
  private redis: Redis = new Redis({ host: "redis", port: 6379 });
  private websiteService: WebsiteService = new WebsiteService();
  private pageService: PageService = new PageService();

  async crawl(url: string): Promise<void> {
    const parsedUrl: URL = new URL(url);
    const cleanUrl: string = parsedUrl.origin + parsedUrl.pathname;

    const website: Website | null = await WebsiteModel.findOne({
      domain: parsedUrl.host,
    });
    if (!website) {
      await this.websiteService.crawl(parsedUrl.host);
    }

    const page: Page | null = await PageModel.findOne({ url: cleanUrl });
    if (!page) {
      await this.pageService.crawl(url);
    }

    const item: [string, string] | null = await this.redis.blpop("pageUrls", 0);

    if (item) {
      const nextUrl: string = item[1];

      await this.crawl(nextUrl);
    }
  }
}
