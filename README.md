# dsh-statusbar-config

[English](./README.en.md) | **中文**

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI 插件：让输入框下方的会话统计行**可配置**——每个段落可独立开关，即时生效。

实现方式：以更低优先级影子化 `conversation.composer.dock` 槽位中官方的 `stats` 条目，用与官方 StatsLine 完全一致的数据与格式重新渲染，再按你的开关过滤。

## 段落

| 设置 | 默认 | 显示 |
|---|---|---|
| `turns` / `steps` | 开 | `12 轮 · 34 步` |
| `llmTime` | 开 | `LLM 3m12s` |
| `toolTime` | 开 | `工具调用 1m8s` |
| `ttft` | 开 | `首 token 平均 0.8s` |
| `throughput` | 开 | `42 tok/s` |
| `cacheHit` | 开 | `缓存命中 87%` |
| `inputTokens` / `outputTokens` | 开 | `输入 12.3K tok · 输出 4.5K tok` |
| `enabled` | 开 | 整行隐藏，但保留各项开关设置 |

## 安装

```bash
dsh plugin --profile web add github:<you>/dsh-statusbar-config
```

然后重启 `dsh web`（加载器图在进程启动时冻结）。

## 配置

两种等价方式：

- **界面里** — 设置 → 插件 → *会话统计* 卡片（改动即时生效）。
- **`~/.dsh/settings.yaml`** — `status-bar-config` 命名空间：

```yaml
status-bar-config:
  enabled: true
  turns: false
  steps: false
  llmTime: false
  toolTime: false
  ttft: true
  throughput: true
  cacheHit: true
  inputTokens: true
  outputTokens: true
```

渲染结果正好是：

```
首 token 平均 0.9s · 42 tok/s | 缓存命中 87% | 输入 12.3K tok · 输出 4.5K tok
```

命名空间与 rc 时代的 `dsh-status-bar-config` 插件字段兼容，已有的 settings 段可直接沿用。

## 兼容性

- 需要 DSH `0.1.2-alpha`+（客户端图依赖只声明了 alpha 重组后仍存在的包：`dsh-client-locale`、`dsh-client-ui-renderer`、`dsh-client-ui-settings`、`dsh-client-ui-conversation`）。
- 构建产物（`lib/`）随仓库提交，git 安装无需构建步骤，也不需要 `onlyBuiltDependencies` 白名单。

## 从源码构建

```bash
pnpm install
pnpm check   # 类型检查 + 构建（lib/index.js 宿主半，lib/client.js 浏览器半）
```

## 许可

MIT
