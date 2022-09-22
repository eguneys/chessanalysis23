import { initial_fen, dark_poss, light_poss } from 'solid-play'
import { make_ref, make_drag_ref } from 'solid-play'


export default class _Ce {

  get fen() {
    return 'b'
  }

  init() {
    this.ref_free = make_ref()


    make_drag_ref({
      on_hover(e) {
        console.log('hover')
      },
      on_drag(e) {
        console.log('here')
      },
      on_up(e) {
        console.log('up')
      }
    }, this.ref_free)


    return this
  }
}


type Editor = _Ce
