import { createEffect, createResource, createMemo, createSignal } from 'solid-js'
import { initial_fen, dark_poss, light_poss } from 'solid-play'
import { make_ref } from 'solid-play'
import { read, write, owrite } from 'solid-play'
import { Replay, MobileSituation } from 'lchessanalysis'
import { m_log } from 'solid-play'
import { IsoSituation, match_idea } from 'lchessanalysis'

const s_fen = fen => MobileSituation.from_fen(fen)

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


const puzzle_match_idea = (i, _) => {
  let { fen, moves } = _
  let [move0, ..._moves] = moves.split(' ')

  return fen_match_idea(i, MobileSituation.from_fen(fen).od(move0)[0].fen)
}

const fen_match_idea = (i, fen) => {
  let s = MobileSituation.from_fen(fen)
  let iso = IsoSituation.from_fen(s.fen)
  return match_idea(iso, s, i)
}

const fen_move_idea = (i, m, fen) => {
  let _ = fen_match_idea(i, fen)[0]

  if (!_) {
    return []
  }

  return m.map(m => m.map(rB => {
    let [o, d] = rB.split('-')
    if (!d) {
      [o, d] = rB.split('')
    }

    return _[o] + _[d]
  }).join(' '))
}

let i = [
  ['r', 'B'],
  ['R', 'B'],
  ['R', 'R2'],
  ['q', 'R2', 'R'],
  ['R', 'K'],
  ['n', 'B', 'Q'],
  ['n', 'B', 'K'],
  ['P', 'B']
]

let m = [
  ['rB', 'RB', 'q-R2'],
  ['rB', 'PB', 'nB', 'RB', 'q-R2']
]


i = [
  ['q', 'f0', 'K'],
]

m = [
  ['q-f0']
]




function playMoves(situation: MobileSituation, moves: Array<OD>) {
  let move = moves.shift()

  if (move) {
    return playMoves(situation.od(move)[0], moves)
  }
  return situation
}

const make_replay_fen = _ => {

  let [fen, moves] = _.split('\n\n')

  if (moves === '') {
    return []
  }

  let __ = moves.split('\n')

  return __.map(_ => {
    let [path, data] = _.split('___')

    let [,_data] = data.match(/\{(.*)\}/)

    let [_uci] = _data.split(' ')

    return [path, _uci].join(' ')
  })
}


export default class _Chessanalysis23 {

  get board_fen() {
    return this.m_analysis.board_fen
  }

  get replay_fen() {
    return this.m_analysis.replay_fen
  }

  get replay_fen2() {
    return this.m_analysis.replay_fen2
  }

  onScroll() { }

  on_hover(_, __) {
    this.m_analysis.on_hover(_, __)
  }

  constructor() {

    let r_puzzles = createResource(getPuzzles)
    this.m_puzzles = createMemo(() => {
      let puzzles = read(r_puzzles)

      puzzles?.reverse()

      return puzzles?.slice(25, 200).filter(_ => puzzle_match_idea(i, _).length > 0)
    })

    this.m_analysis = make_analysis(this)
  }

}


export type Analysis = _Chessanalysis23

const make_analysis = (analysis: Analysis) => {

  let _i = createSignal(0)
  let m_c = createMemo(() => analysis.m_puzzles()?.length)

  let m_text = createMemo(() => `${(read(_i) + 1)}/${m_c()}`)

  let m_puzzle = createMemo(() => analysis.m_puzzles()?.[read(_i)] || default_puzzle)


  let m_match = createMemo(() => puzzle_match_idea(i, m_puzzle()))
  //m_log(m_puzzle)
  //m_log(m_match)

  let _preferred_orientation = createSignal('w')

  let m_fen = createMemo(() => m_puzzle().fen)

  let m_moves = createMemo(() => m_puzzle().moves)

  let m_matched_moves = createMemo(() => {
    let fen = m_fen()
    let moves = m_moves()

    let [move0] = moves.split(' ')

    let fen1 = playMoves(MobileSituation.from_fen(fen), [move0]).fen

    return fen_move_idea(i, m, fen1).map(_ => [move0, _].join(' '))
  })


  let m_replay2 = createMemo(() => {
    let fen = m_fen(),
      movess = m_matched_moves()

    let _ = Replay.from_fen(fen)
    movess.forEach(moves => _.play_ucis(moves))
    return _
  })

  let _moves_after_fen = createSignal([])

  let m_situation = createMemo(() => playMoves(MobileSituation.from_fen(m_fen()), read(_moves_after_fen))),
    m_board = createMemo(() => m_situation().board),
  m_orientation = createMemo(() => read(_preferred_orientation) ||  m_situation().turn)

  let m_pieses = createMemo(() => m_board().pieses)


  let m_board_fen = createMemo(() => [m_orientation(), 
                               ...m_pieses()].join(' '))

  let m_replay = createMemo(() => {
    let fen = m_fen(),
      moves = m_moves()

    let _ = Replay.from_fen(fen)
    _.play_ucis(moves)
    return _
  })

  let m_replay_fen = createMemo(() => make_replay_fen(m_replay().replay))
  let m_replay_fen2 = createMemo(() => make_replay_fen(m_replay2().replay))

  return {
    on_hover(_, o) {
      let replay = o ? m_replay2() : m_replay()
      
      if (replay && _) {
        let moves = replay.follow_path(_).slice(1).map(_ => _.data.uci)
        owrite(_moves_after_fen, moves)
      }
    },
    set i(d: number) {
      owrite(_moves_after_fen, [])
      let c = m_c()
      owrite(_i, _ => (_ + d + c) % c)
    },
    get text() {
      return m_text()
    },
    get board_fen() {
      return m_board_fen()
    },
    get replay_fen() {
      return m_replay_fen()
    },
    get replay_fen2() {
      return m_replay_fen2()
    }
  }
}
