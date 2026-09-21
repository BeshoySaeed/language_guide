import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { FeatureState } from "@/components/app/feature-state";

export default function ProgressPage() {
  return <FeatureState eyebrow="Progress" title="See what is getting stronger." description="Meaningful progress combines lesson completion, review evidence, assessment scores, and focused study time." emptyTitle="Your first milestone starts here" emptyDescription="Complete a lesson and Language Guide will begin building your learning record." icon={ChartNoAxesColumnIncreasing} />;
}

