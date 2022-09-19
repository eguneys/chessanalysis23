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
      <div class='replay-wrap'>
      <Chessreplay23 moves={ctrl.replay_fen}/>
      </div>
      </div>
    </div>
      </>)
}


export default Chessanalysis23
