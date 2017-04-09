export const addList = (newlist) => ({type: 'ADD_LIST', newlist});

export const deleteList = (listId) => ({type: 'DEL_LIST', listId});

export const clearCurrentItems = () => ({type: 'UNSET_CURRENTITEMS'});

export const setFetchedLists = (lists) => ({type: 'SET_FETECHEDLISTS', lists});

export const addItem = (itemObject, listId) => ({type: 'ADD_TOCURRENTITEMS', itemObject, listId});

export const addCoOwnerToList = (coOwner) => ({type: 'ADD_COOWNERLIST', coOwner});

export const setCoOwnerAccepted = (listId, coOwnerId) => ({type: 'SET_COOWNERACCEPTED', listId, coOwnerId});

export const editItem = (item) => ({type: 'EDIT_CURRENTITEM', item});

export const deleteItem = (index) => ({type: 'DEL_ITEM', index});

export const itemPicked = (listId, itemIndex) => ({type: 'SET_ITEMPICKED', listId, itemIndex});

export const setFetchedCurrentItems = (items) => ({type: 'SET_FETCHEDCURRENTITEMS', items});

export const setNetStatus = (isConnected, lastUpdated) => ({type: 'SET_NETSTATUS', isConnected, lastUpdated});

export const getItemsOffline = (lists, listId) => ({type: 'GET_ITEMSOFFLINE', lists, listId});

export const setUser = (user) => ({type: 'SET_USER', user});

export const delUser = () => ({type: 'DEL_USER'});

export const addCoOwner = (listId, coOwnerObject) => ({type: 'ADD_COOWNER', listId, coOwnerObject});

export const delCoOwner = (listId, coOwnerId) => ({type: 'DEL_COOWNER', listId, coOwnerId});
