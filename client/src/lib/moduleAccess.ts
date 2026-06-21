import type { Module } from '../types/module'

export function isModuleLinkedCopy(module: Module): boolean {
  return Boolean(module.sourceModuleId)
}

export function getSourceModuleId(module: Module): string {
  return module.sourceModuleId ?? module.id
}

export function getLinkedCopyId(sourceModuleId: string): string {
  return `copy-${sourceModuleId}`
}

export function isModuleOwner(module: Module, userId?: string): boolean {
  return Boolean(userId && module.author.id === userId)
}

export function canEditModuleContent(module: Module, userId?: string): boolean {
  return isModuleOwner(module, userId) && !isModuleLinkedCopy(module)
}

export function canViewModuleSrs(module: Module, userId?: string): boolean {
  return isModuleOwner(module, userId)
}

export function canSetModuleSrsStatus(module: Module, userId?: string): boolean {
  return isModuleOwner(module, userId)
}
