import { Signal } from 'solid-js'
import { createSignal, createResource, createMemo } from 'solid-js'
import { Memo, read, write, owrite, mread } from 'solid-play'
import { Replay, Color, MobileSituation, initial_fen } from 'lchessanalysis'

const make_replay_fen = (_: string) => {
  let [fen, moves] = _.split('\n\n')
  if (moves === '') {
    return []
  }
  let __ = moves.split('\n')
  return __.map(_ => {
    let [path, data] = _.split('___')
    let [,_data] = data.match(/\{(.*)\}/)!
    let [_uci] = _data.split(' ')
    return [path, _uci].join(' ')
  })
}

export type OD = string

function playMoves(situation: MobileSituation, moves: Array<OD>): MobileSituation {
  let move = moves.shift()

  if (move) {
    return playMoves(situation.od(move)[0], moves)
  }
  return situation
}


const s_fen = (fen: string) => MobileSituation.from_fen(fen)

const default_puzzle = {
  "id": "00Ec4",
  "fen": "2rq1r1k/p5pp/8/1p1BpPb1/2Pp2Q1/P2P2R1/6PP/R5K1 b - - 3 25",
  "moves": "c8c7 g4g5 d8g5 g3g5",
  "tags": "crushing middlegame short",
  "link": "https://lichess.org/HUFGdjKK/black#50"
}

const getPuzzles = () => {
  return fetch('data/athousand_sorted.csv')
  .then(_ => _.text())
  .then(_ => _.split('\n').map(_ => {
    let [id,fen,moves,,,,,tags,link] = _.split(',')
    return {
      id,
      fen,
      moves,
      tags,
      link
    }
  }))
}

export type Puzzle = {
  id: string,
  fen: string,
  moves: string,
  tags: string,
  link: string
}

export class _Chessanalysis23 {

  get fen() {
    return this._select.current_board_fen
  }

  _select: PuzzleSelect

  constructor() {
    this._select = new PuzzleSelect()
  }
}


class PuzzleSelect {

  get nb_puzzles() {
    return this.m_puzzles().length
  }

  get i_current_puzzle() {
    return read(this._i_current_puzzle) + 1
  }

  get current_puzzle() {
    return this.m_puzzles()[read(this._i_current_puzzle)]
  }

  get current_fen() {
    return this.current_puzzle.fen
  }

  get current_moves() {
    return this.current_puzzle.moves
  }

  get current_situation() {
    return playMoves(s_fen(this.current_fen), read(this._moves_after_fen))
  }

  set i_current_puzzle(dt: number) {
    let pz = this.m_puzzles()
    owrite(this._i_current_puzzle, _ => (_ + dt + pz.length) % pz.length)
  }

  get current_orientation() {
    return read(this._preferred_orientation) || this.current_situation.turn
  }

  get current_board_fen() {
    return [this.current_orientation, ...this.current_situation.board.pieses].join(' ')
  }

  get current_replay() {
    let fen = this.current_fen,
      moves = this.current_moves

    let _ = Replay.from_fen(fen)
    _.play_ucis(moves)
    return _
  }

  get current_replay_fen() {
    return make_replay_fen(this.current_replay.replay)
  }

  _preferred_orientation: Signal<Color>
  m_puzzles: Memo<Array<Puzzle>>
  _i_current_puzzle: Signal<number>
  _moves_after_fen: Signal<Array<OD>>

  on_hover(_: string) {
    let replay = this.current_replay

    if (replay && _) {
      let moves = replay.follow_path(_).slice(1).map(_ => _.data!.uci!)
      owrite(this._moves_after_fen, moves)
    }
  }

  constructor() {

    this._preferred_orientation = createSignal('w')
    this._moves_after_fen = createSignal([])

    this._i_current_puzzle = createSignal(0)

    let r_puzzles = createResource(getPuzzles)

    this.m_puzzles = createMemo(() => {
      let puzzles = mread(r_puzzles)
      return puzzles || [default_puzzle]
    })
  }
}
