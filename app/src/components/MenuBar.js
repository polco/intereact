import 'styles/MenuBar.less';
import React from 'react';

export default class MenuBar extends React.Component {
	render() {
		return (
			<div className='menu-bar'>
				<div className='logo'>SENSU</div>
				<div className='link'>Home</div>
				<div className='link'>My Sensu</div>
				<div className='link'>Create</div>
				<div className='link'>Library</div>
				<div className='link'>Profile</div>
				<div className='link'>About</div>
				<div className='link'>Sign In</div>
			</div>
		);
	}
}
