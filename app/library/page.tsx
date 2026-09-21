import { Library } from "lucide-react";
import { FeatureState } from "@/components/app/feature-state";

export default function LibraryPage() {
  return <FeatureState eyebrow="Library" title="Your personal language notebook." description="Saved vocabulary, sentences, grammar topics, and notes will stay organized by language and level." emptyTitle="Nothing saved yet" emptyDescription="Use the bookmark action in a lesson to build a focused personal library." icon={Library} />;
}

