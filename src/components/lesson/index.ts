// Lesson MDX components — the 9-block academy anatomy from
// .claude/plans/academy-vision.md §2.3.
//
// Use via:
//   import { lessonComponents } from "@/components/lesson";
//   <MDXRemote source={body} components={lessonComponents} />

import { Artefact } from "./Artefact";
import { CinematicScene } from "./CinematicScene";
import { CommonMistakes } from "./CommonMistakes";
import { Debrief } from "./Debrief";
import { MemoryAnchor } from "./MemoryAnchor";
import { MiniQuiz } from "./MiniQuiz";
import { MissionBriefing } from "./MissionBriefing";
import { Scenario } from "./Scenario";

export {
  Artefact,
  CinematicScene,
  CommonMistakes,
  Debrief,
  MemoryAnchor,
  MiniQuiz,
  MissionBriefing,
  Scenario,
};

export const lessonComponents = {
  Artefact,
  CinematicScene,
  CommonMistakes,
  Debrief,
  MemoryAnchor,
  MiniQuiz,
  MissionBriefing,
  Scenario,
};
