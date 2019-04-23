import React, { Component } from 'react';
import './App.css';
import { moveDisk, undoMove, redoMove, restartGame } from './redux.js'
import { connect } from 'react-redux';

const mapStateToProps = state => {
	let newState = Object.assign({}, state.present);
	let towers = [];
	for (let i = 0; i < newState.towers.length; i++)
		towers.push([...newState.towers[i]])
	delete newState.towers;
	newState.towers = towers;
	return newState;
}

const mapDispatchToProps = dispatch => {
	return {
		moveDisk: towers => dispatch(moveDisk(towers)),
		undoMove: () => dispatch(undoMove()),
		redoMove: () => dispatch(redoMove()),
		restartGame: () => dispatch(restartGame())
	}
}

function Towers (props) {
	return (
		<div style={{ left: `${33*props.num}%` }} className="tower-wrapper">
			{props.disks}
			<div className="tower"/>
		</div>
	)
}

function Disk (props) {
	let style = {
		width: `${props.num * 25 + 100}px`,
		backgroundColor: `rgb(${(props.num - 1) * 64 - 1}, ${(props.num - 1) * 64 - 1}, ${(props.num - 1) * 64 - 1})` 
	}

	return (
		<div 
		id={'disk' + props.num}
		style={{ bottom: `${(props.position) * 50}px` }} 
		className="disk-wrapper">
			<div 
			onMouseDown={props.grabDisk(props.num, props.tower)} 			
			style={style} 
			className="disk" />
		</div>
	)
}

class App extends Component {
	constructor (props) {
		super (props);
		this.state = { diskPos: [] }
		this.grabDisk = this.grabDisk.bind(this);
		this.drag = this.drag.bind(this);
		this.dropDisk = this.dropDisk.bind(this);
	}

	renderDisksandTowers () {
		let arr = [];
		let towers = this.props.towers;
		for (let i = 0; i < towers.length; i++) {
			let tower = towers[i];
			let diskArr = [];
			for (let j = 0; j < tower.length; j++) {
				diskArr.push(
					<Disk 
					grabDisk={this.grabDisk} 
					key={j} 
					num={tower[j]} 
					tower={i} 
					position={j}/>)
			}
			arr.push(<Towers key={i} num={i} disks={diskArr}/>)
		}
		return arr;
	}

	drag = id => event => {
			event.preventDefault();
			let element = document.getElementById(id);
			let diskPos = [...this.state.diskPos];
			let movementX = diskPos[0] - event.clientX;
			let movementY = diskPos[1] - event.clientY;
			diskPos[0] = event.clientX;
			diskPos[1] = event.clientY;
			element.style.top = (element.offsetTop - movementY) + "px";
			element.style.left = (element.offsetLeft - movementX) + "px";
			this.setState({ diskPos })
	}

	dropDisk (diskNum, oldTower) {
		document.onmouseup = null;
		document.onmousemove = null;
		let event = window.event;
		let wrapperWidth = window.innerWidth/3;
		let diskX = event.clientX;
		let tooHigh = event.clientY < window.innerHeight/3;
		let towers = [...this.props.towers];
		let newTower, disks;

		if (diskX < wrapperWidth) newTower = 0;
		else if (diskX < 2 * wrapperWidth) newTower = 1;
		else newTower = 2;
		disks = towers[newTower];

		if (newTower === oldTower || disks[disks.length-1] < diskNum || tooHigh) {
			let element = document.getElementById('disk' + diskNum);
			element.style.top = this.state.origPos[0];
			element.style.left = this.state.origPos[1];
			if (disks[disks.length-1] < diskNum) {
				setTimeout(() => {
				alert('Invalid Move: Cannot put a disk on top of a smaller disk.')},
				10)
			}
		} else {
			towers[oldTower] = towers[oldTower].filter( disk => disk !== diskNum);
			towers[newTower].push(diskNum)
			towers[newTower].sort((a,b) => b - a);
			this.props.moveDisk(towers);
			this.setState({ diskPos: [], origPos: [] }, () => this.gameWin());
		}
	}

	grabDisk = (diskNum, oldTowerNum) => event => {
		let oldTower = this.props.towers[oldTowerNum];
		/* Only the top disk on a tower can be moved */
		if (oldTower[oldTower.length-1] !== diskNum) return;
		let diskPos = [...this.state.diskPos];
		let elementStyle = document.getElementById(event.target.parentNode.id).style;
		let origPos = [elementStyle.top, elementStyle.left];
		event.preventDefault();
		event.persist();
		diskPos = [event.clientX, event.clientY];
		document.onmousemove  = this.drag(event.target.parentNode.id);
		document.onmouseup = () => this.dropDisk(diskNum, oldTowerNum);
		this.setState({ diskPos, origPos })
	}

	gameWin () {
		let towers = this.props.towers;
		/* All 3 disks are on the right tower */
		if (towers[towers.length - 1].length === 3) {
			setTimeout(() => this.restartConfirm(), 10);
		}
	}

	restartConfirm() {
		let steps = this.props.steps;
		if (window.confirm('You win in ' + steps + ' steps. Start a new game?'))
			this.props.restartGame()
	}


	render () {
		return (
			<div id="app">
				<div id="navbar">
					<button onClick={()=>{alert('Move all the disks to the right(third) tower and win!');}}>
						Help
					</button>
					<button onClick={this.props.undoMove}>Undo</button>
					<button onClick={this.props.redoMove}>Redo</button>
					<button onClick={this.props.restartGame}>Restart</button>
				</div>
				<div id="play"> {this.renderDisksandTowers()} </div>
			</div>
		)
	}
}

export default connect(
	mapStateToProps, 
	mapDispatchToProps)(App)
