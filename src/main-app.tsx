import { createSignal, createMemo } from 'solid-js'
import Chessanalysis23 from './view'

const App = () => {

  let _fen = createSignal(``)

  let m_fen = createMemo(() => _fen[0])

  return (<>
      <Chessanalysis23 fen={m_fen()}/>
      </>)
}



export default App
