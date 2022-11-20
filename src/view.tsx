import { Component } from 'solid-js'
import { Chessboard23 } from 'chessboard23'
import Chessreplay23 from 'chessreplay23'
import { Chessidea23, Chessideareplay23 } from 'chessidea23'
import { _Chessanalysis23 } from './ctrl'
import { Tab, TabPanel, Tabs } from 'solid-ui'
import { FlatDoc } from 'lchessanalysis'
import { Puzzles } from './puzzles2'

const Chessanalysis23: Component<{}> = props => {

  let ctrl = new _Chessanalysis23()
  let puzzles = new Puzzles()

  return (<>
    <div class='chessanalysis23'>
      <div class='ideas'>
        <Tabs>
          <Tab>Idea</Tab>
          <Tab>Move</Tab>
          <TabPanel>
            <Chessidea23 on_rules={_ => puzzles.rules = _} fen={ctrl._idea_fen} on_fen={_ => ctrl._idea_fen = _}/>
          </TabPanel>
          <TabPanel>
            <Chessideareplay23 on_path={_ => {}} on_nodes={_ => {
            ctrl.nodes = _
            puzzles.nodes = _
            }} shapes={ctrl._replay_shapes} nodes={ctrl.nodes} path={ctrl.path} />
          </TabPanel>
        </Tabs>
      </div>
      <div class='puzzles'> 
        <Tabs>
          <Tab>Puzzles</Tab>
          <Tab>Filtered</Tab>
          <TabPanel>
            <div class='puzzles_in'>
            <div class='buttons'>
              <button onClick={() => puzzles.i_current_puzzle = -1 }>prev</button>
              {puzzles.puzzle_text}
              <button onClick={() => puzzles.i_current_puzzle = 1 } >next</button>
            </div>
            <Chessideareplay23 on_path={_ => puzzles.path = _} on_nodes={_ => {}} shapes={""} nodes={puzzles.nodes} path={puzzles.path}/>
            </div>
          </TabPanel>
       </Tabs>
     </div>
   </div>
  </>)
}


export default Chessanalysis23
