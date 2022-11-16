import { Component } from 'solid-js'
import { Chessboard23 } from 'chessboard23'
import Chessreplay23 from 'chessreplay23'
import { Chessidea23, Chessideareplay23 } from 'chessidea23'
import { _Chessanalysis23 } from './ctrl'
import { Tab, TabPanel, Tabs } from 'solid-ui'
import { FlatDoc } from 'lchessanalysis'

const Chessanalysis23: Component<{}> = props => {

  let ctrl = new _Chessanalysis23()

  return (<>
    <div class='chessanalysis23'>
      <h3> Ideas </h3>
      <div class='ideas'>
        <Tabs>
          <Tab>Idea</Tab>
          <Tab>Move</Tab>
          <TabPanel>
            <Chessidea23 fen={ctrl._idea_fen} on_fen={_ => ctrl._idea_fen = _}/>
          </TabPanel>
          <TabPanel>
            <Chessideareplay23 on_nodes={(_: FlatDoc) => ctrl.on_nodes(_)} shapes={ctrl._replay_shapes} nodes={ctrl.nodes} path={ctrl.path} />
          </TabPanel>
        </Tabs>
      </div>
      <h3> Puzzles </h3>
      <div class='puzzles'> </div>
    </div>
  </>)
}


export default Chessanalysis23
