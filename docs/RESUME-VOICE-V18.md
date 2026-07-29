# V18 简历上传与语音面试说明

## 简历上传

- 支持 PDF、DOCX、TXT，单文件最大 3MB。
- 服务端同时校验扩展名、Base64 完整性和 PDF/DOCX 文件签名。
- PDF 使用 `pdf-parse` 2.x 的 `PDFParse` 类读取前 10 页；DOCX 从
  `word/document.xml` 提取正文。
- 手机号、身份证号、邮箱和地址在进入结构化解析前脱敏。
- 扫描版 PDF 暂不做 OCR，界面会明确提示用户转成可复制文字的 PDF 或 DOCX。

## 语音链路

1. 浏览器通过 Web Audio 采集单声道 PCM。
2. 浏览器本地降采样为 16kHz 并编码为 WAV。
3. 每次回答最长 60 秒，生成音频小于腾讯一句话识别的 3MB 限制。
4. 云函数将 WAV 转发给腾讯云 `SentenceRecognition`。
5. 识别失败时可重试上次录音、重新录音或切换文字输入。
6. 题目优先使用腾讯云 TTS；未配置或调用失败时自动使用浏览器中文语音。

原始录音仅用于当次识别，不写入数据库。报告保存转写文本与以下可观察指标：

- 开口前等待时间
- 有效发言时长
- 300ms 以上停顿次数与比例
- 语速、口头语、STAR 结构
- 平均音量与音量波动

这些指标只描述表达表现，不做心理或医学意义上的情绪诊断。

## 腾讯云配置

云函数优先读取：

- `TENCENT_SECRET_ID`
- `TENCENT_SECRET_KEY`
- `TENCENT_TOKEN`（临时凭证时可选）

CloudBase 运行时凭证也可使用：

- `TENCENTCLOUD_SECRETID`
- `TENCENTCLOUD_SECRETKEY`
- `TENCENTCLOUD_SESSIONTOKEN`

不要把凭证放入前端、源码、压缩包或提交记录。运行角色还需具备 ASR 与 TTS
相应的最小调用权限。
