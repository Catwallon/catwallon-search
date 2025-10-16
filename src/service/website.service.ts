import axios, { AxiosResponse } from "axios";
import {
  toWebsite,
  WebsiteDocument,
  WebsiteModel,
} from "../models/website.model";
import { ROBOT_NAME } from "../utils/consts";

export class WebsiteService {
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

    console.log(toWebsite(websiteDoc).sitemapUrls);
  }
}
