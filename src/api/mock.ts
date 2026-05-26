import { initialBootstrap } from "./fixtures/initialBootstrap";
import { newId } from "./http";
import type {
  BootstrapResponse,
  Bunny,
  BunnyDataBundle,
  CreateBunnyPayload,
  CreateHealthRecordPayload,
  CreatePhotoPayload,
  CreateTimelineEventPayload,
  CreateWeightRecordPayload,
  HealthRecord,
  Photo,
  TimelineEvent,
  UpdateHealthRecordPayload,
  UpdatePhotoPayload,
  UpdateTimelineEventPayload,
  UpdateWeightRecordPayload,
  WeightRecord,
} from "./types";

const MOCK_STORAGE_KEY = "bunny-home-mock-bootstrap";
const MOCK_UPLOAD_PREFIX = "/uploads/mock-";

function deepCloneBootstrap(data: BootstrapResponse): BootstrapResponse {
  return JSON.parse(JSON.stringify(data)) as BootstrapResponse;
}

function loadState(): BootstrapResponse {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as BootstrapResponse;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return deepCloneBootstrap(initialBootstrap);
}

function saveState(state: BootstrapResponse): void {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded — in-memory only for this session */
  }
}

let state = loadState();

function syncBunnyList(bundle: BunnyDataBundle): void {
  const idx = state.bunnies.findIndex((b) => b.id === bundle.bunny.id);
  if (idx >= 0) {
    state.bunnies[idx] = { ...bundle.bunny };
  }
}

function syncBunnyWeightFromRecords(bundle: BunnyDataBundle): void {
  const sorted = [...bundle.weightRecords].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return;
  bundle.bunny.weight = sorted[sorted.length - 1].weight;
  syncBunnyList(bundle);
}

function getBundle(bunnyId: string): BunnyDataBundle {
  const bundle = state.bunnyData[bunnyId];
  if (!bundle) {
    throw new Error(`Mock: bunny not found: ${bunnyId}`);
  }
  return bundle;
}

function findTimelineOwner(eventId: string): { bunnyId: string; index: number } | null {
  for (const [bunnyId, bundle] of Object.entries(state.bunnyData)) {
    const index = bundle.timelineEvents.findIndex((e) => e.id === eventId);
    if (index >= 0) return { bunnyId, index };
  }
  return null;
}

function findWeightOwner(recordId: string): { bunnyId: string; index: number } | null {
  for (const [bunnyId, bundle] of Object.entries(state.bunnyData)) {
    const index = bundle.weightRecords.findIndex((r) => r.id === recordId);
    if (index >= 0) return { bunnyId, index };
  }
  return null;
}

function findHealthOwner(recordId: string): { bunnyId: string; index: number } | null {
  for (const [bunnyId, bundle] of Object.entries(state.bunnyData)) {
    const index = bundle.healthRecords.findIndex((r) => r.id === recordId);
    if (index >= 0) return { bunnyId, index };
  }
  return null;
}

function findPhotoOwner(photoId: string): { bunnyId: string; index: number } | null {
  for (const [bunnyId, bundle] of Object.entries(state.bunnyData)) {
    const index = bundle.photos.findIndex((p) => p.id === photoId);
    if (index >= 0) return { bunnyId, index };
  }
  return null;
}

