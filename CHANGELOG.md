# Changelog

## 0.2.1 (2026-09-03)

- Variable chips show a bilingual hover tooltip describing each `${variable}`
  (what it measures, format, example value); also exposed via `aria-label`
- Tooltip opens below the chip, aligns to its left edge, and is clamped inside
  the settings card so it never clips at either dialog edge
- Release tarball is attached with a version-less filename
  (`dsh-statusbar-config.tgz`) so `releases/latest/download/` links stay stable

## 0.2.0 (2026-09-02)

Template-driven status bar. The 0.1 per-segment toggles are superseded by a
single display template using JS template-literal syntax.

- `${variable}` placeholders: `${ttft}` `${tps}` `${cache}` `${input}`
  `${output}` `${turns}` `${steps}` `${llm}` `${tool}`; units and literals live
  in the template; unknown placeholders stay verbatim; no-data variables
  render empty
- Empty template = default official-style segments; `enabled: false` hides
  the row; the row is hidden before any step or token exists (official parity)
- Settings card: enabled toggle + template input with click-to-insert variable
  chips, Enter/blur save, bilingual guided hints
- Same settings namespace `status-bar-config`; legacy boolean keys in
  `settings.yaml` are ignored on load — migrate by writing `template:` instead

## 0.1.0 (2026-09-02)

Initial release. Shadows the shipped `conversation.composer.dock` `stats`
entry (priority -1) with a toggle-filtered StatsLine using the same data and
formatting as the official row; settings namespace registered on the host and
editable in Settings → Plugins.
