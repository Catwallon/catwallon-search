import axios, { AxiosResponse } from "axios";
import Redis from "ioredis";
import { CheerioAPI, load } from "cheerio";
import { PageModel } from "../models/page.model";

export class PageService {
  private redis: Redis = new Redis({ host: "redis", port: 6379 });

  async crawl(url: string): Promise<void> {
    const parsedUrl: URL = new URL(url);

    const cleanUrl: string = parsedUrl.origin + parsedUrl.pathname;

    console.log(`Crawling page ${cleanUrl}`);

    try {
      const pageRes: AxiosResponse<string> = await axios.get(cleanUrl);
      const page: string = pageRes.data;

      const internalUrlsFound: string[] = [];
      const externalUrlsFound: string[] = [];

      const $: CheerioAPI = load(page);

      const title: string = $("title").text().trim();

      $("a").each((_, element) => {
        let foundUrl: string | undefined = $(element).attr("href");
        if (foundUrl) {
          if (
            !foundUrl.startsWith("http://") &&
            !foundUrl.startsWith("https://")
          ) {
            if (!foundUrl.startsWith("/")) {
              foundUrl = "/" + foundUrl;
            }
            foundUrl = parsedUrl.origin + "/" + foundUrl;
          }

          let foundParsedUrl: URL = new URL(foundUrl);

          if (foundParsedUrl.host === parsedUrl.host) {
            internalUrlsFound.push(
              foundParsedUrl.origin + foundParsedUrl.pathname
            );
          } else {
            externalUrlsFound.push(
              foundParsedUrl.origin + foundParsedUrl.pathname
            );
          }
        }
      });

      try {
        await PageModel.create({
          url: cleanUrl,
          title: title,
        });
      } catch {
        console.warn(`Page ${cleanUrl} already exists in the database.`);

        return;
      }

      if (internalUrlsFound.length > 0) {
        await this.redis.rpush("pageUrls", ...internalUrlsFound);
      }

      if (externalUrlsFound.length > 0) {
        await this.redis.lpush("pageUrls", ...externalUrlsFound);
      }
    } catch (error) {
      console.warn(
        `Can't fetch page (${error.response?.status || 500}): ${cleanUrl}`
      );
    }
  }
}
