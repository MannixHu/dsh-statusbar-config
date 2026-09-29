/**
 * Browser half: shadow the shipped `conversation.composer.dock` entry with
 * id `stats` (lower priority wins the cell) and contribute the settings card
 * on this bundle's page in the Plugins section (`plugins.bundle.config`).
 */
import type { ClientContextLike } from './runtime.js'
import type { StatusbarSettings } from '../settings.js'
import { StatusbarSettingsCard } from './SettingsCard.js'
import { LOCALE_NAMESPACE, en, zh } from './locales.js'
import { ConfigurableStatsLine } from './StatsLine.js'
import { STYLE_ID, styles } from './styles.js'

const PLUGIN_ID = 'dsh-statusbar-config'

export const inject = ['slots', 'configForms', 'locale'] as const

function installStyles(): () => void {
  document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`)?.remove()
  const tag = document.createElement('style')
  tag.dataset.plugin = PLUGIN_ID
  tag.dataset.pluginCss = STYLE_ID
  tag.textContent = styles
  document.head.append(tag)
  return () => tag.remove()
}

function BundleConfigCard(props: Parameters<typeof StatusbarSettingsCard>[0] & { view?: string }) {
  return props.view === 'summary' ? null : <StatusbarSettingsCard {...props} />
}

export function apply(ctx: ClientContextLike): void {
  ctx.effect(installStyles, 'dsh-statusbar-config: styles')
  ctx.effect(() => ctx.locale.register(LOCALE_NAMESPACE, { zh, en }), 'dsh-statusbar-config: locale')
  // The Loader entry id from cordis.patch.yml; dsh 0.1.7+ keys config forms by it.
  const settings = ctx.configForms.get<StatusbarSettings>(PLUGIN_ID)

  // Keyed by the bundle's package name; `summary` is the one-line list view.
  ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
    name: 'plugins.bundle.config',
    key: PLUGIN_ID,
    locale: LOCALE_NAMESPACE,
    inject: () => ({ settings }) as Record<string, unknown>,
  }, BundleConfigCard))

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
    name: 'conversation.composer.dock',
    id: 'stats',
    order: 0,
    priority: -1,
    locale: LOCALE_NAMESPACE,
    inject: () => ({ settings }) as Record<string, unknown>,
  }, ConfigurableStatsLine))
}
