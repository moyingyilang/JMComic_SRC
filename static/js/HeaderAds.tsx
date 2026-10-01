import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGlobalConfig } from "../../GlobalContext";
import { getRandomItems } from "../../utils/Function";
import { trackAdEvent, useAdImpression } from "../../utils/analytics";

const HeaderAds = () => {
  const { config } = useGlobalConfig();
  const { adsContent, setting } = config;

  const computeLinks = (content: any) => {
    const links = content?.link?.exchange_link_top;
    if (!links) return [];
    const LinksAdd = links.show_max - (links.first_links?.length ?? 0);
    const { items: secondRandomItem } = getRandomItems(links.second_links, LinksAdd);
    return [...(links.first_links || []), ...secondRandomItem];
  };

  const [allLinks, setAllLinks] = useState<any[]>(() => computeLinks(adsContent));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllLinks(computeLinks(adsContent));
  }, [adsContent]);

  useAdImpression(
    containerRef,
    true,
    () =>
      trackAdEvent("jm3_ad_impression", {
        adKey: "exchange_link_top",
        ad_desc: "exchange_link_top",
        adName: "exchange_link_top",
      }),
    adsContent?.length
  );

  const splicingLink = (link: string) => {
    const query = link.split("?")[1];
    return query ? `/pay?${query}` : "/pay";
  };

  return (
    <div className="w-full bg-nbk flex flex-wrap gap-2 text-og text-base py-1" ref={containerRef}>
      {allLinks.map((item: any, index: number) => {
        const isPayment = item.link.includes("payment?");
        const onClick = () =>
          trackAdEvent("jm3_ad_click", {
            adKey: "exchange_link_top",
            ad_desc: "exchange_link_top",
            adName: item.name,
          });

        return isPayment ? (
          <Link
            key={index}
            to={splicingLink(item.link)}
            className="flex-[0_0_calc(25%-6px)] text-center"
            onClick={onClick}
          >
            {item.name}
          </Link>
        ) : (
          <a
            key={index}
            href={item.link.startsWith("http") ? item.link : setting.main_web_host}
            target="_blank"
            rel="noreferrer"
            className="flex-[0_0_calc(25%-6px)] text-center"
            onClick={onClick}
          >
            {item.name}
          </a>
        );
      })}
    </div>
  );
};

export default HeaderAds;
