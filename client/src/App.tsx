import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DiagramAnnotatePage } from './pages/create/DiagramAnnotatePage'
import { CreateDiagramPage } from './pages/create/CreateDiagramPage'
import { CreateFolderPage } from './pages/create/CreateFolderPage'
import { CreateModulePage } from './pages/create/CreateModulePage'
import { CollectionsPage } from './pages/CollectionsPage'
import { DiagramsPage } from './pages/DiagramsPage'
import { GlobalCollectionPage } from './pages/GlobalCollectionPage'
import { GlobalModulesPage } from './pages/GlobalModulesPage'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { ModulePage } from './pages/ModulePage'
import { ExamPlanPage } from './pages/ExamPlanPage'
import { CreateAiModulePage } from './pages/create/CreateAiModulePage'
import { ReviewSessionPage } from './pages/ReviewSessionPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { DiagramReviewPage } from './pages/DiagramReviewPage'
import { DiagramEditPage } from './pages/DiagramEditPage'
import { DiagramPage } from './pages/DiagramPage'
import { AuthPage } from './pages/AuthPage'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { LogoutPage } from './pages/LogoutPage'

function LegacyGlobalCollectionRedirect() {
  const { collectionId = '' } = useParams()
  return <Navigate to={`/collections/${collectionId}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="logout" element={<LogoutPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="review" element={<ReviewSessionPage />} />
          <Route path="plan" element={<ExamPlanPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="collections/:collectionId" element={<GlobalCollectionPage />} />
          <Route path="global" element={<GlobalModulesPage />} />
          <Route path="global/:collectionId" element={<LegacyGlobalCollectionRedirect />} />
          <Route path="module/:id" element={<ModulePage />} />
          <Route path="diagrams" element={<DiagramsPage />} />
          <Route path="diagrams/:diagramId" element={<DiagramPage />} />
          <Route path="diagrams/:diagramId/review" element={<DiagramReviewPage />} />
          <Route path="diagrams/:diagramId/edit" element={<DiagramEditPage />} />
          <Route path="classes" element={<PlaceholderPage title="Классы / Ученики" />} />
          <Route path="profile" element={<PlaceholderPage title="Профиль" />} />
          <Route path="settings" element={<PlaceholderPage title="Настройки" />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="create/folder" element={<CreateFolderPage />} />
          <Route path="create/module" element={<CreateModulePage />} />
          <Route path="create/ai" element={<CreateAiModulePage />} />
          <Route path="create/diagram" element={<CreateDiagramPage />} />
          <Route path="create/diagram/annotate" element={<DiagramAnnotatePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
