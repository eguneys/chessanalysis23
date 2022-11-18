import { createResource, createMemo, createEffect, batch, untrack, Signal, createSignal } from 'solid-js'
import { MobileSituation, Board, initial_fen } from 'lchessanalysis'
import { Shapes } from 'chessboard23'
import { Memo, m_log, mread, read, write, owrite } from 'solid-play'
import { Path, UCI, Fen, empty_fen, TreeBuilder, Node, FlatTree, FlatDoc } from 'lchessanalysis'
import { Rules } from 'chessidea23'
import { Pos, IsoSituation, gen_const, Idea } from 'lchessanalysis'

export type Match = Array<Array<Pos>>

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

  set rules(_: Rules) {
    owrite(this._rules, _)
  }

  get puzzle_text() {
    return `${read(this._i_current_puzzle) + 1}/${this.m_puzzles().length}`
  }
  

  get nodes() {
    return FlatTree.apply(this.m_root())
  }

  get path() {
    return this.m_path()
  }

  set path(path: Path | '') {
  }

  set i_current_puzzle(dt: number) {
    let pz = this.m_puzzles()
    owrite(this._i_current_puzzle, _ => (_ + dt + pz.length) % pz.length)
  }

  match() {
    owrite(this._match_now, undefined)
  }

  filter_matches() {
    owrite(this._filter, _ => !_)
  }

  _filter: Signal<boolean>

  _rules: Signal<Rules>
  m_path: Memo<Path | ''>
  m_root: Memo<Node>

  m_puzzles: Memo<Array<Puzzle>>
  _i_current_puzzle: Signal<number>
  m_current_puzzle: Memo<Puzzle>

  _match_now: Signal<undefined>

  m_matches: Memo<Match | undefined>
  m_matched_puzzles: Memo<Array<[Match, Puzzle]> | undefined>

  constructor() {
    this._filter = createSignal(false)

    this._match_now = createSignal(undefined, { equals: false })

    let _rules: Signal<Rules> = createSignal(['', new Map<string, string>()])
    this._rules = _rules

    let m_rules = createMemo(() => {
      return read(_rules)[0].trim()
      .split('\n')
      .filter(_ => _ !== '')
      .flatMap(_ => _.split(' ').map(_ => _.split('->').map(_ =>
        _.replace('wk', 'k')
        .replace('wq', 'q')
        .replace('wn', 'n')
        .replace('wb', 'b')
        .replace('wr', 'r')
        .replace('wp', 'p')
        .replace('bk', 'K')
        .replace('bq', 'Q')
        .replace('bn', 'N')
        .replace('bb', 'B')
        .replace('br', 'R')
        .replace('bp', 'P'))))
    })

    let r_puzzles = createResource(getPuzzles)

    this.m_puzzles = createMemo(() => {
      let puzzles = mread(r_puzzles)
      return puzzles || [default_puzzle]
    })

    this.m_matches = createMemo(() => {
      if (!read(this._filter)) {
        return undefined
      }
      let i = untrack(() => gen_const(m_rules()))
      let puzzles = this.m_puzzles()
      return puzzles.map(_ => {
          let root = TreeBuilder.apply(MobileSituation.from_fen(_.fen as Fen), _.moves.split(' ') as Array<UCI>)

          let node_fen = root.children[0]?.fen

          if (!node_fen) {
            return undefined
          }

          let match = i(MobileSituation.from_fen(node_fen))

          if (match.length > 0) {
            return match
          }
          return undefined
        })
    })

    this.m_matched_puzzles = createMemo(() => {
      let matches = this.m_matches()
      let puzzles = this.m_puzzles()

      if (matches) {
        return matches.flatMap((match, i) => {
          if (match) {
            return [[puzzles[i], match]]
          }
          return []
        })
      }
      return undefined
    })

    m_log(this.m_matched_puzzles)

    this._i_current_puzzle = createSignal(0)

    this.m_current_puzzle = createMemo(() =>
      this.m_puzzles()[read(this._i_current_puzzle)])

    let m_fen = createMemo(() => this.m_current_puzzle().fen as Fen)
    let m_moves = createMemo(() => this.m_current_puzzle().moves.split(' ') as Array<UCI>)
    this.m_root = createMemo(() => TreeBuilder.apply(MobileSituation.from_fen(m_fen()), m_moves()))

    this.m_path = createMemo(() => {
      this.m_root()
      return ''
    })


    let m_node_fen = createMemo(() => this.m_root().children[0].fen)
    let m_match = () => gen_const(m_rules())(MobileSituation.from_fen(m_node_fen()))

    createEffect(() => {
      read(this._match_now)
      untrack(() => {
        console.log(m_rules())
        console.log(m_node_fen())
        console.log(m_match())
      })
    })

  }
}


class MPuzzle {



  constructor(readonly puzzles: Puzzles, readonly puzzle: Puzzle) {




  }

}
