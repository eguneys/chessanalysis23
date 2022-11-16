import { createResource, createMemo, createEffect, batch, untrack, Signal, createSignal } from 'solid-js'
import { MobileSituation, Board, initial_fen } from 'lchessanalysis'
import { Shapes } from 'chessboard23'
import { Memo, m_log, mread, read, write, owrite } from 'solid-play'
import { UCI, Fen, empty_fen, TreeBuilder, Node, FlatTree, FlatDoc } from 'lchessanalysis'

export type Puzzle = {
  id: string,
  fen: string,
  moves: string,
  tags: string,
  link: string
}

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
  .then(_ => _.trim().split('\n').map(_ => {
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

export class Puzzles {

  get puzzle_text() {
    return `${read(this._i_current_puzzle) + 1}/${this.m_puzzles().length}`
  }
  

  get nodes() {
    return FlatTree.apply(this.m_root())
  }

  get path() {
    return ''
  }

  set i_current_puzzle(dt: number) {
    let pz = this.m_puzzles()
    owrite(this._i_current_puzzle, _ => (_ + dt + pz.length) % pz.length)
  }

  m_root: Memo<Node>

  m_puzzles: Memo<Array<Puzzle>>
  _i_current_puzzle: Signal<number>
  m_current_puzzle: Memo<Puzzle>

  constructor() {

    let r_puzzles = createResource(getPuzzles)

    this.m_puzzles = createMemo(() => {
      let puzzles = mread(r_puzzles)
      return puzzles || [default_puzzle]
    })

    this._i_current_puzzle = createSignal(0)

    this.m_current_puzzle = createMemo(() =>
      this.m_puzzles()[read(this._i_current_puzzle)])

    let m_fen = createMemo(() => this.m_current_puzzle().fen as Fen)
    let m_moves = createMemo(() => this.m_current_puzzle().moves.split(' ') as Array<UCI>)
    this.m_root = createMemo(() => TreeBuilder.apply(MobileSituation.from_fen(m_fen()), m_moves()))
  }
}
