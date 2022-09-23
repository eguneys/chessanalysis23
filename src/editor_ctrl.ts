import { createEffect, createSignal, createMemo } from 'solid-js'
import { colors, roles, initial_fen, dark_poss, light_poss } from 'solid-play'
import { read, write, owrite } from 'solid-play'
import { make_ref, make_drag_ref } from 'solid-play'
import { Vec2 } from 'solid-play'
import { vec2_poss } from 'solid-play'
import { m_log } from 'solid-play'
import { Board } from 'lchessanalysis'
import { Shapes } from 'chessboard23'


export default class _Ce {

  get res() {
    return this.m_res()
  }

  get drag() {
    return this.m_drag()
  }

  get fen() {
    return 'w ' + this.m_board().pieses.join(' ')
  }

  get shapes() {
    return read(this._shapes).shapes
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

    let _shapes = createSignal(Shapes.make(), { equals: false })
    this._shapes = _shapes

    let _drag_piece = createSignal()
    this.m_drag = createMemo(() => {
      let _ = read(_drag_piece)
      if (_) {
        let [piece, pos] = _
        return [piece, pos.vs.join(',')].join('@')
      }
    })

    this.m_res = createMemo(() => 
      [this.m_board().fen, read(this._shapes).fen].join('___')
    )

    const on_drag = (e, e0) => {
      let e_board_pos = ref_board.get_normal_at_abs_pos(e.e).scale(8)

      if (e._right && !e0 && !e.m) {
        let _pos = vec2_poss(e_board_pos.floor)
        if (_pos) {
          write(_shapes, _ => _.drawing_circle('green', _pos))
        }
      }

      if (e._right) {
        if (e.m) {
          let _m_board_pos = ref_board.get_normal_at_abs_pos(e.m).scale(8)

          let _pos = vec2_poss(e_board_pos.floor)
          let _pos2 = vec2_poss(_m_board_pos.floor)
          if (_pos && _pos2 && _pos !== _pos2) {
            write(_shapes, _ => _.drawing_arrow('green', _pos, _pos2))

          }
        }
      } else {
        if (e.m) {

          let _m_board_pos = ref_board.get_normal_at_abs_pos(e.m).scale(8)

          if (!e0?.m) {
            let _ = ref_free.get_normal_at_abs_pos(e.m).scale(frees.length).floor
            let piece = frees[_.x].join('')

            owrite(_drag_piece, [piece, _m_board_pos])
          } else {
            owrite(_drag_piece, _ => _ && [_[0], _m_board_pos])
          }
        }
      }
    }

    const on_up = (e, right) => {
      let pos = ref_board.get_normal_at_abs_pos(e).scale(8).floor
      let piece = read(_drag_piece)?.[0]

      if (right) {
        write(_shapes, _ => _.commit_drawing())
      }

      if (piece) {
        owrite(_board, _ => _.clone.in([piece, vec2_poss(pos)].join('@')))
      }
      owrite(_drag_piece, undefined)
    }

    const on_click = (e, right) => {
      let pos = ref_board.get_normal_at_abs_pos(e).scale(8).floor

      if (right) {
        let _pos = vec2_poss(pos.floor)
        if (_pos) {


        }
      } else {
        owrite(_shapes, Shapes.make())
      }
      owrite(_board, _ => _.clone.out(vec2_poss(pos)))
    }

    const on_context = () => {}

    make_drag_ref({ on_drag, on_up, on_click, on_context }, ref_board)
    make_drag_ref({ on_drag, on_up, on_context }, ref_free)


    return this
  }
}


type Editor = _Ce
