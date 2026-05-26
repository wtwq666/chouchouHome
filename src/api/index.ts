import { realApi, type ApiClient } from "./client";
import { mockApi } from "./mock";

export * from "./types";
export { ApiError } from "./http";
export { realApi, type ApiClient } from "./client";
export { mockApi, resetMockState } from "./mock";

/** true 时使用内存 Mock；设为 false 时走真实 FastAPI */
export const useMockApi =
  import.meta.env.VITE_USE_MOCK !== "false" &&
  import.meta.env.VITE_USE_MOCK !== "0";

/** 统一 API 入口 — Phase 2 store 通过此对象调用 */
export const api: ApiClient = useMockApi ? mockApi : realApi;

/**
 * 上传图片并返回可展示的 URL。
 * Mock：blob URL；真实 API：/uploads/... 路径。
 */
export async function uploadImage(file: File): Promise<string> {
  const { url } = await api.uploadFile(file);
  return url;
}
