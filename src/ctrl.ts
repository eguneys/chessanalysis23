import { createEffect, batch, untrack, Signal, createSignal } from 'solid-js'
import { MobileSituation, Board, initial_fen } from 'lchessanalysis'
import { Shapes } from 'chessboard23'
import { m_log, read, write, owrite } from 'solid-play'
import { Fen, empty_fen, TreeBuilder, Node, FlatTree, FlatDoc } from 'lchessanalysis'

export class _Chessanalysis23 {

  set _idea_fen(_: string) {
    let [fen, circles] = _.split('__fen_circles__')
    owrite(this._initial_fen, fen + ' w KQkq -' as Fen)
    owrite(this._circles, Shapes.from_fen(circles.trim()))
  }

  get _idea_fen() {
    return untrack(() => {
      let fen = MobileSituation.from_fen(read(this._initial_fen)).board.fen
      let circles = read(this._circles).fen
      return `${fen}__fen_circles__${circles.trim()}`
    })
  }

  get _replay_shapes() {
    return read(this._circles).fen
  }

  get path() {
    return ''
  }

  get nodes() {
    return FlatTree.apply(read(this._root))
  }

  on_nodes(doc: FlatDoc) {
    owrite(this._root, FlatTree.read(doc))
  }

  _root: Signal<Node>

  _initial_fen: Signal<Fen>
  _circles: Signal<Shapes>

  constructor() {
    this._circles = createSignal(Shapes.make())
    this._initial_fen = createSignal(empty_fen)
    this._root = createSignal(TreeBuilder.apply(MobileSituation.from_fen(read(this._initial_fen)), []))

    createEffect(() => {
      owrite(this._root,
             TreeBuilder.apply(MobileSituation.from_fen(read(this._initial_fen)), []))
    })
  }

}
