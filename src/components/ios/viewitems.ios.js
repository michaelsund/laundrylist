import Config from '../../../server/serversettings.json';
import React, { Component } from 'react';
import {
  ListView,
  NetInfo,
  StyleSheet,
  Text,
  TouchableHighlight,
  Button,
  TextInput,
  View,
  Fetch,
  AsyncStorage,
  Alert,
  AlertIOS,
  RefreshControl,
  AppState
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationBar from './navigationbar.ios';
import MenuBar from './menubar.ios';

const mapStateToProps = (state) => {
  return {
    currentitems: state.currentitems,
    netStatus: state.netStatus,
    user: state.user
  };
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSetFetchedCurrentItems: (items) => dispatch(actions.setFetchedCurrentItems(items)),
    onSetItemPicked: (listId, itemIndex) => dispatch(actions.itemPicked(listId, itemIndex)),
    onDeleteList: (listId) => dispatch(actions.deleteList(listId)),
    onClearCurrentItems: () => dispatch(actions.clearCurrentItems()),
    onSetNetStatus: (isConnected, lastUpdated) => dispatch(actions.setNetStatus(isConnected, lastUpdated)),
    onGetItemsOffline: (lists, listId) => dispatch(actions.getItemsOffline(lists, listId)),
    onDeleteItem: (index) => dispatch(actions.deleteItem(index)),
	};
};

