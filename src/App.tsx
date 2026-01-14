import './App.css'
import { RemindersPage } from './features/reminders/RemindersPage'
import { Title, Group } from '@mantine/core'
import { ThemeToggle } from './components/ThemeToggle'
import { useMantineColorScheme } from '@mantine/core'

function App() {
  const { colorScheme } = useMantineColorScheme()
  
  return (
    <>
      <header 
        className="app-header"
        style={{
          background: colorScheme === 'dark' 
            ? 'linear-gradient(135deg, #1c5f99 0%, #164d7a 100%)' 
            : 'linear-gradient(135deg, #228be6 0%, #1c7ed6 100%)',
        }}
      >
        <Group justify="space-between" align="center" style={{ width: '100%' }}>
          <Title order={1} className="app-title" style={{ flex: 1, textAlign: 'center' }}>
            Remindy
          </Title>
          <ThemeToggle />
        </Group>
      </header>
      <RemindersPage />
    </>
  )
}

export default App
