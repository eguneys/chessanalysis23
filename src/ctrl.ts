import { createEffect, batch, untrack, Signal, createSignal } from 'solid-js'
import { MobileSituation, Replay, Board, initial_fen } from 'lchessanalysis'
import { Shapes } from 'chessboard23'
import { read, write, owrite } from 'solid-play'

export class _Chessanalysis23 {

  get _board_fen() {
    let board = read(this._board)

    return new MobileSituation('w', board, 'KQkq').fen
  }

  get _idea_fen() {
    return untrack(() => {
      let fen = this._board_fen
      let circles = read(this._circles).fen

      return `${fen}__fen_circles__${circles.trim()}`
    })
  }

  set _idea_fen(_: string) {
    let [fen, circles] = _.split('__fen_circles__')
    owrite(this._board, Board.from_fen(fen))
    circles = circles.trim()
    if (circles.length > 0) {
      owrite(this._circles, Shapes.from_fen(circles))
    }
  }

  get _replay_fen() {
    return untrack(() => {
      let fen = this._board_fen
      let replay = read(this._replay)?.fen
      return [fen, replay].join('__fen_replay__')
    })
  }

  set _replay_fen(_: string) {
    let [fen, replay] = _.split('__fen_replay__')
    batch(() => {
      if (replay) {
        owrite(this._replay, Replay.from_fen(replay))
      } else {
        owrite(this._replay, undefined)
      }
    })
  }

  get _replay_shapes() {
    return untrack(() => {
      return read(this._circles).fen
    })
  }


  _replay: Signal<Replay | undefined>
  _board: Signal<Board>
  _circles: Signal<Shapes>

  constructor() {

    let _replay: Signal<Replay | undefined> = createSignal()
    let _board = createSignal(Board.empty)
    let _circles = createSignal(Shapes.make())

    createEffect(() => {
      console.log('REPlAY', read(_replay)?.fen)
    })

    this._replay = _replay
    this._board = _board
    this._circles = _circles

  }

}
