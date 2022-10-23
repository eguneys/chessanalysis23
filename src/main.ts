import './style.css'
import { render } from 'solid-js/web'
import App from './main-app'

const app = (element: HTMLElement) => {
  render(App, element)
}


app(document.getElementById('app')!)
