<div align="center">

# 素心导航

**一款极简风格的浏览器起始页**

毛玻璃质感 · 分组书签 · 多引擎搜索建议 · 壁纸滤镜 · 一键收藏扩展

<br>

[![纯静态](https://img.shields.io/badge/纯静态-单文件-orange?style=flat-square)](index.html)
[![无依赖](https://img.shields.io/badge/零依赖-原生JS-blue?style=flat-square)]()
[![Chrome扩展](https://img.shields.io/badge/Chrome-扩展配套-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](ext/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 预览

> 将壁纸文件拖入页面即可看到毛玻璃效果

![预览图](https://github.com/user-attachments/assets/placeholder)

---

## 功能特性

### 🔍 搜索
- 支持 **Google / Bing / 百度** 三个引擎一键切换
- 输入时实时拉取对应引擎的搜索建议（JSONP）
- 键盘 `↑` `↓` 导航建议列表，`Esc` 关闭
- 搜索框有呼吸动画，聚焦后停止

### 🗂 分组书签
- 书签按分组展示，分布在页面上下左右四个区域
- 支持**拖拽排序**（分组间、组内均可）
- 右键图标 → **快速删除 / 编辑**
- 每个分组可单独设置几列网格布局
- 管理面板（右下角按钮）可新建分组、批量管理

### 🌄 壁纸
- 支持**本地图片**上传（IndexedDB 持久化）
- 支持 **Bing 每日壁纸**自动获取
- 滤镜调节：暗角 · 亮度 · 对比度 · 饱和度

### 🎨 外观
- 6 款预设主题色（翡翠 / 天蓝 / 紫罗兰 / 橙焰 / 玫瑰 / 天青）
- 毛玻璃效果基于 `backdrop-filter`，随壁纸实时变化
- 彩色光晕背景，无壁纸时也有层次感

### 🕘 最近访问
- 自动记录最近点击的网站
- 最多保留 10 条，支持一键清除

---

## 快速开始

这是一个**纯静态单文件**项目，不需要构建，不需要服务器。

```bash
git clone https://github.com/Sunhaiy/suxin-nav.git
```

用浏览器直接打开 `index.html` 即可使用。

> **推荐**：在 Chrome 设置中将此页面设为「打开新标签页」或「主页」。

---

## Chrome 扩展：一键收藏

扩展让你在任意网页按一下工具栏按钮，就能把当前页面存入导航——无需跳转，直接在弹窗内选择分组。

### 安装步骤

**① 加载扩展**

1. 打开 `chrome://extensions`
2. 右上角开启「**开发者模式**」
3. 点击「**加载已解压的扩展程序**」
4. 选择本项目的 `ext/` 文件夹

**② 开启文件访问权限（必须）**

1. 在扩展列表找到「素心导航」→ 点「**详情**」
2. 打开「**允许访问文件网址**」

### 使用方法

```
在任意网页 → 点击工具栏「素心导航」按钮
    ↓
弹窗自动填入当前页标题和地址（可编辑）
    ↓
点击目标分组 → 立即保存 ✓
```

点击「**新建分组**」可以同时新建分组并保存，无需打开导航页。

### 离线可靠性

扩展使用 `chrome.storage.local` 作为队列缓冲，即使导航页**没有打开**，收藏也不会丢失——下次打开导航页时自动同步。

```
导航页关闭时收藏
  popup → 写入 sx-pending 队列

下次打开导航页
  content.js → 应用队列 → 更新数据 → 刷新页面
```

---

## 数据存储

全部数据存储在**本地浏览器**，无任何服务器交互。

| 数据 | 存储位置 |
|------|---------|
| 分组和书签 | `localStorage["sx-groups"]` |
| 最近访问 | `localStorage["sx-recent"]` |
| 主题色 / 搜索引擎 | `localStorage` |
| 壁纸图片 | `IndexedDB["sx-db"]` |
| 壁纸滤镜参数 | `localStorage["sx-wp-fx"]` |
| 扩展离线队列 | `chrome.storage.local["sx-pending"]` |

---

## 技术说明

- **零依赖**：纯原生 HTML / CSS / JavaScript，无框架，无构建工具
- **单文件**：整个页面就是一个 `index.html`，便于分发和备份
- **毛玻璃**：`backdrop-filter: blur()` + 动画结束后移除 `transform`（避免 Chrome 合成层问题）
- **搜索建议**：JSONP 动态 `<script>` 注入，绕过跨域限制
- **扩展通信**：content script ↔ `chrome.storage.local` ↔ `window.postMessage` 三层桥接

---

## 项目结构

```
suxin-nav/
├── index.html          # 主页（全部功能在此单文件中）
└── ext/                # Chrome 扩展
    ├── manifest.json   # 扩展声明
    ├── content.js      # 注入导航页，桥接 localStorage ↔ chrome.storage
    ├── popup.html      # 弹窗界面
    └── popup.js        # 弹窗逻辑
```

---

## License

[MIT](LICENSE) © 2025 Sunhaiy
