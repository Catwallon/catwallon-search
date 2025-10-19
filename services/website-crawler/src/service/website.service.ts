import axios, { AxiosResponse } from "axios";
import { WebsiteModel } from "../models/website.model";
import { ROBOT_NAME } from "../utils/consts";
import { parseStringPromise } from "xml2js";
import Redis from "ioredis";

export class WebsiteService {
  private redis = new Redis({ host: "redis", port: 6379 });

  private async recursiveSitemap(sitemapUrls: string[]): Promise<string[]> {
    const pageUrls: string[] = [];

    for (const sitemapUrl of sitemapUrls) {
      try {
        const sitemapXmlRes: AxiosResponse<string> = await axios.get(
          sitemapUrl
        );
        const sitemapXml: string = sitemapXmlRes.data;
        const sitemapXmlParsed = await parseStringPromise(sitemapXml);

        if (sitemapXmlParsed.sitemapindex) {
          const newSitemapUrls: string[] =
            sitemapXmlParsed.sitemapindex.sitemap.map((s: any) => s.loc[0]);

          const newPageUrls: string[] = await this.recursiveSitemap(
            newSitemapUrls
          );

          pageUrls.push(...newPageUrls);
        } else if (sitemapXmlParsed.urlset) {
          const newPageUrls: string[] = sitemapXmlParsed.urlset.url.map(
            (u: any) => u.loc[0]
          );

          pageUrls.push(...newPageUrls);
        }
      } catch (error) {
        console.warn(
          `Cant fetch sitemap (${error.response?.status || 500}): ${sitemapUrl}`
        );
      }
    }

    return pageUrls;
  }

  async crawl(domain: string): Promise<void> {
    const robotsTxtRes: AxiosResponse<string> = await axios.get(
      `https://${domain}/robots.txt`
    );
    const robotsTxt: string = robotsTxtRes.data;
    const robotsTxtLines: string[] = robotsTxt.split("\n");

    let allowedPaths: string[] = [];
    let disallowedPaths: string[] = [];
    let sitemapUrls: string[] = [];
    let crawlDelay: number | null = null;

    let currentUserAgent: string | null = null;

    for (const line of robotsTxtLines) {
      if (line.startsWith("User-agent:")) {
        currentUserAgent = line.substring("User-agent:".length).trim();
      }

      if (currentUserAgent === ROBOT_NAME || currentUserAgent === "*") {
        if (line.startsWith("Allow:")) {
          allowedPaths.push(line.substring("Allow:".length).trim());
        } else if (line.startsWith("Disallow:")) {
          disallowedPaths.push(line.substring("Disallow:".length).trim());
        } else if (line.startsWith("Sitemap:")) {
          sitemapUrls.push(line.substring("Sitemap:".length).trim());
        } else if (line.startsWith("Crawl-delay:")) {
          crawlDelay = parseInt(line.substring("Crawl-delay:".length).trim());
        }
      }
    }

    try {
      await WebsiteModel.create({
        domain,
        allowedPaths,
        disallowedPaths,
        crawlDelay,
      });
    } catch (error) {
      console.warn(`Website ${domain} already exists in the database.`);

      return;
    }

    const pageUrls: string[] = await this.recursiveSitemap(sitemapUrls);

    await this.redis.lpush("pageUrls", ...pageUrls);
  }
}
