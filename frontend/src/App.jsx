import Home from './pages/Home'
import { WalletProvider } from './context/WalletContext'

function App() {
  return (
    <WalletProvider>
      <Home />
    </WalletProvider>
  )
}

export default App
