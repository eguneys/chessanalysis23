import { createSignal, createMemo } from 'solid-js'
import { colors, roles, initial_fen, dark_poss, light_poss } from 'solid-play'
import { read, write, owrite } from 'solid-play'
import { make_ref, make_drag_ref } from 'solid-play'
import { Vec2 } from 'solid-play'
import { vec2_poss } from 'solid-play'
import { m_log } from 'solid-play'
import { Board } from 'lchessanalysis'


export default class _Ce {

  get drag() {
    return this.m_drag()
  }

  get fen() {
    return 'w ' + this.m_board().pieses.join(' ')
  }

  onScroll() {
    this.ref_board.$clear_bounds()
    this.ref_free.$clear_bounds()
  }

  init() {


    let _board = createSignal(Board.empty)
    this.m_board = createMemo(() => read(_board))

    let ref_board = make_ref()
    this.ref_board = ref_board

    let ref_free = make_ref()
    this.ref_free = ref_free

    let frees = colors.flatMap(color => (color === 'w' ? roles : 
                                     roles.slice(0).reverse()).map(role => [color, role]))
 
    this.frees = frees


    let _drag_piece = createSignal()
    this.m_drag = createMemo(() => {
      let _ = read(_drag_piece)
      if (_) {
        let [piece, pos] = _
        return [piece, pos.vs.join(',')].join('@')
      }
    })


    const on_drag = (e, start) => {
      let pos = ref_board.get_normal_at_abs_pos(e.m || e.e).scale(8)
      if (start) {
        let _ = ref_free.get_normal_at_abs_pos(e.m).scale(frees.length).floor
        let piece = frees[_.x].join('')

        owrite(_drag_piece, [piece, pos])
      } else {
        owrite(_drag_piece, _ => _ && [_[0], pos])
      }
    }

    const on_up = (e) => {
      let pos = ref_board.get_normal_at_abs_pos(e).scale(8).floor
      let piece = read(_drag_piece)?.[0]

      if (piece) {
        owrite(_board, _ => _.clone.in([piece, vec2_poss(pos)].join('@')))
      }
      owrite(_drag_piece, undefined)
    }

    const on_click = (e) => {
      let pos = ref_board.get_normal_at_abs_pos(e).scale(8).floor

      owrite(_board, _ => _.clone.out(vec2_poss(pos)))
    }


    make_drag_ref({ on_drag, on_up, on_click }, ref_board)
    make_drag_ref({ on_drag, on_up }, ref_free)


    return this
  }
}


type Editor = _Ce
