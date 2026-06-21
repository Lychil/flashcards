import { Copy, Library } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getLinkedCopyId } from '../../lib/moduleAccess'
import {
  useCopyModuleToLibraryMutation,
  useGetLibraryModulesQuery,
} from '../../store/api/modulesApi'
import { moduleGhostButtonClass } from './moduleStyles'

interface ModuleCopyActionProps {
  sourceModuleId: string
}

export function ModuleCopyAction({ sourceModuleId }: ModuleCopyActionProps) {
  const navigate = useNavigate()
  const { data: libraryModules = [] } = useGetLibraryModulesQuery()
  const [copyModule, { isLoading }] = useCopyModuleToLibraryMutation()

  const existingCopy = libraryModules.find(
    (module) => module.sourceModuleId === sourceModuleId,
  )
  const copyId = existingCopy?.id ?? getLinkedCopyId(sourceModuleId)

  const handleCopy = async () => {
    const copy = await copyModule(sourceModuleId).unwrap()
    navigate(`/module/${copy.id}`)
  }

  if (existingCopy) {
    return (
      <Link
        to={`/module/${copyId}`}
        className={[
          moduleGhostButtonClass,
          'h-9 rounded-xl border border-border bg-white px-3 py-2',
        ].join(' ')}
      >
        <Library size={15} strokeWidth={2} aria-hidden />
        В библиотеке
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isLoading}
      className={[
        moduleGhostButtonClass,
        'h-9 rounded-xl border border-border bg-white px-3 py-2',
        'disabled:cursor-wait disabled:opacity-60',
      ].join(' ')}
    >
      <Copy size={15} strokeWidth={2} aria-hidden />
      {isLoading ? 'Копирование…' : 'В мою библиотеку'}
    </button>
  )
}
