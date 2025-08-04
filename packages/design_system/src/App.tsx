import { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import { PatientsAdvancedDataTable } from '@repo/utilities'
// import data from './stories/assets/data.json'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button>Click me</Button>
      {/* <PatientsAdvancedDataTable data={[]} rowsPerPage={10} /> */}
    </div>
  )
}

export default App
