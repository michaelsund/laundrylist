import { combineReducers } from 'redux';
import lists from './lists';
import currentitems from './currentitems';
import netStatus from './netStatus';
import user from './user';

export default combineReducers({
  lists,
  currentitems,
  netStatus,
  user
});
