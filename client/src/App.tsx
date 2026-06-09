import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DiagramAnnotatePage } from './pages/create/DiagramAnnotatePage'
import { CreateDiagramPage } from './pages/create/CreateDiagramPage'
import { CreateFolderPage } from './pages/create/CreateFolderPage'
import { CreateModulePage } from './pages/create/CreateModulePage'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { ModulePage } from './pages/ModulePage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="module/:id" element={<ModulePage />} />
          <Route path="diagrams" element={<PlaceholderPage title="Интерактивные диаграммы" />} />
          <Route path="classes" element={<PlaceholderPage title="Классы / Ученики" />} />
          <Route path="create/folder" element={<CreateFolderPage />} />
          <Route path="create/module" element={<CreateModulePage />} />
          <Route path="create/diagram" element={<CreateDiagramPage />} />
          <Route path="create/diagram/annotate" element={<DiagramAnnotatePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
