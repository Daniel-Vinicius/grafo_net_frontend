import { AuthProvider } from './context/state'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  )
}

export default App
