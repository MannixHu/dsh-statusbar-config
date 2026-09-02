# dsh-statusbar-config

**English** | [中文](./README.md)

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI plugin that makes the conversation statistics row below the composer **configurable** — every segment can be toggled on/off independently, live.

It shadows the shipped `stats` entry in the `conversation.composer.dock` slot (lower priority wins the cell) and re-renders the same figures with the same formatting as the official StatsLine, filtered through your toggles.

## Segments

| Setting | Default | Display |
|---|---|---|
| `turns` / `steps` | on | `12 turns · 34 steps` |
| `llmTime` | on | `LLM 3m12s` |
| `toolTime` | on | `Tool call 1m8s` |
| `ttft` | on | `TTFT avg 0.8s` |
| `throughput` | on | `42 tok/s` |
| `cacheHit` | on | `Cache hit 87%` |
| `inputTokens` / `outputTokens` | on | `Input 12.3K tok · Output 4.5K tok` |
| `enabled` | on | Hide the whole row without losing your choices |

## Install

```bash
dsh plugin --profile web add github:<you>/dsh-statusbar-config
```

Then restart `dsh web` (the loader graph is frozen at process start).

## Configure

Two equivalent ways:

- **In the UI** — Settings → Plugins → *Conversation statistics* card (changes apply immediately).
- **In `~/.dsh/settings.yaml`** — the `status-bar-config` namespace:

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

which renders exactly:

```
TTFT avg 0.9s · 42 tok/s | Cache hit 87% | Input 12.3K tok · Output 4.5K tok
```

The namespace is field-compatible with the rc-era `dsh-status-bar-config` plugin, so existing settings sections keep working.

## Compatibility

- Requires DSH `0.1.2-alpha`+ (the plugin declares only client-graph packages that exist in the alpha reorganization: `dsh-client-locale`, `dsh-client-ui-renderer`, `dsh-client-ui-settings`, `dsh-client-ui-conversation`).
- The built client bundle is committed (`lib/`), so installing from git needs no build step and no `onlyBuiltDependencies` entry.

## Build from source

```bash
pnpm install
pnpm check   # typecheck + build (lib/index.js host half, lib/client.js browser half)
```

## License

MIT
