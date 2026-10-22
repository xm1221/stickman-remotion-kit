# 火柴人动作素材清单（《两个人》用）

本地已克隆到本目录，先准备、暂不渲染。

## 最推荐直接用

### 1. stix（MIT）— 姿势 + 过渡公式最全
- 路径: `stix/library/`
- 姿势 SVG 片段: `poses.md`（standing / walking / sitting / reaching / sitting_slouched 等 16 种）
- 表情: `expressions.md`
- 道具: `props.md`（table, coffee mug 等，可改成书桌）
- CSS 过渡: `transitions.md`（walk_cycle, sit_down, wave, head_drop, sweat_drops, phase_transition）
- 许可: MIT
- 仓库: https://github.com/bassimeledath/stix

### 2. stickfigure-recorder（MIT）— 真人表演 → 火柴人 GIF
- 路径: `stickfigure-recorder/`
- 在线: https://stickfigure-recorder.web.app/
- 用途: 自己演「拉扯 / 犹豫 / 点发送」，导出 GIF 再进剪辑或程序
- 仓库: https://github.com/kenkawakenkenke/stickfigure-recorder

### 3. stickman SVG editor
- 路径: `stickman-svg-editor/`
- 导出可复用的 animated SVG（纯 SVG SMIL，无 JS）
- 仓库: https://github.com/madeindjs/stickman

## 其他可参考（不优先）

| 项目 | 说明 | 适合度 |
|------|------|--------|
| [Pivot STK Library](https://pivotanimator.net/stk-library/) | 上千个 .stk 角色/动作包，免费 | 高，但软件仅 Windows |
| [StykAnimate Library](https://stykanimate.com/library/) | .stkz / .stykmov 社区素材 | 高，绑定 StykAnimate |
| CMU BVH / Ready Player Me | 真人动捕骨骼 | 中，要重定向到火柴人骨架 |
| Stick-Gen | 文本→动作模型 | 低，许可特殊且偏重 |
| stick-figure-comic skill | 静态图文海报 | 低，不是动作库 |

## 对上《两个人》分镜的姿势映射

| 镜 | 建议姿势 / 过渡（来自 stix） |
|----|------------------------------|
| 开场桌前 | sitting + sitting_slouched |
| 阿想拦稿 | reaching + head_drop + sweat_drops |
| 阿做推送 | reaching（反向）+ determined 表情 |
| 拉扯 | 两侧 reaching，文档 translateX；可自录 stickfigure-recorder |
| 版本空转 | phase_transition + sitting_slouched |
| 点发送 | reaching → standing |
| 并排坐下 | sit_down ×2 |

## 缺口（库里没有现成的）

- 「双手拽同一物体左右拉」：没有现成 tug-of-war 循环，需要自拼（两侧 reaching + 物体 translate）或 stickfigure-recorder 自拍
- 笔记本 / 发送按钮：props 里有 table、可改；发送按钮需自画一小块 SVG

