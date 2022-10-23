import { Component } from 'solid-js'
import { Chessboard23 } from 'chessboard23'
import Chessreplay23 from 'chessreplay23'
import { _Chessanalysis23 } from './ctrl'

const Chessanalysis23: Component<{}> = props => {

  let ctrl = new _Chessanalysis23()

  return (<>
    <div class='chessanalysis23'>
      <div class='board-wrap'>
        <Chessboard23 fen={ctrl.fen} shapes={''} drag={''}/>
      </div>

      <div class='side'>
        <div class='navigation'>
          <button onClick={_ => ctrl._select.i_current_puzzle = -1}>prev</button>
          <span>{ctrl._select.i_current_puzzle}/</span>
          <span>{ctrl._select.nb_puzzles}</span>
          <button onClick={_ => ctrl._select.i_current_puzzle = 1}>next</button>
        </div>
        <div class='replay-wrap'>
          <Chessreplay23 on_hover={_ => ctrl._select.on_hover(_)} moves={ctrl._select.current_replay_fen}/>
        </div>
      </div>
    </div>
    </>)
}


export default Chessanalysis23
