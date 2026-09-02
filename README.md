# dsh-statusbar-config

[English](./README.en.md) | **中文**

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI 插件：用**模板完全自定义**输入框下方的会话统计行——JS 模板字符串语法 `${变量}`，想要什么写什么，即时生效。

<p align="center"><img src="./assets/stats-bar.png" alt="状态栏模板渲染效果：只显示模板里写的段落" width="560"></p>

实现方式：以更低优先级影子化 `conversation.composer.dock` 槽位中官方的 `stats` 条目，数据与官方 StatsLine 同源同精度，显示内容完全由你的模板决定。

## 模板变量

| 变量 | 含义 | 示例值 |
|---|---|---|
| `${ttft}` | 首 token 平均秒数（纯数字） | `5.8` |
| `${tps}` | 解码速度 tok/s（纯数字） | `69` |
| `${cache}` | 缓存命中率（百分数，不带 %） | `93` |
| `${input}` | 计费输入 token（紧凑格式） | `63.7M` |
| `${output}` | 输出 token（紧凑格式） | `178K` |
| `${turns}` / `${steps}` | 轮数 / 步数 | `12` / `34` |
| `${llm}` / `${tool}` | LLM / 工具调用累计时长（自带单位） | `3m12s` |

单位、分隔符、任何文字都由你写在模板里；未知变量原样显示；暂无数据的变量渲染为空。

## 安装

```bash
dsh plugin --profile web add github:MannixHu/dsh-statusbar-config
```

然后重启 `dsh web`（加载器图在进程启动时冻结）。

## 配置

两种等价方式：

- **界面里** — 设置 → 插件 → *状态栏模板* 卡片：点变量芯片插入到光标处，回车保存，即时生效（推荐）。
- **`~/.dsh/settings.yaml`** — `status-bar-config` 命名空间：

```yaml
status-bar-config:
  enabled: true
  template: '首 token 平均 ${ttft}s · ${tps} tok/s | 缓存命中 ${cache}% | 输入 ${input} tok · 输出 ${output} tok'
```

渲染结果：

```
首 token 平均 5.8s · 69 tok/s | 缓存命中 93% | 输入 63.7M tok · 输出 178K tok
```

`template` 留空 = 默认统计行（与官方相同的全量段落）；`enabled: false` = 整行隐藏。0.1 版的段落开关已被模板取代，旧的 yaml 布尔键会被忽略，升级后改用 `template` 即可。

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
