/**
 * 中文字典 — 不是英文站的直译,是面向大陆招聘市场、以中文简历为唯一事实源的
 * 重写(克制语域;「」标术语、“”留给引语;中西文之间手工留空格;技术专有名词
 * 保留英文)。
 *
 * 结构必须与 en.js 逐键同构 — 缺键即 bug。
 */
import { en } from "./en.js";

export const zh = en; // TEMPORARY — real mainland-market copy lands next wave
