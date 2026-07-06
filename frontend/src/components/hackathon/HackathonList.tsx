import HackathonCard from "./HackathonCard";
import { HackathonCard as HackathonCardType } from "@/services/hackathon.api";

interface HackathonListProps {
  hackathons: HackathonCardType[];
  variant?: "default" | "compact";
}

/**
 * HackathonList — renders a responsive grid of HackathonCards.
 */
export default function HackathonList({ hackathons, variant = "default" }: HackathonListProps) {
  return (
    <div className="hackathons-grid">
      {hackathons.map(h => (
        <HackathonCard key={h._id} hackathon={h} variant={variant} />
      ))}
    </div>
  );
}
