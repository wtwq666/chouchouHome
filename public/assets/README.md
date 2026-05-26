# 静态图片目录

- **兔子 AI 照片**（`*.jpg`）：源文件在 `app/dist-old-2/assets/`，运行 `python scripts/sync_ai_assets.py` 同步到此目录。
- **装饰 PNG**（`bunny-cute.png`、`washi-tape.png` 等）：已在此目录，由 Vite 直接提供。
- 用户新上传的图片走 OSS `/uploads/`，不在此目录。
