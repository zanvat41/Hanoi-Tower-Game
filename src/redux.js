import { createStore} from 'redux';

export const moveDisk = towers => {
	return { type: 'MOVE', towers }
};

export const undoMove = () => {
	return { type: 'UNDO' }
}

export const redoMove = () => {
	return { type: 'REDO' }
}

export const restartGame = () => {
	return { type: 'RESTART' }
}

const initialState = Object.assign({},{
	past: [],
	present: {
		steps: 0,
		towers: [
			[3,2,1],
			[],
			[]
		]
	},
	future: []
})

const reducer = (state = Object.assign({}, initialState), action) => {
	switch (action.type) {
		case 'MOVE':
			let present = Object.assign({},state.present);
			delete present.towers;
			present.towers = action.towers;
			present.steps++;
			return {
				past: state.past.concat(Object.assign({},state.present)),
				present,
				future: []
			}
		case 'REDO':
			if (state.future.length === 0) return state;
			return {
				past: state.past.concat(Object.assign({}, state.present)),
				present: Object.assign({},state.future[0]),
				future: state.future.slice(1)
			}
		case 'UNDO':
			if (state.past.length === 0) return state;
			return {
				past: state.past.slice(0, state.past.length - 1),
				present: Object.assign({},state.past[state.past.length - 1]),
				future: [Object.assign({}, state.present), ...state.future]
			}
		case 'RESTART':
			return {
				past: [],
				present: {
					steps: 0,
					towers: [
						[3,2,1],
						[],
						[]
					]
				},
				future: []
			}
		default:
			return state;
	}
}

export const store = createStore(reducer);

