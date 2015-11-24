import ReactDOM from 'react-dom';
import Main from './main.jsx';

let intereactNode = document.createElement('div');
intereactNode.classList.add('intereact');
document.body.appendChild(intereactNode);
ReactDOM.render(<Main />, intereactNode)
