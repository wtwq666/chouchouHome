/**
 * API 契约类型 v2.0 — 与 docs/api-contract.md、docs/schema-v2.md 对齐。
 */

export interface Bunny {
  id: string;
  name: string;
  breed: string;
  birthDate: string;
  avatar: string;
  weight: number;
  notes?: string | null;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  coverImage: string;
  description: string;
  detailImages: string[];
  mood: string;
  color: string;
}

export interface WeightRecord {
  id: string;
  date: string;
  weight: number;
}

export interface Photo {
  id: string;
  src: string;
  date: string;
  description: string;
  year: number;
  tags?: string[];
}

export type HealthRecordType = "checkup" | "abnormal" | "prevention" | "care";

export interface HealthRecord {
  id: string;
  date: string;
  type: HealthRecordType;
  description: string;
  status: string;
}

export interface BunnyDataBundle {
  bunny: Bunny;
  timelineEvents: TimelineEvent[];
  weightRecords: WeightRecord[];
  photos: Photo[];
  healthRecords: HealthRecord[];
}

export interface BootstrapResponse {
  bunnies: Bunny[];
  currentBunnyId: string;
  bunnyData: Record<string, BunnyDataBundle>;
}

export interface UploadResponse {
  url: string;
}

export interface HealthResponse {
  status: string;
}

export interface CreateBunnyPayload {
  name: string;
  breed: string;
  birthDate: string;
  weight: number;
  avatar?: string;
}

export interface CreateTimelineEventPayload {
  bunnyId: string;
  date: string;
  title: string;
  coverImage: string;
  description: string;
  detailImages: string[];
  mood: string;
  color: string;
}

export interface UpdateTimelineEventPayload {
  date?: string;
  title?: string;
  coverImage?: string;
  description?: string;
  detailImages?: string[];
  mood?: string;
  color?: string;
}

export interface CreateWeightRecordPayload {
  bunnyId: string;
  date: string;
  weight: number;
}

export interface UpdateWeightRecordPayload {
  date?: string;
  weight?: number;
}

export interface CreateHealthRecordPayload {
  bunnyId: string;
  date: string;
  type: HealthRecordType;
  description: string;
  status: string;
}

export interface UpdateHealthRecordPayload {
  date?: string;
  type?: HealthRecordType;
  description?: string;
  status?: string;
}

export interface CreatePhotoPayload {
  bunnyId: string;
  src: string;
  date: string;
  description: string;
  year: number;
  tags?: string[];
}

export interface UpdatePhotoPayload {
  src?: string;
  date?: string;
  description?: string;
  year?: number;
  tags?: string[];
}

export interface SetCurrentBunnyPayload {
  bunnyId: string;
}
