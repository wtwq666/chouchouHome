import { create } from "zustand";
import { api } from "@/api";
import type { BootstrapResponse, BunnyDataBundle } from "@/api/types";
import { isoToDotDate } from "@/api/date";

export type {
  Bunny,
  TimelineEvent,
  WeightRecord,
  Photo,
  HealthRecord,
  HealthRecordType,
} from "@/api/types";

export interface BunnyData {
  bunny: import("@/api/types").Bunny;
  timelineEvents: import("@/api/types").TimelineEvent[];
  weightRecords: import("@/api/types").WeightRecord[];
  photos: import("@/api/types").Photo[];
  healthRecords: import("@/api/types").HealthRecord[];
}

function bundleToBunnyData(bundle: BunnyDataBundle): BunnyData {
  return { ...bundle };
}

function applyBootstrap(data: BootstrapResponse): Pick<AppState, "bunnies" | "currentBunnyId" | "bunnyData"> {
  const bunnyData: Record<string, BunnyData> = {};
  for (const [id, bundle] of Object.entries(data.bunnyData)) {
    bunnyData[id] = bundleToBunnyData(bundle);
  }
  const ids = new Set(data.bunnies.map((b) => b.id));
  let currentBunnyId = data.currentBunnyId;
  if (!currentBunnyId || !ids.has(currentBunnyId)) {
    currentBunnyId = data.bunnies[0]?.id ?? "";
  }
  return {
    bunnies: data.bunnies,
    currentBunnyId,
    bunnyData,
  };
}

interface AppState {
  bunnies: import("@/api/types").Bunny[];
  currentBunnyId: string;
  bunnyData: Record<string, BunnyData>;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  modalType: string | null;
  lightboxOpen: boolean;
  lightboxIndex: number;
  timelineDetailId: string | null;

  loadBootstrap: () => Promise<void>;
  openModal: (type: string) => void;
  closeModal: () => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  openTimelineDetail: (id: string) => void;
  closeTimelineDetail: () => void;
  switchBunny: (id: string) => Promise<void>;

  addBunny: (payload: { name: string; breed: string; birthDate: string; weight: number; avatar?: string }) => Promise<void>;
  updateBunny: (id: string, bunny: Partial<import("@/api/types").Bunny>) => Promise<void>;
  uploadBunnyAvatar: (id: string, file: File) => Promise<void>;
  deleteBunny: (id: string) => Promise<void>;

  addTimelineEvent: (
    bunnyId: string,
    data: {
      date: string;
      title: string;
      coverImage: string;
      description: string;
      detailImages: string[];
      mood: string;
      color: string;
    },
  ) => Promise<void>;
  updateTimelineEvent: (id: string, event: Partial<import("@/api/types").TimelineEvent>) => Promise<void>;
  deleteTimelineEvent: (id: string) => Promise<void>;

  addWeightRecord: (bunnyId: string, data: { date: string; weight: number }) => Promise<void>;
  updateWeightRecord: (id: string, data: { date?: string; weight?: number }) => Promise<void>;
  deleteWeightRecord: (id: string) => Promise<void>;

  addPhoto: (
    bunnyId: string,
    data: { src: string; date: string; description: string; year: number; tags?: string[] },
  ) => Promise<void>;
  updatePhoto: (id: string, photo: Partial<import("@/api/types").Photo>) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;

  addHealthRecord: (
    bunnyId: string,
    data: {
      date: string;
      type: import("@/api/types").HealthRecordType;
      description: string;
      status: string;
    },
  ) => Promise<void>;
  updateHealthRecord: (id: string, record: Partial<import("@/api/types").HealthRecord>) => Promise<void>;
  deleteHealthRecord: (id: string) => Promise<void>;

}

async function refresh(set: (partial: Partial<AppState>) => void): Promise<void> {
  const data = await api.getBootstrap();
  set({ ...applyBootstrap(data), error: null });
}

