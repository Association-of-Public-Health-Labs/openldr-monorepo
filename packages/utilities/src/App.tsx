
import './App.css'
import { ModalWithPatientsCard } from './components/modal-with-patients-card'
import { DataTable } from './components/data-table'
import data from './app/dashboard/data.json'

function App() {

  return (
    <>
      <ModalWithPatientsCard 
        data={data} 
      /> 
      <DataTable 
        data={data} 
      /> 
    </>
  )
}

export default App
