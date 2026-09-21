import { Target } from "lucide-react";
import { FeatureState } from "@/components/app/feature-state";

export default function ReviewPage() {
  return <FeatureState eyebrow="Review" title="Remember what matters." description="Your review queue will schedule saved words, sentences, and grammar at useful intervals." emptyTitle="Your review queue is clear" emptyDescription="Save difficult items during lessons and they will appear here when they are due." icon={Target} />;
}

