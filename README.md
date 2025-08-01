# 🎬 屏幕录制 Chrome 扩展

![][version-url] [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) ![][license-url]

[version-url]: https://img.shields.io/github/v/release/arvinxx/umi-chrome-extensions-template
[license-url]: https://img.shields.io/github/license/arvinxx/umi-chrome-extensions-template

一款功能强大的 Chrome 扩展，支持屏幕录制和内置视频编辑功能，基于 Umi 框架构建。

![屏幕录制演示](https://user-images.githubusercontent.com/xxxxxx/demo.gif)

## ✨ 核心特性

- 🎥 **屏幕录制**：录制整个屏幕、特定窗口或浏览器标签页
- 🎵 **音频录制**：同时录制系统音频和麦克风声音
- ✂️ **内置视频编辑器**：无需外部工具即可剪辑、裁剪和编辑录制内容
- 🌋 **企业级框架**：基于 Umi 和 [umi-plugin-extension](https://github.com/arvinxx/umi-plugin-extensions) 构建，享受完整的 Umi 生态技术能力
- 📦 **开箱即用**：已配置 Chrome 扩展开发常用设置项
- 🔥 **热更新**：开发时 `options` 和 `popup` 页面支持 `react hot reload` 和 `react devtools`
- ♻️ **自动重载**：开发时 `contentScipts` 和 `background` 支持自动刷新
- 🔧 **配置收敛**：直接在 `.umi.ts` 或 `config.ts` 设置插件配置
- ⛑ **类型安全**：TypeScript 编写，已集成 Chrome 扩展类型定义文件
- 🚀 **版本发布**：使用 `semantic release` 实现语义化版本管理与自动发布流

## 🚀 快速开始

### 克隆模板

```bash
git clone https://github.com/arvinxx/umi-chrome-extension-template.git
```

### 安装依赖

推荐使用 pnpm 进行依赖管理：

```bash
pnpm install
```

## 🛠️ 开发

🔔 请确保您对 Chrome 扩展开发有基本了解。入门推荐：[Chrome 扩展开发全攻略](https://umi-plugin-extensions.vercel.app/tutorial)。

如果您对项目配置有疑问，请查阅 umi-plugin-extension 配置项文档：[配置文档](https://arvinxx.github.io/umi-plugin-extensions/#/api)

### 启动开发服务器

```bash
pnpm start
```

### 构建生产版本

生成可用于生产的扩展文件：

```bash
pnpm run build
```

### 打包扩展

创建用于 Chrome 网上应用店提交的 ZIP 文件：

```bash
pnpm run zip
```

## 🎯 核心功能

### 屏幕录制

我们的扩展提供了全面的屏幕录制功能：
- 全屏录制
- 窗口特定录制
- 浏览器标签页录制
- 系统音频和麦克风录制
- 实时录制计时器

### 视频编辑器

直接在浏览器中编辑您的录制内容：
- 基于时间轴的编辑
- 片段剪辑和裁剪
- 播放控制
- 导出编辑后的视频

## 🤝 贡献 [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com/)

欢迎社区提交 PR 和 issues！

## 📄 许可证

[MIT](./LICENSE) ® Arvin Xu