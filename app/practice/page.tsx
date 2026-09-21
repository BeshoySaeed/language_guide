import { Sparkles } from "lucide-react";
import { FeatureState } from "@/components/app/feature-state";

export default function PracticePage() {
  return <FeatureState eyebrow="Practice" title="Train one skill at a time." description="Focused sessions will use your active course and recent mistakes to choose the right questions." emptyTitle="Choose a course to begin" emptyDescription="Practice sets appear after your first learning path is saved and lesson content is published." icon={Sparkles} />;
}