export const useStore = create<AppState>((set) => ({
  bunnies: [],
  currentBunnyId: "",
  bunnyData: {},
  isLoading: false,
  isHydrated: false,
  error: null,

  modalType: null,
  lightboxOpen: false,
  lightboxIndex: 0,
  timelineDetailId: null,

  loadBootstrap: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getBootstrap();
      set({ ...applyBootstrap(data), isLoading: false, isHydrated: true, error: null });
    } catch (e) {
      set({
        isLoading: false,
        isHydrated: false,
        error: e instanceof Error ? e.message : "加载失败",
      });
    }
  },

  openModal: (type) => set({ modalType: type }),
  closeModal: () => set({ modalType: null }),
  openLightbox: (index) => set({ lightboxOpen: true, lightboxIndex: index }),
  closeLightbox: () => set({ lightboxOpen: false, lightboxIndex: 0 }),
  openTimelineDetail: (id) => set({ timelineDetailId: id }),
  closeTimelineDetail: () => set({ timelineDetailId: null }),

  switchBunny: async (id) => {
    await api.setCurrentBunny(id);
    set({ currentBunnyId: id });
  },

  addBunny: async (payload) => {
    const created = await api.createBunny(payload);
    await refresh(set);
    const state = useStore.getState();
    if (!state.currentBunnyId && created.id) {
      try {
        await api.setCurrentBunny(created.id);
        set({ currentBunnyId: created.id });
      } catch {
        set({ currentBunnyId: created.id });
      }
    }
  },

  updateBunny: async (id, bunny) => {
    await api.updateBunny(id, bunny);
    await refresh(set);
  },

  uploadBunnyAvatar: async (id, file) => {
    await api.uploadAvatar(id, file);
    await refresh(set);
  },

  deleteBunny: async (id) => {
    await api.deleteBunny(id);
    await refresh(set);
  },

  addTimelineEvent: async (bunnyId, data) => {
    await api.createTimelineEvent({
      bunnyId,
      date: isoToDotDate(data.date),
      title: data.title,
      coverImage: data.coverImage,
      description: data.description,
      detailImages: data.detailImages.slice(0, 9),
      mood: data.mood,
      color: data.color,
    });
    await refresh(set);
  },

  updateTimelineEvent: async (id, event) => {
    const patch = { ...event };
    if (patch.date) patch.date = isoToDotDate(patch.date);
    await api.updateTimelineEvent(id, patch);
    await refresh(set);
  },

  deleteTimelineEvent: async (id) => {
    await api.deleteTimelineEvent(id);
    await refresh(set);
  },

  addWeightRecord: async (bunnyId, data) => {
    await api.createWeightRecord({ bunnyId, date: data.date, weight: data.weight });
    await refresh(set);
  },

  updateWeightRecord: async (id, data) => {
    await api.updateWeightRecord(id, data);
    await refresh(set);
  },

  deleteWeightRecord: async (id) => {
    await api.deleteWeightRecord(id);
    await refresh(set);
  },

  addPhoto: async (bunnyId, data) => {
    await api.createPhoto({
      bunnyId,
      src: data.src,
      date: isoToDotDate(data.date),
      description: data.description,
      year: data.year,
      tags: data.tags,
    });
    await refresh(set);
  },

  updatePhoto: async (id, photo) => {
    const patch = { ...photo };
    if (patch.date) patch.date = isoToDotDate(patch.date);
    await api.updatePhoto(id, patch);
    await refresh(set);
  },

  deletePhoto: async (id) => {
    await api.deletePhoto(id);
    await refresh(set);
  },

  addHealthRecord: async (bunnyId, data) => {
    await api.createHealthRecord({
      bunnyId,
      date: isoToDotDate(data.date),
      type: data.type,
      description: data.description,
      status: data.status,
    });
    await refresh(set);
  },

  updateHealthRecord: async (id, record) => {
    const patch = { ...record };
    if (patch.date) patch.date = isoToDotDate(patch.date);
    await api.updateHealthRecord(id, patch);
    await refresh(set);
  },

  deleteHealthRecord: async (id) => {
    await api.deleteHealthRecord(id);
    await refresh(set);
  },

}));

export const useCurrentBunnyData = () => {
  const currentBunnyId = useStore((s) => s.currentBunnyId);
  const bunnyData = useStore((s) => s.bunnyData);
  return bunnyData[currentBunnyId];
};

export const useBunnies = () => useStore((s) => s.bunnies);

export const useAllTimelineEvents = () => {
  const bunnyData = useStore((s) => s.bunnyData);
  const events: (import("@/api/types").TimelineEvent & {
    bunnyId: string;
    bunnyName: string;
    bunnyAvatar: string;
  })[] = [];
  Object.values(bunnyData).forEach((data) => {
    data.timelineEvents.forEach((e) =>
      events.push({
        ...e,
        bunnyId: data.bunny.id,
        bunnyName: data.bunny.name,
        bunnyAvatar: data.bunny.avatar,
      }),
    );
  });
  return events;
};

export const useAllWeightRecords = () => {
  const bunnyData = useStore((s) => s.bunnyData);
  const records: (import("@/api/types").WeightRecord & {
    bunnyId: string;
    bunnyName: string;
    bunnyAvatar: string;
  })[] = [];
  Object.values(bunnyData).forEach((data) => {
    data.weightRecords.forEach((r) =>
      records.push({
        ...r,
        bunnyId: data.bunny.id,
        bunnyName: data.bunny.name,
        bunnyAvatar: data.bunny.avatar,
      }),
    );
  });
  return records;
};

export const useAllHealthRecords = () => {
  const bunnyData = useStore((s) => s.bunnyData);
  const records: (import("@/api/types").HealthRecord & {
    bunnyId: string;
    bunnyName: string;
    bunnyAvatar: string;
  })[] = [];
  Object.values(bunnyData).forEach((data) => {
    data.healthRecords.forEach((r) =>
      records.push({
        ...r,
        bunnyId: data.bunny.id,
        bunnyName: data.bunny.name,
        bunnyAvatar: data.bunny.avatar,
      }),
    );
  });
  return records;
};

export const useAllPhotos = () => {
  const bunnyData = useStore((s) => s.bunnyData);
  const allPhotos: (import("@/api/types").Photo & {
    bunnyId: string;
    bunnyName: string;
    bunnyAvatar: string;
  })[] = [];
  Object.values(bunnyData).forEach((data) => {
    data.photos.forEach((p) =>
      allPhotos.push({
        ...p,
        bunnyId: data.bunny.id,
        bunnyName: data.bunny.name,
        bunnyAvatar: data.bunny.avatar,
      }),
    );
  });
  return allPhotos;
};

export const useAllPhotoTags = () => {
  const bunnies = useStore((s) => s.bunnies);
  return bunnies.map((b) => b.name);
};
