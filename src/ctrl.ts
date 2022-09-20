import { createResource, createMemo, createSignal } from 'solid-js'
import { initial_fen, dark_poss, light_poss } from 'solid-play'
import { make_ref } from 'solid-play'
import { read, write, owrite } from 'solid-play'
import { Replay, MobileSituation } from 'lchessanalysis'
import { m_log } from 'solid-play'
import { IsoSituation, match_idea } from 'lchessanalysis'

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

  let s = MobileSituation.from_fen(fen).od(move0)[0]
  let iso = IsoSituation.from_fen(s.fen)
  return match_idea(iso, s, i)
}


let i = [
  ['q', 'f', 'K'],
]


function playMoves(situation: MobileSituation, moves: Array<OD>) {
  let move = moves.shift()

  if (move) {
    return playMoves(situation.od(move)[0], moves)
  }
  return situation
}

export default class _Chessanalysis23 {

  get board_fen() {
    return this.m_analysis.board_fen
  }

  get replay_fen() {
    return this.m_analysis.replay_fen
  }

  onScroll() { }

  on_hover(_) {
    this.m_analysis.on_hover(_)
  }

  constructor() {

    let r_puzzles = createResource(getPuzzles)
    this.m_puzzles = createMemo(() => {
      let puzzles = read(r_puzzles)


      return puzzles?.slice(0, 100).filter(_ => puzzle_match_idea(i, _).length > 0)
    })

    this.m_analysis = make_analysis(this)
  }

}


export type Analysis = _Chessanalysis23

const make_analysis = (analysis: Analysis) => {

  let _i = createSignal(3)
  let m_c = createMemo(() => analysis.m_puzzles()?.length)

  let m_text = createMemo(() => `${(read(_i) + 1)}/${m_c()}`)

  let m_puzzle = createMemo(() => analysis.m_puzzles()?.[read(_i)] || default_puzzle)


  let m_match = createMemo(() => puzzle_match_idea(i, m_puzzle()))

  let _preferred_orientation = createSignal('w')

  let m_fen = createMemo(() => m_puzzle().fen)
  let m_moves = createMemo(() => m_puzzle().moves)

  let _moves_after_fen = createSignal([])

  let m_situation = createMemo(() => playMoves(MobileSituation.from_fen(m_fen()), read(_moves_after_fen))),
    m_board = createMemo(() => m_situation().board),
  m_orientation = createMemo(() => read(_preferred_orientation) ||  m_situation().turn)

  let m_checkerboard = createMemo(() => [
      ...dark_poss.map(_ => `dark@@${_}`), 
      ...light_poss.map(_ => `light@@${_}`)])

  let m_pieses = createMemo(() => m_board().pieses)


  let m_board_fen = createMemo(() => [m_orientation(), 
                               ...m_pieses(), 
  ...m_checkerboard()].join(' '))

  let m_replay = createMemo(() => {
    let fen = m_fen(),
      moves = m_moves()

    let _ = Replay.from_fen(fen)
    _.play_ucis(moves)
    return _
  })

  let m_replay_fen = createMemo(() => {
    let _ = m_replay().replay

    let [fen, moves] = _.split('\n\n')

    let __ = moves.split('\n')

    return __.map(_ => {
      let [path, data] = _.split('___')

      let [,_data] = data.match(/\{(.*)\}/)

      let [_uci] = _data.split(' ')

      return [path, _uci].join(' ')
    })
  })

  return {
    on_hover(_) {
      let replay = m_replay()
      
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
    }
  }
}
