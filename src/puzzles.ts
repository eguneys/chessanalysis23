import { mapArray, createResource, createMemo, createEffect, batch, untrack, Signal, createSignal } from 'solid-js'
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
  
  set nodes(_: FlatDoc) {
    owrite(this._idea_nodes, FlatTree.read(_))
  }

  get nodes() {
    return this.m_current_puzzle().nodes
  }

  get path() {
    return this.m_current_puzzle().path
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

  m_puzzles: Memo<Array<MPuzzle>>
  _i_current_puzzle: Signal<number>
  m_current_puzzle: Memo<MPuzzle>

  _match_now: Signal<undefined>

  m_gen: Memo<(_: MobileSituation) => Match>
  m_rules_gen_map: Memo<Array<string>>
  m_rules_pos_map: Memo<Map<string, string>>


  _idea_nodes: Signal<Node>

  constructor() {
    this._filter = createSignal(false)

    this._match_now = createSignal(undefined, { equals: false })

    let _rules: Signal<Rules> = createSignal(['', new Map<string, string>()])
    this._rules = _rules

    this._idea_nodes = createSignal(TreeBuilder.apply(MobileSituation.from_fen(initial_fen), []))

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

    this.m_rules_pos_map = createMemo(() => read(_rules)[1])

    this.m_rules_gen_map = createMemo(() => {
      let rules = m_rules()
      let res: Array<string> = []

      rules.forEach(_ => _.forEach(_ => {
        if (!res.includes(_)) {
          res.push(_)
        }
      }))

      return res
    })

    let r_puzzles = createResource(getPuzzles)

    let m_puzzles = createMemo(() => {
      let puzzles = mread(r_puzzles)
      return puzzles || [default_puzzle]
    })


    this.m_gen = createMemo(() => gen_const(m_rules()))

    let m_puzzles_ = createMemo(mapArray(m_puzzles, _ => new MPuzzle(this, _)))

    this.m_puzzles = createMemo(() => {
      let res = m_puzzles_().filter(_ => (!read(this._filter)) || _.m_match())

      if (res.length === 0) {
        return m_puzzles_().slice(0, 1)
      }
      return res
    })

    this._i_current_puzzle = createSignal(0)

    this.m_current_puzzle = createMemo(() =>
      this.m_puzzles()[read(this._i_current_puzzle)])
  }
}


class MPuzzle {


  get nodes() {
    return this.m_nodes()
  }

  get path() {
    return this.m_path()
  }

  m_nodes: Memo<FlatDoc>
  m_path: Memo<Path | ''>
  m_match: Memo<Match | undefined>

  constructor(readonly puzzles: Puzzles, readonly puzzle: Puzzle) {

    let fen = puzzle.fen as Fen
    let moves = puzzle.moves.split(' ') as Array<UCI>
    let root = TreeBuilder.apply(MobileSituation.from_fen(fen), moves)

    let node_fen = root.children[0]?.fen

    this.m_nodes = createMemo(() => FlatTree.apply(root))
    this.m_path = createMemo(() => '')

    this.m_match = createMemo(() => {
      if (!node_fen) {
        return undefined
      }
      let match_gen = read(puzzles._filter) && puzzles.m_gen()
      if (match_gen) {
        let match = match_gen(MobileSituation.from_fen(node_fen))

        if (match.length > 0) {
          return match
        }
      }
      return undefined
    })


    m_log(() => {
      let match = this.m_match()
      if (match) {
        console.log(match[0], puzzles.m_rules_gen_map(), puzzles.m_rules_pos_map(), read(puzzles._idea_nodes))
      }
    })

  }

}
