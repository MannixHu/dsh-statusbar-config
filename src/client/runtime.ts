/**
 * Minimal structural types for the shell runtime seams this plugin touches.
 * The plugin bundle must stay importable without any @deepseek-ai runtime
 * package as a graph dependency, so everything here is structural.
 */
import type { ComponentType } from 'react'
import type { StatusbarSettings } from '../settings.js'

export interface SettingsScopeSnapshotLike<T> {
  status: 'loading' | 'ready' | 'unavailable'
  value: T | undefined
  writable: boolean
}

export interface SettingsScopeLike<T> {
  getSnapshot(): SettingsScopeSnapshotLike<T>
  subscribe(listener: () => void): () => void
  set(field: string, value: unknown): Promise<void>
  unset(field: string): Promise<void>
}

export interface SlotRegistration {
  name: string
  id?: string
  key?: string
  order?: number
  priority?: number
  locale?: string
  inject?: (...args: never[]) => Record<string, unknown>
}

// The shell composes props dynamically; the exact prop set is up to each slot.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type SlotComponent = ComponentType<any>

export interface SlotsLike {
  inject(name: string, register: () => { dispose?: () => void } | void): void
  register(options: SlotRegistration, component: SlotComponent): { dispose?: () => void }
}

export interface ClientContextLike {
  effect(factory: () => void | (() => void), label?: string): void
  locale: {
    register(namespace: string, dictionaries: { zh: Record<string, string>; en: Record<string, string> }): () => void
  }
  settingsScope: {
    bind<T>(spec: { namespace: string; decode?: (section: unknown) => T | undefined }): SettingsScopeLike<T>
  }
  slots: SlotsLike
}
