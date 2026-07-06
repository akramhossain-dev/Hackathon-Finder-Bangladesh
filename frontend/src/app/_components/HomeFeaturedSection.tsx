"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hackathonApi, HackathonCard } from "@/services/hackathon.api";
import { HackathonList } from "@/components/hackathon";
import { LoadingState, EmptyState } from "@/components/shared";
import { ROUTES } from "@/lib/constants";

/**
 * HomeFeaturedSection — client component that fetches featured hackathons.
 */
export default function HomeFeaturedSection() {
  const [hackathons, setHackathons] = useState<HackathonCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    hackathonApi
      .list({ featured: "true", limit: 3, sort: "latest" })
      .then(r => setHackathons(r.hackathons))
      .catch(() => {
        // Fall back to recent hackathons if featured fetch fails
        hackathonApi
          .list({ limit: 3, sort: "latest" })
          .then(r => setHackathons(r.hackathons))
          .catch(() => {});
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState count={3} />;

  if (hackathons.length === 0) {
    return (
      <EmptyState
        title="No featured hackathons yet"
        description="Check back soon — new events are added regularly."
        action={
          <Link href={ROUTES.hackathons} className="filter-btn-primary">
            Browse all hackathons
          </Link>
        }
      />
    );
  }

  return <HackathonList hackathons={hackathons} />;
}
