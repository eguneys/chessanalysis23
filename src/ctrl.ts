import { createMemo, createEffect, batch, untrack, Signal, createSignal } from 'solid-js'
import { MobileSituation, Board, initial_fen } from 'lchessanalysis'
import { Shapes } from 'chessboard23'
import { Memo, m_log, read, write, owrite } from 'solid-play'
import { Fen, empty_fen, TreeBuilder, Node, FlatTree, FlatDoc } from 'lchessanalysis'

export class _Chessanalysis23 {

  _idea_fen_shapes?: string
  _idea_fen_i_piece_on_board?: string

  set _idea_fen(_: string) {
    let [fen, circles, shapes, i_piece] = _.split('__fen_circles__')
    owrite(this._initial_fen, fen + ' w KQkq -' as Fen)
    owrite(this._circles, Shapes.from_fen(circles.trim()))
    this._idea_fen_shapes = shapes
    this._idea_fen_i_piece_on_board = i_piece
  }

  get _idea_fen() {
    return untrack(() => {
      let fen = MobileSituation.from_fen(read(this._initial_fen)).board.fen
      let circles = read(this._circles).fen
      return [fen, circles, this._idea_fen_shapes, this._idea_fen_i_piece_on_board].join(`__fen_circles__`)
    })
  }

  get _replay_shapes() {
    return read(this._circles).fen
  }

  get path() {
    return ''
  }

  get nodes() {
    return untrack(() => read(this._root))
  }

  set nodes(_: FlatDoc) {
    owrite(this._root, _)
  }

  _root: Signal<FlatDoc>

  _initial_fen: Signal<Fen>
  _circles: Signal<Shapes>

  constructor() {
    this._circles = createSignal(Shapes.make())
    this._initial_fen = createSignal(empty_fen)
    this._root = createSignal(FlatTree.apply(TreeBuilder.apply(MobileSituation.from_fen(read(this._initial_fen)), [])))

    createEffect(() => {

      owrite(this._root, FlatTree.apply(TreeBuilder.apply(MobileSituation.from_fen(read(this._initial_fen)), [])))
    })
  }

}
