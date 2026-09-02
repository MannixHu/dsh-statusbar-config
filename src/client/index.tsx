/**
 * Browser half: shadow the shipped `conversation.composer.dock` entry with
 * id `stats` (lower priority wins the cell) and contribute the settings card
 * dispatched by the Plugins tab under this plugin's namespace key.
 */
import type { ClientContextLike } from './runtime.js'
import { SETTINGS_NAMESPACE_VALUE, decodeSettings, type StatusbarSettings } from '../settings.js'
import { StatusbarSettingsCard } from './SettingsCard.js'
import { LOCALE_NAMESPACE, en, zh } from './locales.js'
import { ConfigurableStatsLine } from './StatsLine.js'
import { STYLE_ID, styles } from './styles.js'

const PLUGIN_ID = 'dsh-statusbar-config'

export const inject = ['slots', 'settingsScope', 'locale'] as const

function installStyles(): () => void {
  document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`)?.remove()
  const tag = document.createElement('style')
  tag.dataset.plugin = PLUGIN_ID
  tag.dataset.pluginCss = STYLE_ID
  tag.textContent = styles
  document.head.append(tag)
  return () => tag.remove()
}

export function apply(ctx: ClientContextLike): void {
  ctx.effect(installStyles, 'dsh-statusbar-config: styles')
  ctx.effect(() => ctx.locale.register(LOCALE_NAMESPACE, { zh, en }), 'dsh-statusbar-config: locale')
  const settings = ctx.settingsScope.bind<StatusbarSettings>({
    namespace: SETTINGS_NAMESPACE_VALUE,
    decode: decodeSettings,
  })

  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    key: SETTINGS_NAMESPACE_VALUE,
    locale: LOCALE_NAMESPACE,
    inject: () => ({ settings }) as Record<string, unknown>,
  }, StatusbarSettingsCard))

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
    name: 'conversation.composer.dock',
    id: 'stats',
    order: 0,
    priority: -1,
    locale: LOCALE_NAMESPACE,
    inject: () => ({ settings }) as Record<string, unknown>,
  }, ConfigurableStatsLine))
}
