import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BeautifulMindPage from './apps/beautifulmind/BeautifulMindPage'
import GamesPage from './apps/games/GamesPage'
import DynamicManifest from './components/shared/DynamicManifest'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <DynamicManifest />
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/beautifulmind" element={<BeautifulMindPage />} />
          <Route path="/games" element={<GamesPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
