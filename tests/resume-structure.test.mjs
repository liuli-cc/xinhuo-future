import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const { parseResumeStructure } = require("../functions/xinhuo-api/resume-structure.js");

test("结构化解析不会把后续栏目串入当前字段", () => {
  const text = fs.readFileSync(new URL("./fixtures/e2e-resume.txt", import.meta.url), "utf8");
  const resume = parseResumeStructure(text);

  assert.equal(resume.name, "测试同学");
  assert.equal(resume.education, "本科");
  assert.equal(resume.major, "计算机科学与技术");
  assert.deepEqual(resume.skills, ["Python", "TypeScript", "数据分析"]);
  assert.equal(resume.projects.length, 1);
  assert.equal(resume.internships.length, 1);
  assert.equal(typeof resume.internships[0].company, "string");
  assert.equal(typeof resume.internships[0].role, "string");
  assert.equal(resume.competitions.length, 1);
  assert.equal(typeof resume.competitions[0].award, "string");
  assert.match(resume.selfEval, /学习主动/);
});

test("能从常见的独立章节和单行教育经历中提取完整字段", () => {
  const resume = parseResumeStructure(`
李明

教育背景 EDUCATION
2021.09 - 2025.06 内蒙古师范大学 软件工程 本科

专业技能
JavaScript、React、Node.js

项目经验
2023.03 - 2023.12 校园招聘平台
项目描述：面向毕业生提供岗位检索与智能推荐
技术栈：React、Node.js、PostgreSQL

实习经验
2024.07 - 2024.10 北京星火科技有限公司 前端开发实习生
工作内容：负责招聘后台页面开发和接口联调

荣誉奖项
2024 全国大学生计算机设计大赛 省级二等奖
  `);

  assert.equal(resume.name, "李明");
  assert.equal(resume.education, "本科");
  assert.equal(resume.major, "软件工程");
  assert.deepEqual(resume.skills, ["JavaScript", "React", "Node.js"]);
  assert.equal(resume.projects.length, 1);
  assert.match(resume.projects[0].name, /校园招聘平台/);
  assert.match(resume.projects[0].description, /智能推荐/);
  assert.equal(resume.internships.length, 1);
  assert.match(resume.internships[0].company, /北京星火科技有限公司/);
  assert.equal(resume.internships[0].role, "前端开发实习生");
  assert.match(resume.internships[0].description, /接口联调/);
  assert.equal(resume.competitions.length, 1);
  assert.match(resume.competitions[0].name, /计算机设计大赛/);
  assert.equal(resume.competitions[0].award, "省级二等奖");
});

test("兼容控制字符、分隔符标签和中英文章节标题", () => {
  const resume = parseResumeStructure(`
基本信息
姓名：王芳\u0001 | 学历：硕士研究生 | 专业名称：人工智能

TECHNICAL SKILLS
Python, PyTorch, 机器学习

PROJECT EXPERIENCE
智能问答系统
负责检索增强生成模块，实现知识库问答

WORK EXPERIENCE
某科技有限公司 | 算法工程师
负责文本分类模型训练与部署

AWARDS AND HONORS
中国国际大学生创新大赛：国家级铜奖
  `);

  assert.equal(resume.name, "王芳");
  assert.equal(resume.education, "硕士研究生");
  assert.equal(resume.major, "人工智能");
  assert.deepEqual(resume.skills, ["Python", "PyTorch", "机器学习"]);
  assert.match(resume.projects[0].name, /智能问答系统/);
  assert.match(resume.projects[0].description, /知识库问答/);
  assert.match(resume.internships[0].company, /某科技有限公司/);
  assert.equal(resume.internships[0].role, "算法工程师");
  assert.match(resume.competitions[0].name, /中国国际大学生创新大赛/);
  assert.equal(resume.competitions[0].award, "国家级铜奖");
});
