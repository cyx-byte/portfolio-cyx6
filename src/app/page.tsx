import { getSiteData } from "@/lib/data";
import { HomePage } from "@/components/home/HomePage";

export default function Home() {
  const data = getSiteData();

  return (
    <HomePage
      name={data.site.name}
      title={data.site.title}
      homeCoverFront={data.site.homeCoverFront}
      homeCoverBack={data.site.homeCoverBack}
    />
  );
}
