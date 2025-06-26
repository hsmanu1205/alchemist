// Data Entity Types
export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number; // 1-5
  RequestedTaskIDs: string[]; // comma-separated TaskIDs
  GroupTag: string;
  AttributesJSON: string; // JSON metadata
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string[]; // comma-separated tags
  AvailableSlots: number[]; // array of phase numbers
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: number;
}

export interface Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number; // number of phases (≥1)
  RequiredSkills: string[]; // comma-separated tags
  PreferredPhases: number[] | string; // list or range syntax
  MaxConcurrent: number; // max parallel assignments
}

// Validation Types
export interface ValidationError {
  id: string;
  entity: "client" | "worker" | "task";
  entityId: string;
  field?: string;
  type: ValidationErrorType;
  message: string;
  severity: "error" | "warning";
}

export enum ValidationErrorType {
  MISSING_REQUIRED_COLUMN = "missing_required_column",
  DUPLICATE_ID = "duplicate_id",
  MALFORMED_LIST = "malformed_list",
  OUT_OF_RANGE = "out_of_range",
  BROKEN_JSON = "broken_json",
  UNKNOWN_REFERENCE = "unknown_reference",
  CIRCULAR_DEPENDENCY = "circular_dependency",
  CONFLICTING_RULES = "conflicting_rules",
  OVERLOADED_WORKER = "overloaded_worker",
  PHASE_SLOT_SATURATION = "phase_slot_saturation",
  SKILL_COVERAGE = "skill_coverage",
  MAX_CONCURRENCY = "max_concurrency",
}

// Rule Types
export interface BusinessRule {
  id: string;
  name: string;
  type: RuleType;
  description: string;
  parameters: Record<string, any>;
  priority: number;
  active: boolean;
}

export enum RuleType {
  CO_RUN = "co_run",
  SLOT_RESTRICTION = "slot_restriction",
  LOAD_LIMIT = "load_limit",
  PHASE_WINDOW = "phase_window",
  PATTERN_MATCH = "pattern_match",
  PRECEDENCE_OVERRIDE = "precedence_override",
}

// Export Types
export interface ExportData {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: BusinessRule[];
  priorities: PriorityWeights;
}

export interface PriorityWeights {
  priorityLevel: number;
  taskFulfillment: number;
  fairnessConstraints: number;
  workloadBalance: number;
  skillMatch: number;
  phasePreference: number;
}

// API Types
export interface UploadResponse {
  success: boolean;
  data?: {
    clients: Client[];
    workers: Worker[];
    tasks: Task[];
  };
  errors?: ValidationError[];
  message?: string;
}

export interface ValidationResponse {
  errors: ValidationError[];
  summary: {
    totalErrors: number;
    errorsByType: Record<ValidationErrorType, number>;
    errorsBySeverity: Record<"error" | "warning", number>;
  };
}

// UI State Types
export interface DataState {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  validationErrors: ValidationError[];
  rules: BusinessRule[];
  priorities: PriorityWeights;
  isLoading: boolean;
}

export interface FileUploadState {
  clientsFile?: File;
  workersFile?: File;
  tasksFile?: File;
  uploadProgress: number;
  isUploading: boolean;
}
