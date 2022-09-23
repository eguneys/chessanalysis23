import { mapArray, createSignal, createMemo } from 'solid-js'
import { read, write, owrite } from 'solid-play'
import { long_color, long_role } from 'solid-play'
import { m_log } from 'solid-play'
import { Board } from 'lchessanalysis'


export default class _Idea {

  e_change(_) {
    owrite(this._e, _)
  }

  get pieses() {
    return this.m_pieses()
  }

  init() {

    let _e = createSignal('8/8/8/8/8/8/8/8___')
    this._e = _e

    let m_fens = createMemo(() => read(this._e).split('___'))
    let m_board_fen = createMemo(() => m_fens()[0])
    let m_shapes_fen = createMemo(() => m_fens()[1])

    let m_pieses = createMemo(() => Board.from_fen(m_board_fen()).pieses)


    this.m_pieses = createMemo(mapArray(m_pieses, _ => make_piese(this, _)))



    return this
  }
}


type Idea = _Idea

const make_piese = (idea: Idea, piese: Piese) => {
  let [piece, pos] = piese.split('@')
  let [color, role] = piece.split('')

  let klass = ['piese', long_color[color], long_role[role]].join(' ')


  return {
    klass
  }
}
