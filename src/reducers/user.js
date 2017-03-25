import {
  SET_USER,
  DEL_USER
} from '../actions';

const initialState = {};

const user = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return Object.assign({}, state, action.user);
    case 'DEL_USER':
      return {};
    default:
      return state;
  }
};

export default user;