class ViewItems extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: this.ds.cloneWithRows(this.props.currentitems),
      uniqueItems: [],
      isActionButtonVisible: true,
      runningRequest: false
    };
    this.serverUrl = '';
    if (Config.devMode) {
      this.serverUrl = Config.dev + ':' + Config.port;
    }
    else {
      this.serverUrl = Config.prod + ':' + Config.port;
    }
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(nextProps.currentitems)
    });
  };

  _deleteListConfirmation() {
    if (this.props.netStatus.isConnected) {
      Alert.alert(
        'Delete confirmation',
        'Are you sure?',
        [
          {text: 'No', onPress: () => {}, style: 'cancel'},
          {text: 'Yes', onPress: () => this._deleteList()},
        ]
      );
    }
  };

  _deleteList() {
    fetch('http://' + this.serverUrl + '/api/removelist',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listId: this.props.list._id
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.success) {
        this.props.onDeleteList(this.props.list._id);
        this.props.navigator.pop();
        this.props.onClearCurrentItems();
      }
    })
    .done();
  };

  _clearListConfirmation() {
    if (this.props.netStatus.isConnected) {
      Alert.alert(
        'Clear confirmation',
        'Are you sure?',
        [
          {text: 'No', onPress: () => {}, style: 'cancel'},
          {text: 'Yes', onPress: () => this._clearList()},
        ]
      );
    }
  };

  showToast() {
    AlertIOS.alert(
      'No more items to pick!'
    );
  };

  _clearList() {
    fetch('http://' + this.serverUrl + '/api/clearlist',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listId: this.props.list._id
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.success) {
        this.props.onClearCurrentItems();
      }
    })
    .done();
  };

  _getItems() {
    this.state.runningRequest = true;
    fetch('http://' + this.serverUrl + '/api/getitems',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listId: this.props.list._id
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.state.runningRequest = false;
      // We only update the date when the full list from the root view "lists" has been fetched.
      this.props.onSetNetStatus(true, null);
      this.props.onSetFetchedCurrentItems(responseData.list.items);
      this.setState({uniqueItems: responseData.list.uniqueItems});
    })
    .catch((error) => {
      this.state.runningRequest = false;
      this.props.onSetNetStatus(false, null);
      AsyncStorage.getItem('@LaundrylistsStore:lastLists').then((lists) => {
        this.props.onGetItemsOffline(JSON.parse(lists), this.props.list._id);
      })
      .catch((error) => {
        // Handle error, if storage can not be read.
      })
      .done();
    })
    .done();
  };

  _handleAppStateChange = (event) => {
    if (event === 'active') {
      this._getItems();
    }
  };

  componentWillMount() {
    this._getItems();
  };

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    // Websocket
    // this.ws = new WebSocket('ws://' + this.serverUrl);
    // this.ws.onopen = () => {
    //   console.log('CONNECTED WEBSOCKET');
    //   this.ws.send('add subscriber to list ' + this.props.list._id);
    // };
    // this.ws.onmessage = (e) => {
    //   console.log('GOT: ' + e.data);
    // };
    //
    // this.ws.onerror = (e) => {
    //   console.log('ERROR CONNECTING TO SOCKET');
    //   console.log(e.message);
    // };
    //
    // this.ws.onclose = (e) => {
    //   this.ws.send('closing for list ' + this.props.list._id);
    //   console.log('CLOSING SOCKET');
    //   console.log(e.code, e.reason);
    // };
  }

  componentDidUnMount() {
    this.ws.close();
    console.log('closing socket in umount');
  }

  checkIfPicked(item) {
    return item.picked;
  };

  _onItemClicked(index, data) {
    // this.ws.close();
    this.props.onSetItemPicked(this.props.list._id, parseInt(index));
    fetch('http://' + this.serverUrl + '/api/setpicked',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listId: this.props.list._id,
        itemId: data._id,
        picked: data.picked
      })
    })
    .done();
    // Check if all items in list are picked
    if (!this.props.currentitems.every(this.checkIfPicked)) {
      this.showToast();
    }
  };

  _onActionSelected(index) {
    if (index === 0) {
      this._getItems();
    }
    if (index === 1) {
      this._clearListConfirmation();
    }
    //Check if the user is the owner first
    if (index === 2) {
      if (this.props.user.id === this.props.list.owner.facebookId) {
        this._deleteListConfirmation();
      }
      else {
        Alert.alert(
          'Hey!',
          'Only the creator of this list can delete it.',
          [
            {text: 'Ok', onPress: () => {}, style: 'cancel'},
          ]
        );
      }
    }
  };

  _onAddNewItemClicked() {
    this.props.navigator.push({
      name: 'NewItem',
      passProps: {
        listId: this.props.list._id,
        uniqueItems: this.state.uniqueItems
      }
    });
  };

  _onEditItem(data, index) {
    this.props.navigator.push({
      name: 'EditItem',
      passProps: {
        data: data,
        listId: this.props.list._id,
        index: index
      }
    });
  }

  _onDeleteItem(itemId, index) {
    Alert.alert(
      'Really remove this item?',
      '',
      [
        {text: 'No', onPress: () => {}, style: 'cancel'},
        {text: 'Yes', onPress: () => this._deleteItemConfirm(itemId, index)},
      ]
    );
  }

  _deleteItemConfirm(itemId, index) {
    fetch('http://' + this.serverUrl + '/api/delitem',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listId: this.props.list._id,
        itemId: itemId
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.props.onSetNetStatus(true, null);
      this.props.onDeleteItem(parseInt(index));
    })
    .catch((error) => {
      this.props.onSetNetStatus(false, null);
      AsyncStorage.getItem('@LaundrylistsStore:lastLists').then((lists) => {
        this.props.onGetItemsOffline(JSON.parse(lists), this.props.list._id);
      })
      .catch((error) => {
        // Handle error, if storage can not be read.
      })
      .done();
    })
    .done();
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar
          canPop={true}
          canAdd={true}
          title={this.props.list.name}
          addFunc={() => {this._onAddNewItemClicked()}}
          navigator={this.props.navigator}
        />
        <ListView
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          refreshControl={
            <RefreshControl
              refreshing={this.state.runningRequest}
              onRefresh={() => {this._getItems()}}
            />
          }
          renderRow={(rowData, sectionID, rowID) =>
            <View style={styles.rowContainer}>
              <TouchableHighlight underlayColor={'#FFFFFF'} style={styles.listItem} onPress={this._onItemClicked.bind(this, rowID, rowData)}>
                <View style={styles.itemContainer}>
                  <Text
                    style={[
                      styles.quantityText,
                      rowData.picked && styles.Picked,
                      !rowData.picked && styles.NotPicked
                    ]}>
                    {rowData.quantity}
                  </Text>
                  <Text
                    style={[
                      styles.itemText,
                      rowData.picked && styles.Picked,
                      !rowData.picked && styles.NotPicked
                    ]}>
                    {rowData.name}
                  </Text>
                </View>
              </TouchableHighlight>
              {this.props.netStatus.isConnected ? (
                <Icon name="edit" style={styles.edit} onPress={this._onEditItem.bind(this, rowData, rowID)} />
              ):(
                null
              )}
              {this.props.netStatus.isConnected ? (
                <Icon name="close" style={styles.delete} onPress={this._onDeleteItem.bind(this, rowData._id, rowID)} />
              ):(
                null
              )}
            </View>
          }
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  toolbar: {
    backgroundColor: '#FF6600',
    height: 56,
  },
  edit: {
    fontSize: 20,
    marginTop: 15,
    textAlign: 'center',
    color: '#9E9E9E',
    flex: 1,
  },
  delete: {
    fontSize: 20,
    marginTop: 15,
    textAlign: 'center',
    color: '#9E9E9E',
    marginRight: 7,
    flex: 1,
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
  rowContainer: {
    flexDirection: 'row',
    flex: 8
  },
  itemContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 16,
  },
  itemText: {
    fontSize: 16,
    marginTop: 7
  },
  quantityText: {
    fontSize: 24,
    marginRight: 10
  },
  Picked: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E'
  },
  NotPicked: {
    textDecorationLine: 'none',
    // fontWeight: 'bold'
  },
  listItem: {
    height: 50,
    flex: 6
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewItems);
