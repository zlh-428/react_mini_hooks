import { useState } from 'react'
import schedule from "./hooks/mini_useState"

function App() {
  window.app = schedule();

  return (
    <>
      <div>
        hooks
      </div>
    </>
  )
}

export default App
