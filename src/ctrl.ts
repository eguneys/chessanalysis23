import { createResource, createMemo } from 'solid-js'
import { Memo, read, write, owrite, mread } from 'solid-play'
import { MobileSituation, initial_fen } from 'lchessanalysis'

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
    return s_fen(initial_fen).board.pieses.join(' ')
  }

  m_puzzles: Memo<Array<Puzzle>>

  constructor() {
    let r_puzzles = createResource(getPuzzles)

    this.m_puzzles = createMemo(() => {
      let puzzles = mread(r_puzzles)
      return puzzles || [default_puzzle]
    })
  }

}
