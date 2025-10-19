import { WebsiteService } from "./website.service";

export class CrawlerService {
  private websiteService: WebsiteService = new WebsiteService();

  async crawl(url: string): Promise<void> {
    const parsedUrl: URL = new URL(url);

    await this.websiteService.crawl(parsedUrl.host);
  }
}
