#!/usr/bin/env python3
"""Append the July 29 resume-parser update to the existing user guide."""

from io import BytesIO
from pathlib import Path
import sys

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def paragraph(text, style):
    return Paragraph(text.replace("\n", "<br/>"), style)


def build_update_pages() -> BytesIO:
    pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="薪火未来平台使用指南 - 简历解析更新",
    )
    title = ParagraphStyle("title", fontName="STSong-Light", fontSize=20, leading=28, textColor=HexColor("#16324F"), spaceAfter=8)
    subtitle = ParagraphStyle("subtitle", fontName="STSong-Light", fontSize=10, leading=16, textColor=HexColor("#53718C"), spaceAfter=18)
    heading = ParagraphStyle("heading", fontName="STSong-Light", fontSize=14, leading=22, textColor=HexColor("#0E7490"), spaceBefore=10, spaceAfter=7)
    body = ParagraphStyle("body", fontName="STSong-Light", fontSize=10.5, leading=18, textColor=HexColor("#263746"), spaceAfter=7)
    note = ParagraphStyle("note", fontName="STSong-Light", fontSize=9.5, leading=15, textColor=HexColor("#4A5568"), backColor=HexColor("#EFF8FF"), borderColor=HexColor("#BAE6FD"), borderWidth=0.5, borderPadding=8, spaceBefore=5, spaceAfter=10)

    story = [
        paragraph("简历上传与识别功能更新", title),
        paragraph("更新日期：2026-07-29　　适用于薪火未来18模拟面试页面", subtitle),
        paragraph("本页为原《薪火未来平台使用指南》的补充。原指南其余内容保持不变。", note),
        paragraph("本次更新内容", heading),
        paragraph("1. 结构化识别增强：支持中文或英文栏目标题、同一行标签、多行项目描述和常见日期格式。学历、专业、项目经历、实习经历、竞赛奖项会分别回填到可编辑预览区。", body),
        paragraph("2. PDF 运行稳定性修复：云端 PDF 文字提取改为不依赖 Mac 或 Linux 原生组件的实现，避免因服务器运行环境差异出现“PDF解析组件暂未就绪”。", body),
        paragraph("3. 上传链路保持支持：PDF、DOCX、TXT，单个文件最大 3MB；上传完成后请先核对预览结果，再进入岗位选择和连续语音面试。", body),
        paragraph("正确使用步骤", heading),
    ]
    steps = [
        ["1", "登录平台后，进入“模拟面试”页面。"],
        ["2", "点击“上传简历文件”，选择小于 3MB 的 PDF、DOCX 或 TXT 简历。"],
        ["3", "等待“解析结果（请确认和修改）”出现，检查姓名、学历、专业、技能、项目、实习和竞赛证书。"],
        ["4", "若某个字段未完全识别，可直接在预览输入框中修改；确认后点击“确认简历，下一步”。"],
        ["5", "填写或选择岗位，生成面试提纲，再开始与林老师的连续模拟面试。"],
    ]
    table = Table([[paragraph(a, body), paragraph(b, body)] for a, b in steps], colWidths=[12 * mm, 158 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), HexColor("#E0F2FE")),
        ("TEXTCOLOR", (0, 0), (0, -1), HexColor("#075985")),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, HexColor("#D7E5EE")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story += [table, Spacer(1, 8), paragraph("识别边界与处理方式", heading)]
    story += [
        paragraph("注意 1：扫描件、图片型 PDF 或加密 PDF 没有可复制文本时，无法直接提取经历内容。建议使用原始 DOCX，或先做 OCR 后再上传。", body),
        paragraph("注意 2：若简历原文没有项目、实习或竞赛栏目，系统会保留为空，不会编造内容。可以在预览区手动填写。", body),
        paragraph("验证结果：真实文本型 PDF 已在线成功识别“本科”和“计算机科学与技术”；包含完整经历的样例已在线成功回填项目、实习和竞赛字段。", body),
        paragraph("平台地址：https://xinhuo-d8gxyksn2f7095c5a-1459723948.tcloudbaseapp.com/interview", note),
    ]
    document.build(story)
    buffer.seek(0)
    return buffer


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: update_pdf_guide.py SOURCE_GUIDE OUTPUT_GUIDE")
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    writer = PdfWriter()
    for page in PdfReader(str(source)).pages:
        writer.add_page(page)
    for page in PdfReader(build_update_pages()).pages:
        writer.add_page(page)
    with output.open("wb") as file:
        writer.write(file)


if __name__ == "__main__":
    main()
