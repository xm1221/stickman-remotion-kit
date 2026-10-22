# stickman-remotion-kit · 火柴人 Remotion 短片工具包

用 Remotion（React + TypeScript + SVG）纯代码制作极简线条火柴人短片的技能说明、素材、辅助工具和完整范例。
*English: a reusable skill + tools + a full example for making minimal line-art stick-figure films with Remotion.*

## 目录
| 路径 | 内容 |
|---|---|
| `SKILL.md` | 通用制作流程（skill `stickman-remotion-film`）：工程结构、分屏布局、第一人称书桌、动画规则、中文字体、渲染与验收、经验教训 |
| `films/zhizhen-yu-guangbiao/` | 范例：马原实践作业短片《指针与光标》Remotion 工程，保留原 git 历史 |
| `assets/svg-poses/` | 16 个独立火柴人姿态 SVG |
| `tools/stix/` | stix 火柴人姿态/表情/道具/过渡库与 skill（MIT，上游 bassimeledath/stix@20806f1） |
| `tools/stickfigure-recorder/` | 摄像头录制 → 火柴人 GIF（MIT，上游 kenkawakenkenke/stickfigure-recorder@a4e3676；Firebase key 已脱敏） |
| `tools/stickman-svg-editor/` | 导出 SMIL 动画 SVG 的火柴人编辑器（上游 madeindjs/stickman@e2d4bae；已去掉 2MB 截屏 .mov） |
| `docs/brief/` `docs/story/` | 《指针与光标》brief、《两个人》剧本 |
| `docs/prompts/` | 第一版给 Claude Code 的实现提示词 |
| `docs/assets-inventory.md` | 素材调研清单 |
| `scripts/stills.sh` `scripts/contact-sheet.sh` | 抽帧检查、生成带时间码的缩略图总览 |

## 版本标签（范例工程）
- `zhizhen-v3`：2:48 时长，第一人称书桌版（原 tag `v3`，commit 16728db）
- `zhizhen-v4`：《指针与光标 2.0：拔掉退格键》，4:00 时长（commit 84a64da）

## 运行范例
```bash
sudo apt install fonts-noto-cjk          # 渲染机需要中文字体（或 PingFang SC / Microsoft YaHei）
cd films/zhizhen-yu-guangbiao
npm i
npm run dev                              # Remotion Studio 预览
npx tsc --noEmit                         # 类型检查
npx remotion render src/index.ts PointerAndCursor out/zhizhen-yu-guangbiao.mp4
../../scripts/contact-sheet.sh out/zhizhen-yu-guangbiao.mp4
```
需要 Node 20.19+/22.13+。渲染出的 mp4 不入库（见 `.gitignore`）。

## 做新片
照 `SKILL.md` 的步骤：先拆分幕和时间线，写 `timeline.ts`，从范例复制 `components/` 后改角色和场景，跑类型检查和抽帧检查，最后全片渲染并生成缩略图总览。
