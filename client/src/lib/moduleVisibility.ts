import type { Module, ModuleVisibility } from '../types/module'

export function getModuleVisibility(module: Module): ModuleVisibility {
  return module.visibility ?? 'public'
}

export function isModulePublic(module: Module): boolean {
  return getModuleVisibility(module) === 'public'
}

export function moduleVisibilityLabel(module: Module): string {
  return isModulePublic(module) ? 'Открытый модуль' : 'Закрытый модуль'
}
