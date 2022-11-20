import { Show, Component } from 'solid-js'
import { Chessboard23 } from 'chessboard23'
import Chessreplay23 from 'chessreplay23'
import { Chessidea23, Chessideareplay23 } from 'chessidea23'
import { _Chessanalysis23 } from './ctrl'
import { Tab, TabPanel, Tabs } from 'solid-ui'
import { FlatDoc } from 'lchessanalysis'
import { Puzzles, Filtered } from './puzzles2'

const Chessanalysis23: Component<{}> = props => {

  let ctrl = new _Chessanalysis23()
  let puzzles = new Puzzles()
  let filtered = new Filtered()

  return (<>
    <div class='chessanalysis23'>
      <div class='ideas'>
        <Tabs>
          <Tab>Idea</Tab>
          <Tab>Move</Tab>
          <TabPanel>
            <Chessidea23 on_rules={_ => filtered.rules = _} fen={ctrl._idea_fen} on_fen={_ => ctrl._idea_fen = _}/>
          </TabPanel>
          <TabPanel>
            <Chessideareplay23 on_path={_ => {}} on_nodes={_ => {
            ctrl.nodes = _
            filtered.nodes = _
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
          <TabPanel>
            <FilteredComponent filtered={filtered}/>
          </TabPanel>
       </Tabs>
     </div>
   </div>
  </>)
}

const FilteredComponent: Component<{ filtered: Filtered }> = (props) => {
  let { filtered } = props
  return (<>
    <div class='puzzles_in'>
      <div class='buttons'>
        <button onClick={() => {filtered.filter_trigger()}}>filter</button>
        <button onClick={() => filtered.i_current_puzzle = -1 }>prev</button>
        {filtered.puzzle_text}
        <button onClick={() => filtered.i_current_puzzle = 1 } >next</button>
      </div>
      <Show keyed when={filtered.current_puzzle}>{ current_puzzle =>
        <Chessideareplay23 on_path={_ => current_puzzle.path = _} on_nodes={_ => {}} shapes={""} nodes={current_puzzle.nodes} path={current_puzzle.path}/>
      }</Show>
    </div>
  </>)
}

export default Chessanalysis23
