# API 层（Phase 1）

## 文件

| 文件 | 说明 |
|------|------|
| `types.ts` | 请求/响应类型契约 |
| `client.ts` | 真实 HTTP 客户端 |
| `mock.ts` | 内存 Mock + localStorage 持久化 |
| `fixtures/initialBootstrap.ts` | 初始示例数据 |
| `index.ts` | 统一导出 `api`、`uploadImage` |

## 使用

```ts
import { api, uploadImage, useMockApi } from "@/api";

console.log(useMockApi); // true 时无需后端
const bootstrap = await api.getBootstrap();
```

开发默认 `VITE_USE_MOCK=false`（Phase 5 联调真实后端，见 `.env.development`）。仅前端演示时改为 `true`。

## 重置 Mock 数据

在浏览器控制台：

```js
import { resetMockState } from "/src/api/mock.ts";
resetMockState();
location.reload();
```

或清除 `localStorage` 键 `bunny-home-mock-bootstrap`。

## 契约文档（v1.0 冻结）

- [docs/api-contract.md](../../../docs/api-contract.md) — 后端实现依据
- [docs/phase3-verification.md](../../../docs/phase3-verification.md) — 前端走查清单
- [docs/fixtures/bootstrap.sample.json](../../../docs/fixtures/bootstrap.sample.json) — Bootstrap 样例 JSON
