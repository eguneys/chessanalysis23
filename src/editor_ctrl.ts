import { initial_fen, dark_poss, light_poss } from 'solid-play'

let checkerboard = [
  ...dark_poss.map(_ => `dark@@${_}`), 
    ...light_poss.map(_ => `light@@${_}`)]

export default class _Ce {

  get fen() {
    return checkerboard.join(' ')
  }

  select(piece) {
    console.log(piece)
  }

  constructor() {
  }
}


type Editor = _Ce
