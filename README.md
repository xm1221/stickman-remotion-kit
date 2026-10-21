# 《指针与光标》— 马原实践作业火柴人短剧（Remotion）

按 `/workspace/stickman-assets/brief/zhizhen-yu-guangbiao-brief.md` 实现。纯 SVG 火柴人 + `interpolate`/`spring`，无外部素材、无音频。

- Composition id：**`PointerAndCursor`**
- 1920×1080 · 30fps · 5400 帧（3:00）
- 布局：上半「思维剧场」（红=完美怪 / 蓝=畏难怪），下半「现实书桌」（黑主角、笔记本 Word、时钟、精力条）

## 运行
```bash
npm i
npm run dev            # Remotion Studio（浏览器预览/拖时间轴）
npx remotion compositions   # 应列出 PointerAndCursor
```

## 渲染
```bash
# 全片（本机约 1.5 分钟）
npx remotion render PointerAndCursor out/zhizhen-yu-guangbiao.mp4 --concurrency=4
# 只渲第一幕前 30 秒
npx remotion render PointerAndCursor out/act1-demo.mp4 --frames=0-899
# 单帧检查
npx remotion still PointerAndCursor out/check.png --frame=2800
```

## 时间线（帧 @30fps）
| 幕 | 帧 | 时间 | 内容 |
|---|---|---|---|
| 第一幕 对峙与同一体 | 0–1049 | 0:00–0:35 | 22:00、精力100%、Word 光标闪烁；思维气泡展开，红蓝背靠背跳出；红拔教鞭“慢着！”、蓝掏手机躺平；红踹飞手机、蓝枕头反击 |
| 第二幕 内耗空转 | 1050–2699 | 0:35–1:30 | 时钟快进到 23:20、精力 100→15%、蚊香圈；打出“马克思指出，实践是……”后狂按退格；红搬《词典》砸蓝，蓝化史莱姆缠脖，两人滚成打架云 |
| 第三幕 危机与实践 | 2700–4199 | 1:30–2:20 | 23:51 全屏红光警报（电量3%/剩8分钟）；主角重影疯狂打字，三行框架化作陨石砸进脑内，冲击波掀翻红蓝 |
| 第四幕 矛盾转化 | 4200–4949 | 2:20–2:45 | 红扶眼镜审视“立住了”，蓝“我来填例子”；红笔批改+蓝铲砖协作；23:58:30、100% 完成、回车+确认提交、绿色对勾【提交成功】、主角瘫椅傻笑 |
| 尾声 字幕 | 4950–5399 | 2:45–3:00 | 画面收缩渐黑，淡入演职员名单与哲学映射 |

## 代码结构
```
src/
  Root.tsx               注册 Composition
  PointerAndCursor.tsx   总装：分屏、镜头抖动、各幕 <Sequence>、尾声收缩
  timeline.ts            全局时间线：时钟/精力/电量/文档文字/完成度/抖动/陨石排期
  utils.ts               ip()/track()/hop() 插值工具、配色、字体
  components/
    poses.ts             关节姿势库 + lerpPose/poseTrack
    StickFigure.tsx      SVG 火柴人（表情、眼镜、道具插槽）
    SpeechBubble.tsx     对白气泡 + 拟声字 Pop
    Laptop.tsx Clock.tsx EnergyBar.tsx ThoughtFrame.tsx Effects.tsx
  scenes/
    Desk.tsx             下半现实层（主角动作轨、键盘音效字、提交流程）
    Act1..Act4.tsx Credits.tsx  上半思维剧场各幕
```

## 改字幕/名单
`src/scenes/Credits.tsx` 里 `LINES`（“制作成员：小组作业”为占位）。

## 说明
- 片中没有音频，音效用画面上的拟声字（滴答/哒哒哒/砰/轰/叮）代替。需要音效的话，可以在剪映里按上表时间点配，或者在 Remotion 里加 `<Audio>`。
- 中文字体用本机的 Noto CJK。换机器渲染时，需要装 Noto Sans/Serif CJK SC 或任意中文字体。
