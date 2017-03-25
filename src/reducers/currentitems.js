import {
  SET_FETCHEDCURRENTITEMS,
  ADD_TOCURRENTITEMS,
  SET_ITEMPICKED
} from '../actions';

const initialState = [];

const setItemToPicked = (items, itemIndex) => {
  items[itemIndex].picked = !items[itemIndex].picked;
  return items
};

const getCurrentPickedStatus = (items, itemIndex) => {
  return items[itemIndex].picked;
};

const sortByName = (a,b) => {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
};

const currentitems = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_FETCHEDCURRENTITEMS':
      return [
        ...action.items
      ].sort(sortByName);
    case 'UNSET_CURRENTITEMS':
      return [];
    case 'DEL_ITEM':
      return [
        ...state.slice(0, action.index),
        ...state.slice(action.index + 1)
      ];
    case 'EDIT_CURRENTITEM':
      action.item.name = action.item.name.charAt(0).toUpperCase() + action.item.name.slice(1).toLowerCase();
      return [
        ...state.slice(0, action.item.itemIndex),
        Object.assign({}, state[action.item.itemIndex], {
          name: action.item.name,
          quantity: action.item.quantity
        }),
        ...state.slice(action.item.itemIndex + 1)
      ].sort(sortByName);
    case 'ADD_TOCURRENTITEMS':
      action.itemObject.name = action.itemObject.name.charAt(0).toUpperCase() + action.itemObject.name.slice(1).toLowerCase();
      return [
        ...state,
        action.itemObject
      ].sort(sortByName);
    case 'SET_ITEMPICKED':
      const pickedStatus = getCurrentPickedStatus(state, action.itemIndex);
      return [
        ...state.slice(0, action.itemIndex),
        Object.assign({}, state[action.itemIndex], {
          picked: !pickedStatus
        }),
        ...state.slice(action.itemIndex + 1)
      ];
    case 'GET_ITEMSOFFLINE':
      const offlineItems = [];
      if (action.lists.length > 0) {
        action.lists.map((list) => {
          if (list._id === action.listId) {
            offlineItems = list.items;
          }
        });
      }
      return offlineItems.sort(sortByName);
    default:
      return state;
  }
};

export default currentitems;
