import { Component } from 'solid-js'
import { Chessboard23 } from 'chessboard23'
import Chessreplay23 from 'chessreplay23'
import { Chessidea23 } from 'chessidea23'
import { _Chessanalysis23 } from './ctrl'

const Chessanalysis23: Component<{}> = props => {

  let ctrl = new _Chessanalysis23()

  return (<>
    <div class='chessanalysis23'>
      <h3> Ideas </h3>
      <div class='ideas'>
      </div>
      <h3> Puzzles </h3>
      <div class='puzzles'> </div>
    </div>
  </>)
}


export default Chessanalysis23