function delay<T>(value: T, ms = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const mockObjectUrls = new Map<string, string>();

/** 重置 Mock 状态为初始 fixtures（开发调试用） */
export function resetMockState(): void {
  state = deepCloneBootstrap(initialBootstrap);
  localStorage.removeItem(MOCK_STORAGE_KEY);
  mockObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  mockObjectUrls.clear();
}

/** 内存 Mock API — 无需后端即可开发 */
export const mockApi = {
  health() {
    return delay({ status: "ok" });
  },

  getBootstrap() {
    return delay(deepCloneBootstrap(state));
  },

  setCurrentBunny(bunnyId: string) {
    if (!state.bunnyData[bunnyId]) {
      throw new Error(`Mock: invalid bunnyId ${bunnyId}`);
    }
    state.currentBunnyId = bunnyId;
    saveState(state);
    return delay(undefined);
  },

  createBunny(payload: CreateBunnyPayload) {
    const id = newId("b");
    const bunny: Bunny = {
      id,
      name: payload.name,
      breed: payload.breed,
      birthDate: payload.birthDate,
      avatar: payload.avatar ?? "/assets/photo-11-baby.jpg",
      weight: payload.weight,
    };
    const bundle: BunnyDataBundle = {
      bunny,
      timelineEvents: [],
      weightRecords: [],
      photos: [],
      healthRecords: [],
    };
    state.bunnies.push(bunny);
    state.bunnyData[id] = bundle;
    saveState(state);
    return delay(bunny);
  },

  updateBunny(id: string, payload: Partial<Bunny>) {
    const bundle = getBundle(id);
    bundle.bunny = { ...bundle.bunny, ...payload };
    syncBunnyList(bundle);
    saveState(state);
    return delay(bundle.bunny);
  },

  deleteBunny(id: string) {
    state.bunnies = state.bunnies.filter((b) => b.id !== id);
    delete state.bunnyData[id];
    if (state.currentBunnyId === id) {
      state.currentBunnyId = state.bunnies[0]?.id ?? "";
    }
    saveState(state);
    return delay(undefined);
  },

  async uploadAvatar(bunnyId: string, file: File) {
    const { url } = await mockApi.uploadFile(file);
    const bundle = getBundle(bunnyId);
    bundle.bunny.avatar = url;
    syncBunnyList(bundle);
    saveState(state);
    return { url };
  },

  createTimelineEvent(payload: CreateTimelineEventPayload) {
    const bundle = getBundle(payload.bunnyId);
    const event: TimelineEvent = {
      id: newId("te"),
      date: payload.date,
      title: payload.title,
      coverImage: payload.coverImage,
      description: payload.description,
      detailImages: payload.detailImages.slice(0, 9),
      mood: payload.mood,
      color: payload.color,
    };
    bundle.timelineEvents.unshift(event);
    saveState(state);
    return delay(event);
  },

  updateTimelineEvent(id: string, payload: UpdateTimelineEventPayload) {
    const owner = findTimelineOwner(id);
    if (!owner) throw new Error(`Mock: timeline event not found: ${id}`);
    const bundle = getBundle(owner.bunnyId);
    const current = bundle.timelineEvents[owner.index];
    const updated = {
      ...current,
      ...payload,
      detailImages: payload.detailImages ?? current.detailImages,
    };
    bundle.timelineEvents[owner.index] = updated;
    saveState(state);
    return delay(updated);
  },

  deleteTimelineEvent(id: string) {
    const owner = findTimelineOwner(id);
    if (!owner) throw new Error(`Mock: timeline event not found: ${id}`);
    const bundle = getBundle(owner.bunnyId);
    bundle.timelineEvents.splice(owner.index, 1);
    saveState(state);
    return delay(undefined);
  },

  createWeightRecord(payload: CreateWeightRecordPayload) {
    const bundle = getBundle(payload.bunnyId);
    const record: WeightRecord = {
      id: newId("w"),
      date: payload.date,
      weight: payload.weight,
    };
    const exists = bundle.weightRecords.some((r) => r.date === payload.date);
    if (exists) {
      return Promise.reject(new Error("该兔子在此日期已有体重记录"));
    }
    bundle.weightRecords.push(record);
    bundle.weightRecords.sort((a, b) => a.date.localeCompare(b.date));
    syncBunnyWeightFromRecords(bundle);
    saveState(state);
    return delay(record);
  },

  updateWeightRecord(id: string, payload: UpdateWeightRecordPayload) {
    const owner = findWeightOwner(id);
    if (!owner) throw new Error(`Mock: weight record not found: ${id}`);
    const bundle = getBundle(owner.bunnyId);
    const current = bundle.weightRecords[owner.index];
    if (payload.date && payload.date !== current.date) {
      const clash = bundle.weightRecords.some(
        (r, i) => i !== owner.index && r.date === payload.date,
      );
      if (clash) return Promise.reject(new Error("该兔子在此日期已有体重记录"));
    }
    const updated = { ...current, ...payload };
    bundle.weightRecords[owner.index] = updated;
    bundle.weightRecords.sort((a, b) => a.date.localeCompare(b.date));
    syncBunnyWeightFromRecords(bundle);
    saveState(state);
    return delay(updated);
  },

  deleteWeightRecord(id: string) {
    const owner = findWeightOwner(id);
    if (!owner) throw new Error(`Mock: weight record not found: ${id}`);
    const bundle = getBundle(owner.bunnyId);
    bundle.weightRecords.splice(owner.index, 1);
    syncBunnyWeightFromRecords(bundle);
    saveState(state);
    return delay(undefined);
  },

  createHealthRecord(payload: CreateHealthRecordPayload) {
    const bundle = getBundle(payload.bunnyId);
    const record: HealthRecord = {
      id: newId("h"),
      date: payload.date,
      type: payload.type,
      description: payload.description,
      status: payload.status,
    };
    bundle.healthRecords.unshift(record);
    saveState(state);
    return delay(record);
  },

  updateHealthRecord(id: string, payload: UpdateHealthRecordPayload) {
    const owner = findHealthOwner(id);
    if (!owner) throw new Error(`Mock: health record not found: ${id}`);
    const bundle = getBundle(owner.bunnyId);
    const updated = { ...bundle.healthRecords[owner.index], ...payload };
    bundle.healthRecords[owner.index] = updated;
    saveState(state);
    return delay(updated);
  },

  deleteHealthRecord(id: string) {
    const owner = findHealthOwner(id);
    if (!owner) throw new Error(`Mock: health record not found: ${id}`);
    const bundle = getBundle(owner.bunnyId);
    bundle.healthRecords.splice(owner.index, 1);
    saveState(state);
    return delay(undefined);
  },

  createPhoto(payload: CreatePhotoPayload) {
    const bundle = getBundle(payload.bunnyId);
    const photo: Photo = {
      id: newId("p"),
      src: payload.src,
      date: payload.date,
      description: payload.description,
      year: payload.year,
      tags: payload.tags ?? [bundle.bunny.name],
    };
    bundle.photos.unshift(photo);
    saveState(state);
    return delay(photo);
  },

  updatePhoto(id: string, payload: UpdatePhotoPayload) {
    const owner = findPhotoOwner(id);
    if (!owner) throw new Error(`Mock: photo not found: ${id}`);
    const bundle = getBundle(owner.bunnyId);
    const updated = { ...bundle.photos[owner.index], ...payload };
    bundle.photos[owner.index] = updated;
    saveState(state);
    return delay(updated);
  },

  deletePhoto(id: string) {
    const owner = findPhotoOwner(id);
    if (!owner) throw new Error(`Mock: photo not found: ${id}`);
    const bundle = getBundle(owner.bunnyId);
    bundle.photos.splice(owner.index, 1);
    saveState(state);
    return delay(undefined);
  },

  uploadFile(file: File) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${MOCK_UPLOAD_PREFIX}${newId("")}.${ext}`;
    const objectUrl = URL.createObjectURL(file);
    mockObjectUrls.set(path, objectUrl);
    return delay({ url: objectUrl });
  },
};
