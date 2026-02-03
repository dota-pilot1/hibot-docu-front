// Skill Metadata
export interface SkillMetadata {
  tags?: string[];
  resources?: { title: string; url: string }[];
  examples?: string[];
}

// Skill
export interface Skill {
  id: number;
  parentId?: number;
  name: string;
  description?: string;
  displayOrder: number;
  maxLevel: number;
  iconUrl?: string;
  metadata?: SkillMetadata;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// User Skill
export interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  level: number;
  notes?: string;
  startedAt?: string;
  updatedAt: string;
  skill?: Skill;
}

// Skill Activity Type
export type SkillActivityType =
  | "level_up"
  | "level_down"
  | "started"
  | "note_updated";

// Skill Activity
export interface SkillActivity {
  id: number;
  userId: number;
  skillId: number;
  type: SkillActivityType;
  previousLevel?: number;
  newLevel?: number;
  description?: string;
  createdAt: string;
  skill?: { id: number; name: string };
}

// Skill with User Level (for list view)
export interface SkillWithUserLevel extends Skill {
  userSkill: UserSkill | null;
}

// Department Skill Summary
export interface DepartmentSkillSummary {
  skill: Skill;
  averageLevel: number;
  userCount: number;
}

// Create/Update DTOs
export interface CreateSkillInput {
  name: string;
  parentId?: number;
  description?: string;
  displayOrder?: number;
  maxLevel?: number;
  iconUrl?: string;
  metadata?: SkillMetadata;
}

export interface UpdateSkillInput extends Partial<CreateSkillInput> {}

export interface UpdateUserSkillInput {
  level: number;
  notes?: string;
}

// Level Config for UI
export const skillLevelConfig: Record<
  number,
  { label: string; color: string; bgColor: string }
> = {
  0: { label: "미학습", color: "text-gray-400", bgColor: "bg-gray-100" },
  1: { label: "입문", color: "text-red-500", bgColor: "bg-red-100" },
  2: { label: "초급", color: "text-orange-500", bgColor: "bg-orange-100" },
  3: { label: "중급", color: "text-yellow-500", bgColor: "bg-yellow-100" },
  4: { label: "고급", color: "text-green-500", bgColor: "bg-green-100" },
  5: { label: "전문가", color: "text-blue-500", bgColor: "bg-blue-100" },
};

// Activity Type Config for UI
export const skillActivityTypeConfig: Record<
  SkillActivityType,
  { label: string; icon: string; color: string }
> = {
  level_up: { label: "레벨 업", icon: "⬆️", color: "text-green-600" },
  level_down: { label: "레벨 다운", icon: "⬇️", color: "text-red-600" },
  started: { label: "학습 시작", icon: "🎯", color: "text-blue-600" },
  note_updated: { label: "메모 수정", icon: "📝", color: "text-gray-600" },
};
