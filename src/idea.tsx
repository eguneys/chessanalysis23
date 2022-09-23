import _Idea from './idea_ctrl'
import Ce from './editor'

const Idea = props => {

  let ctrl = new _Idea().init()

  return (<>
    <div class='cidea'>
      <div class='editor-wrap'>
        <Ce onChange={_ => ctrl.e_change(_)}/>
      </div>
      <div class='editor-side'>
        <div class='vert-pieses'>
          <For each={ctrl.pieses}>{ piese =>
            <div class="tab">
              <div class={piese.klass}/>
            </div>
          }</For>
        </div>
      </div>
    </div>
   </>)


}


export default Idea
