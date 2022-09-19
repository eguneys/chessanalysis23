import { createMemo } from 'solid-js'
import { dark_poss, light_poss } from 'solid-play'
import { make_ref } from 'solid-play'

export default class _Chessanalysis23 {

  get board_fen() {
    return [this.m_orientation(), ...this.m_pieses(), ...this.m_checkerboard()].join(' ')
  }

  get replay_fen() {
    return ''
  }

  onScroll() { }

  constructor() {
    this.m_checkerboard = createMemo(() => [
      ...dark_poss.map(_ => `dark@@${_}`), 
      ...light_poss.map(_ => `light@@${_}`)])

    this.m_orientation = createMemo(() => 'w')
    this.m_pieses = createMemo(() => ['wr@b3'])
  }

}


export type Analysis = _Chessanalysis23
