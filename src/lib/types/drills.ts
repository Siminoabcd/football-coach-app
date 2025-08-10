export type Drill = {
    id: string;
    team_id: string | null;
    title: string;
    category: string | null;
    objective: string | null;
    age_group: string | null;
    difficulty: "Easy" | "Medium" | "Hard" | null;
    duration_min: number | null;
    players_min: number | null;
    players_max: number | null;
    equipment: string[] | null;
    setup: string | null;
    instructions: string | null;
    coaching_points: string | null;
    progressions: string | null;
    visibility: "private" | "team" | "public";
    created_by: string;
    created_at: string;
    updated_at: string;
  };
  
  export type DrillMedia = {
    id: string;
    drill_id: string;
    type: "image" | "video";
    url: string;
    caption: string | null;
    created_at: string;
  };
  
  export type DrillFilters = {
    q?: string;
    category?: string;
    age_group?: string;
    difficulty?: "Easy" | "Medium" | "Hard";
    equipment?: string[];        // any of these
    visibility?: "private" | "team" | "public";
    teamId?: string | null;       // null => personal/global
    limit?: number;
    offset?: number;
    createdByOnly?: boolean;      // only my drills
  };
  