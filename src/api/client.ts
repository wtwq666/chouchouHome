import { request } from "./http";
import type {
  BootstrapResponse,
  Bunny,
  CreateBunnyPayload,
  CreateHealthRecordPayload,
  CreatePhotoPayload,
  CreateTimelineEventPayload,
  CreateWeightRecordPayload,
  UpdateWeightRecordPayload,
  HealthRecord,
  HealthResponse,
  Photo,
  SetCurrentBunnyPayload,
  TimelineEvent,
  UpdateHealthRecordPayload,
  UpdatePhotoPayload,
  UpdateTimelineEventPayload,
  UploadResponse,
  WeightRecord,
} from "./types";

/** 真实 HTTP API 客户端（对接 FastAPI） */
export const realApi = {
  health(): Promise<HealthResponse> {
    return request<HealthResponse>("/api/health");
  },

  getBootstrap(): Promise<BootstrapResponse> {
    return request<BootstrapResponse>("/api/bootstrap");
  },

  setCurrentBunny(bunnyId: string): Promise<void> {
    return request<void>("/api/settings/current-bunny", {
      method: "PUT",
      body: JSON.stringify({ bunnyId } satisfies SetCurrentBunnyPayload),
    });
  },

  createBunny(payload: CreateBunnyPayload): Promise<Bunny> {
    return request<Bunny>("/api/bunnies", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateBunny(id: string, payload: Partial<Bunny>): Promise<Bunny> {
    return request<Bunny>(`/api/bunnies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteBunny(id: string): Promise<void> {
    return request<void>(`/api/bunnies/${id}`, { method: "DELETE" });
  },

  uploadAvatar(bunnyId: string, file: File): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", file);
    return request<UploadResponse>(`/api/bunnies/${bunnyId}/avatar`, {
      method: "POST",
      body: form,
    });
  },

  createTimelineEvent(payload: CreateTimelineEventPayload): Promise<TimelineEvent> {
    return request<TimelineEvent>("/api/timeline-events", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateTimelineEvent(id: string, payload: UpdateTimelineEventPayload): Promise<TimelineEvent> {
    return request<TimelineEvent>(`/api/timeline-events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteTimelineEvent(id: string): Promise<void> {
    return request<void>(`/api/timeline-events/${id}`, { method: "DELETE" });
  },

  createWeightRecord(payload: CreateWeightRecordPayload): Promise<WeightRecord> {
    return request<WeightRecord>("/api/weight-records", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateWeightRecord(id: string, payload: UpdateWeightRecordPayload): Promise<WeightRecord> {
    return request<WeightRecord>(`/api/weight-records/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteWeightRecord(id: string): Promise<void> {
    return request<void>(`/api/weight-records/${id}`, { method: "DELETE" });
  },

  createHealthRecord(payload: CreateHealthRecordPayload): Promise<HealthRecord> {
    return request<HealthRecord>("/api/health-records", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateHealthRecord(id: string, payload: UpdateHealthRecordPayload): Promise<HealthRecord> {
    return request<HealthRecord>(`/api/health-records/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteHealthRecord(id: string): Promise<void> {
    return request<void>(`/api/health-records/${id}`, { method: "DELETE" });
  },

  createPhoto(payload: CreatePhotoPayload): Promise<Photo> {
    return request<Photo>("/api/photos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updatePhoto(id: string, payload: UpdatePhotoPayload): Promise<Photo> {
    return request<Photo>(`/api/photos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deletePhoto(id: string): Promise<void> {
    return request<void>(`/api/photos/${id}`, { method: "DELETE" });
  },

  uploadFile(file: File): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", file);
    return request<UploadResponse>("/api/uploads", {
      method: "POST",
      body: form,
    });
  },
};

export type ApiClient = typeof realApi;
