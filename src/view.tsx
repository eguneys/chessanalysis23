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

      <div class='replay-wrap'>
        <Chessreplay23 on_hover={_ => {}} moves={[]}/>
      </div>
    </div>
    </>)
}


export default Chessanalysis23
