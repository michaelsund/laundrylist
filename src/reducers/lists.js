import {
  SET_FETECHEDLISTS,
  ADD_LIST,
  DEL_LIST,
  ADD_ITEM,
  ADD_COOWNER,
  DEL_COOWNER,
  SET_COOWNERACCEPTED,
} from '../actions';

const initialState = [];

const sortByName = (a,b) => {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
};


const lists = (state = initialState, action) => {
  let newLists = [...state];
  switch (action.type) {
    case 'SET_FETECHEDLISTS':
      return Object.assign([], state, [...action.lists]);
    case 'ADD_LIST':
      action.newlist.itemCount = 0;
      return Object.assign([], state, [
        ...state,
        action.newlist
      ]);
    case 'DEL_LIST':
      let listIndex = null;
      state.map((list, i) => {
        if (list._id === action.listId) {
          console.log('FOUND LIST!');
          listIndex = i;
        }
      });
      return [
        ...state.slice(0, listIndex),
        ...state.slice(listIndex + 1)
      ];
    case 'ADD_COOWNER':
      let modifiedList = [...state];
      state.map((list, i) => {
        if (list._id === action.listId) {
          modifiedList[i].coOwners.splice(0, 0, action.coOwnerObject);
          modifiedList[i].coOwnersInfo.splice(0, 0, action.coOwnerObject);
        }
      });
      return [
        ...modifiedList
      ]
    case 'DEL_COOWNER':
      let newList = [...state];
      state.map((list, i) => {
        if (list._id === action.listId) {
          newList[i].coOwners.map((coOwner, x) => {
            if (coOwner.facebookId === action.coOwnerId) {
              newList[i].coOwners.splice(x, 1);
              newList[i].coOwnersInfo.splice(x, 1);
            }
          });
        }
      });
      return [
        ...newList
      ]
    case 'SET_COOWNERACCEPTED':
    let updatedList = [...state];
    state.map((list, i) => {
      if (list._id === action.listId) {
        updatedList[i].coOwners.map((coOwner, x) => {
          if (coOwner.facebookId === action.coOwnerId) {
            coOwner.accepted = true;
          }
        });
      }
    });
    return [
      ...updatedList
    ]
      return state;
    default:
      return state;
  }
};

export default lists;
