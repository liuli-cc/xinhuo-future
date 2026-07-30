# 薪火未来18 连续实时模拟面试

## 当前交互

1. 上传 PDF、DOCX 或 TXT 简历，可选择岗位并生成谈话提纲。
2. 青年女性导师“林老师”通过浏览器语音合成自然提问。
3. 桌面版 Chrome 通过 Web Speech API 连续转写回答。
4. 候选人停顿约 1.3 秒后自动结束本轮，系统分析回答并自然追问。
5. 面试约 15 分钟，界面不展示题号，不要求用户逐题点击录音和提交。
6. 自动完成或手动结束后生成面试报告，保存转写文本和表达指标，不保存原始录音。

## 关键实现

| 文件 | 作用 |
|------|------|
| `app/interview/page.tsx` | 连续通话状态、自动轮转、动态追问、文字降级和报告 |
| `app/components/ContinuousSpeechRecognition.tsx` | Chrome 连续识别、静音自动提交、识别自动重连和音量统计 |
| `app/components/VirtualInterviewer.tsx` | 青年女性卡通导师及待机、提问、倾听、思考、记录动作 |
| `lib/speech-analysis.ts` | 语速、停顿、口头语和 STAR 表达分析 |
| `lib/scoring-v2.ts` | 30+20+20+15+15 五维百分制评分、优缺点与行动计划 |
| `lib/interview-report-export.ts` | 人类可读的 Markdown 报告与统一文件名 |

旧的 `VoiceRecorder` 前端组件已经删除。当前页面不再把 WAV/Base64 录音上传到腾讯云 ASR。

## 浏览器与隐私

- 推荐桌面版 Chrome。
- 首次使用需要允许本地页面访问麦克风。
- Chrome 不支持、权限被拒绝或识别网络异常时，当前轮次自动切换为文字输入。
- 浏览器只提取实时转写和音量帧统计；音频流在每轮结束后立即释放。
- 原始音频不进入数据库，也不发送给平台后端。
- 浏览器 TTS 不做口型同步，避免增加候选人的面试压力。

## 模型与降级

- 支持 DeepSeek、Kimi、GLM，API Key 仅保留在当前页面内存。
- 模型正常时，根据上下文、简历和岗位动态追问。
- 模型暂时不可用时，使用已生成的谈话提纲继续。
- 语音不可用时使用文字回答，不中断当前面试。

## 报告生成与导出

- 至少完成一轮回答后，“结束并生成报告”会立即停止通话并生成报告。
- 报告先在当前浏览器生成，再尝试保存到 CloudBase；网络失败不会丢失当前报告。
- 报告页面展示综合分、五维得分、回答亮点、改进建议、行动计划和逐题证据。
- “下载报告”导出 Markdown；“打印 / 保存 PDF”调用浏览器标准打印界面。

## 本地运行

```bash
NEXT_PUBLIC_API_BASE="https://xinhuo-d8gxyksn2f7095c5a.service.tcloudbase.com/api" npm run dev -- --hostname 127.0.0.1 --port 4173
```

打开 `http://127.0.0.1:4173/interview`。本地来源与正式站点来源不同，需要在本地页面重新登录一次。

## 验证命令

```bash
npm run lint
npm run test:unit
npm run build
node --test tests/rendered-html.test.mjs
```

## 兼容接口

云函数仍保留原腾讯 ASR/TTS 接口，供旧客户端兼容；当前网页不调用这些接口。本次本地预览不更新云函数，也不部署腾讯云静态站点。
