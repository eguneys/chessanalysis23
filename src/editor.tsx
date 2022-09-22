import Chessboard23 from 'chessboard23'
import _Ce from './editor_ctrl'
import { colors, roles, color_long, role_long } from 'solid-play'
import { set_$ref } from 'solid-play'

const Ce = props => {

  let ctrl = new _Ce().init()

  return (<>
      <div class='ceditor'>
        <div ref={set_$ref(ctrl.ref_free)} class='free-pieses'>
          <For each={colors}>{ color =>
            <For each={color === 'w' ? roles : roles.slice(0).reverse()}>{ role =>
              <div class={['piese', color_long[color], role_long[role]].join(' ')}></div>
            }</For>
          }</For>
          </div>
        <div class='ce-board is2d'>
          <div class='board-wrap'>
            <Chessboard23 fen={ctrl.fen}/>
          </div>
        </div>
      </div>
      </>)
}


export default Ce
