import axios, { AxiosResponse } from "axios";
import {
  toWebsite,
  WebsiteDocument,
  WebsiteModel,
} from "../models/website.model";
import { ROBOT_NAME } from "../utils/consts";
import { parseStringPromise } from "xml2js";
import { pageUrls } from "../utils/vars";

export class WebsiteService {
  private async recursiveSitemap(sitemapUrls: string[]): Promise<void> {
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

          await this.recursiveSitemap(newSitemapUrls);
        } else if (sitemapXmlParsed.urlset) {
          const newPageUrls: string[] = sitemapXmlParsed.urlset.url.map(
            (u: any) => u.loc[0]
          );

          pageUrls.push(...newPageUrls);
        }
      } catch (error) {
        console.error("Error fetching sitemap:", sitemapUrl);
      }
    }
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

    const websiteDoc: WebsiteDocument = await WebsiteModel.create({
      domain,
      allowedPaths,
      disallowedPaths,
      sitemapUrls,
      crawlDelay,
    });

    await this.recursiveSitemap(websiteDoc.sitemapUrls);
  }
}
