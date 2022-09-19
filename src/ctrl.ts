import { createResource, createMemo, createSignal } from 'solid-js'
import { initial_fen, dark_poss, light_poss } from 'solid-play'
import { make_ref } from 'solid-play'
import { read, write, owrite } from 'solid-play'
import { Replay, MobileSituation } from 'lchessanalysis'
import { m_log } from 'solid-play'
import { IsoSituation, match_idea } from 'lchessanalysis'

const default_puzzle = {
  "id": "01Vbe",
  "fen": "2r5/3Qnk1p/8/4B2b/Pp2p3/1P2P3/5PPP/3R2K1 w - - 3 32",
  "moves": "d1d6 c8c1 d6d1 c1d1 d7d1 h5d1",
  "tags": "advantage endgame fork long",
  "link": "https://lichess.org/b334W1Ga#63"
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


export default class _Chessanalysis23 {

  get board_fen() {
    return this.m_analysis.board_fen
  }

  get replay_fen() {
    return this.m_analysis.replay_fen
  }

  onScroll() { }

  constructor() {

    let r_puzzles = createResource(getPuzzles)
    this.m_puzzles = createMemo(() => {
      let puzzles = read(r_puzzles)

      let i = [
        ['Q', 'R', 'p'],
      ]

      return puzzles?.slice(0, 20).filter(_ => {
        let { fen, moves } = _
        let [move0, ..._moves] = moves.split(' ')

        let s = MobileSituation.from_fen(fen).od(move0)[0]
        let iso = IsoSituation.from_fen(s.fen)
        return match_idea(iso, s, i)[3]
      })


    })

    this.m_analysis = make_analysis(this)
  }

}


export type Analysis = _Chessanalysis23

const make_analysis = (analysis: Analysis) => {

  let m_puzzle = createMemo(() => analysis.m_puzzles()?.[0] || default_puzzle)

  let m_fen = createMemo(() => m_puzzle().fen)
  let m_moves = createMemo(() => m_puzzle().moves)

  let m_situation = createMemo(() => MobileSituation.from_fen(m_fen())),
    m_board = createMemo(() => m_situation().board),
  m_orientation = createMemo(() => m_situation().turn)

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
    get board_fen() {
      return m_board_fen()
    },
    get replay_fen() {
      return m_replay_fen()
    }
  }
}
