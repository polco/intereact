import ReactDOM from 'react-dom';
import Main from './src/main.jsx';

let intereactNode = document.createElement('div');
intereactNode.classList.add('intereact');
document.body.appendChild(intereactNode);
ReactDOM.render(<Main />, intereactNode)
