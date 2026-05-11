// Lesson MDX components — the 9-block academy anatomy from
// .claude/plans/academy-vision.md §2.3 plus the interactive widgets
// from §6.4.
//
// Use via:
//   import { lessonComponents } from "@/components/lesson";
//   <MDXRemote source={body} components={lessonComponents} />

import { Artefact } from "./Artefact";
import { CinematicScene } from "./CinematicScene";
import { ClassComparator } from "./ClassComparator";
import { CommonMistakes } from "./CommonMistakes";
import { Debrief } from "./Debrief";
import { DistanceRuleSimulator } from "./DistanceRuleSimulator";
import { IMSAFEChecklist } from "./IMSAFEChecklist";
import { MemoryAnchor } from "./MemoryAnchor";
import { MiniQuiz } from "./MiniQuiz";
import { MissionBriefing } from "./MissionBriefing";
import { Scenario } from "./Scenario";
import { WhCalculator } from "./WhCalculator";
import { ZoneClassifier } from "./ZoneClassifier";

export {
  Artefact,
  CinematicScene,
  ClassComparator,
  CommonMistakes,
  Debrief,
  DistanceRuleSimulator,
  IMSAFEChecklist,
  MemoryAnchor,
  MiniQuiz,
  MissionBriefing,
  Scenario,
  WhCalculator,
  ZoneClassifier,
};

export const lessonComponents = {
  // 9-block anatomy
  Artefact,
  CinematicScene,
  CommonMistakes,
  Debrief,
  MemoryAnchor,
  MiniQuiz,
  MissionBriefing,
  Scenario,
  // Interactive widgets (Wave 1)
  ClassComparator,
  DistanceRuleSimulator,
  IMSAFEChecklist,
  WhCalculator,
  ZoneClassifier,
};
