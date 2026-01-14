import './App.css'
import { RemindersPage } from './features/reminders/RemindersPage'
import { Title } from '@mantine/core'

function App() {
  return (
    <>
      <header className="app-header">
        <Title order={1} className="app-title">
          Remindy
        </Title>
      </header>
      <RemindersPage />
    </>
  )
}

export default App
