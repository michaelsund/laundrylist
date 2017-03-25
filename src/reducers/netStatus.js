import {
  SET_NETSTATUS
} from '../actions';

const initialState = {
  isConnected: false,
  message: '',
  lastUpdated: ''
};

const netStatus = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_NETSTATUS':
    // Check if the date is set, the do a full update of last connection to server.
    if (action.lastUpdated !== null) {
      return Object.assign({}, state, {
        isConnected: action.isConnected,
        message: action.isConnected ? '' : 'Server unavailable',
        lastUpdated: action.lastUpdated
      });
    }
    // Just indicate that we are offline, the view calling has not provided any new data.
    else {
      return Object.assign({}, state, {
        isConnected: action.isConnected,
        message: action.isConnected ? '' : 'Server unavailable',
      });
    }
    default:
      return state;
  }
};

export default netStatus;
