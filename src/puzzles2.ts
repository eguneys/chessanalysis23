import { mapArray, createResource, createMemo, createEffect, batch, untrack, Signal, createSignal } from 'solid-js'
import { Memo, m_log, mread, read, write, owrite } from 'solid-play'
import { Rules } from 'chessidea23'
import { MobileSituation, Board, initial_fen } from 'lchessanalysis'
import { Path, UCI, Fen, empty_fen, TreeBuilder, Node, FlatTree, FlatDoc } from 'lchessanalysis'
import { Puzzle as MPuzzle, AnalysePuzzle, AnalyseMakeInfo } from './analyse'

import { Pos, IsoSituation, gen_const, Idea } from 'lchessanalysis'

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

  set nodes(_: FlatDoc) {
    owrite(this._idea_nodes, FlatTree.read(_))
  }

  get nodes() {
    return FlatTree.apply(this.m_current_puzzle().node)
  }


  set i_current_puzzle(dt: number) {
    let pz = this.m_puzzles()
    owrite(this._i_current_puzzle, _ => (_ + dt + pz.length) % pz.length)
  }

  get puzzle_text() {
    return `${read(this._i_current_puzzle) + 1}/${this.m_puzzles().length}`
  }

  get current_puzzle() {
    return this.m_current_puzzle()
  }


  
  get path() {
    return ''
  }

  set path(path: Path | '') {
  }

  filter() {
    owrite(this._filter, _ => !!_)
  }


  _rules: Signal<Rules>
  _idea_nodes: Signal<Node>

  m_puzzles: Memo<Array<PuzzleItem>>
  m_current_puzzle: Memo<PuzzleItem>
 
  _i_current_puzzle: Signal<number>

  _filter: Signal<boolean>

  constructor() {

    let r_puzzles = createResource(getPuzzles)
    let m_puzzles = createMemo(() => {
      let puzzles = mread(r_puzzles)
      return puzzles || [default_puzzle]
    })


    this._rules = createSignal(['', new Map<string, string>()])
    this._idea_nodes = createSignal(TreeBuilder.apply(MobileSituation.from_fen(initial_fen), []))

    this._filter = createSignal(false)

    this.m_puzzles = createMemo(mapArray(m_puzzles, puzzle => new PuzzleItem(puzzle)))

    this._i_current_puzzle = createSignal(0)
    this.m_current_puzzle = createMemo(() =>
      this.m_puzzles()[read(this._i_current_puzzle)])

  }

}


export class PuzzleItem {

  _puzzle!: MPuzzle
  get puzzle(): MPuzzle {

    if (!this._puzzle) {
      this._puzzle = MPuzzle.make(this.__puzzle.fen as Fen, this.__puzzle.moves.split(' ') as Array<UCI>)!
    }
    return this._puzzle
  }

  get node() {
    return this.puzzle.root
  }

  get path() {
    return read(this._path)
  }

  set path(_: Path | '') {
    owrite(this._path, _)
  }

  get nodes() {
    return FlatTree.apply(this.node)
  }

  _path: Signal<Path | ''>

  constructor(readonly __puzzle: Puzzle) {
    this._path = createSignal('')

  }
}


export class Filtered {

  set rules(_: Rules) {
    owrite(this._rules, _)
  }

  set nodes(_: FlatDoc) {
    owrite(this._idea_nodes, FlatTree.read(_))
  }


  set i_current_puzzle(dt: number) {
    let pz = this.m_puzzles()
    owrite(this._i_current_puzzle, _ => (_ + dt + pz.length) % pz.length)
  }

  get puzzle_text() {
    return `${read(this._i_current_puzzle) + 1}/${this.m_puzzles().length}`
  }

  get current_puzzle() {
    return this.m_current_puzzle()
  }

  filter_trigger() {
    owrite(this._filter_trigger, true)
  }

  _filter_trigger: Signal<boolean>

  _rules: Signal<Rules>
  _idea_nodes: Signal<Node>

  m_puzzles: Memo<Array<AnalysedPuzzleItem>>
  m_current_puzzle: Memo<AnalysedPuzzleItem>
 
  _i_current_puzzle: Signal<number>

  constructor() {

    this._filter_trigger = createSignal(false, { equals: false })

    let r_puzzles = createResource(getPuzzles)
    let m_puzzles = createMemo(() => {
      let puzzles = mread(r_puzzles)
      return puzzles || [default_puzzle]
    })



    this._rules = createSignal(['', new Map<string, string>()])
    this._idea_nodes = createSignal(TreeBuilder.apply(MobileSituation.from_fen(initial_fen), []))


    let m_rules = createMemo(() => {
      return read(this._rules)[0].trim()
      .split('\n')
      .filter(_ => _ !== '')
      .flatMap(_ => _.split(' ').map(_ => _.split('->').map(symbol_convert)))
    })

    let m_rules_pos_map = createMemo(() => new Map([...read(this._rules)[1]].map(([k, v]) => [k, symbol_convert(v)])) as Map<Pos, string>)

    let m_rules_gen_map = createMemo(() => {
      let rules = m_rules()
      let res: Array<string> = []

      rules.forEach(_ => _.forEach(_ => {
        if (!res.includes(_)) {
          res.push(_)
        }
      }))

      return res
    })

    let m_gen = createMemo(() => gen_const(m_rules()))
    let m_analyse_make_info = createMemo(() => ({
      gen: m_gen(),
      pos_map: m_rules_pos_map(),
      gen_map: m_rules_gen_map(),
      idea_nodes: read(this._idea_nodes)
    }))

    m_log(m_analyse_make_info)

    let m_unfiltered_puzzles = createMemo(mapArray(m_puzzles, puzzle => new PuzzleItem(puzzle)))

    this.m_puzzles = createMemo(() => !read(this._filter_trigger) ? [] :  untrack(() => m_unfiltered_puzzles().map(_ => AnalysedPuzzleItem.make(m_analyse_make_info(), _)).filter(_ => !!_) as Array<AnalysedPuzzleItem>))

    this._i_current_puzzle = createSignal(0)
    this.m_current_puzzle = createMemo(() =>
      this.m_puzzles()[read(this._i_current_puzzle)])
  }
}


export class AnalysedPuzzleItem {

  static make = (analyse_make_info: AnalyseMakeInfo, puzzle: PuzzleItem) => {
    if (!puzzle.puzzle) {
      return undefined
    }

    let analyse_puzzle = AnalysePuzzle.make(analyse_make_info, puzzle.puzzle)

    if (analyse_puzzle) {
      return new AnalysedPuzzleItem(puzzle, analyse_puzzle)
    }
    return undefined
  }

  get puzzle(): MPuzzle {
    return this.__puzzle.puzzle
  }



  get node() {
    return this.puzzle.root
  }

  get path() {
    return read(this._path)
  }

  set path(_: Path | '') {
    owrite(this._path, _)
  }

  get nodes() {
    return FlatTree.apply(this.node)
  }

  _path: Signal<Path | ''>

  constructor(readonly __puzzle: PuzzleItem, readonly __analyse: AnalysePuzzle) {
    this._path = createSignal('')
  }

}




const symbol_convert = (_: string) =>
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
.replace('bp', 'P')
