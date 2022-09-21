import _Chessanalysis23 from './ctrl'
import Chessboard23 from 'chessboard23'
import Chessreplay23 from 'chessreplay23'
import { onScrollHandlers } from 'solid-play'

const Chessanalysis23 = props => {

  let ctrl = new _Chessanalysis23()

  onScrollHandlers(ctrl)

  return (<>
    <div class='chessanalysis23'>
      <div class='ca-main'>
      <div class='board-wrap'>
        <Chessboard23 fen={ctrl.board_fen}/>
      </div>
      </div>
      <div class='ca-side'>
      <div class='nav'>
        <button onClick={() => ctrl.m_analysis.i = -1}>prev</button>
        <span>{ctrl.m_analysis.text}</span>
        <button onClick={() => ctrl.m_analysis.i = 1} >next</button>
      </div>
      <div class='replay-wrap'>
      <Chessreplay23 on_hover={_ => ctrl.on_hover(_)} moves={ctrl.replay_fen}/>
      <Chessreplay23 on_hover={_ => ctrl.on_hover(_, true)} moves={ctrl.replay_fen2}/>
      </div>
      </div>
    </div>
      </>)
}


export default Chessanalysis23
