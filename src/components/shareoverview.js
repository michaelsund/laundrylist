import Config from '../../server/serversettings.json';
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
  Navigator,
  AsyncStorage,
  Alert,
  RefreshControl
} from 'react-native';
import ActionButton from 'react-native-action-button';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Moment from 'moment';

const mapStateToProps = (state) => {
  return {
    lists: state.lists,
    netStatus: state.netStatus,
    user: state.user
  };
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSetFetchedLists: (lists) => dispatch(actions.setFetchedLists(lists)),
    onSetNetStatus: (isConnected, lastUpdated) => dispatch(actions.setNetStatus(isConnected, lastUpdated)),
    onDeleteList: (listId) => dispatch(actions.deleteList(listId)),
    onSetCoOwnerAccepted: (listId, coOwnerId) => dispatch(actions.setCoOwnerAccepted(listId, coOwnerId))
	};
};

class ShareOverview extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: this.ds.cloneWithRows(this.props.lists),
      runningRequest: false
    };
    this.serverUrl = '';
    if (Config.devMode) {
      this.serverUrl = Config.dev + ':' + Config.port;
    }
    else {
      this.serverUrl = Config.prod + ':' + Config.port;
    }
  }

  _refreshList() {
    this.setState({dataSource: this.ds.cloneWithRows([])});
    this.state.runningRequest = true;
    fetch('http://' + this.serverUrl + '/api/',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.props.user.id
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.state.runningRequest = false;
      // If we got data back, send it to redux
      this.props.onSetFetchedLists(responseData);
      this.props.onSetNetStatus(true, new Date().toLocaleString());
      AsyncStorage.setItem('@LaundrylistsStore:lastUpdated', new Date().toLocaleString());
      AsyncStorage.setItem('@LaundrylistsStore:lastLists', JSON.stringify(responseData));
    })
    .catch((error) => {
      this.state.runningRequest = false;
      // If server cannot be reached, send last saved list from storage to redux
      AsyncStorage.getItem('@LaundrylistsStore:lastUpdated').then((lastUpdate) => {
        // Update status to offline and send the last time we updated to redux from storage
        this.props.onSetNetStatus(false, lastUpdate);
      })
      .catch((error) => {
        // Handle error, if storage can not be read.
      })
      .done();
      AsyncStorage.getItem('@LaundrylistsStore:lastLists').then((lists) => {
        // Dispatch the stored offlinelists to redux
        this.props.onSetFetchedLists(JSON.parse(lists));
      })
      .done();
    })
    .done();
  }

  componentWillMount() {
    this._refreshList();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({dataSource: this.ds.cloneWithRows(nextProps.lists)})
  }

  _shareList(list) {
    this.props.navigator.push({
      name: 'ShareList',
      passProps: {
        listId: list._id
      }
    });
  }

  confirmRemoveMeFromShare(listId) {
    fetch('http://' + this.serverUrl + '/api/declineshare',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: this.props.user.id,
        listId: listId
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.props.onDeleteList(listId);
    })
    .catch((error) => {
      Alert.alert(
        'Gosh darnit',
        'The was a problem with the request, please try again later.',
        [
          {text: 'Ok', onPress: () => {}, style: 'cancel'}
        ]
      );
    })
    .done();
  }

  _removeMeFromShare(listId) {
    Alert.alert(
      'Decline shared list',
      'Are you sure?',
      [
        {text: 'No', onPress: () => {}, style: 'cancel'},
        {text: 'Yes', onPress: () => this.confirmRemoveMeFromShare(listId)},
      ]
    );
  }

  _acceptShare(listId) {
    fetch('http://' + this.serverUrl + '/api/acceptshare',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: this.props.user.id,
        listId: listId
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.props.onSetCoOwnerAccepted(listId, this.props.user.id);
    })
    .catch((error) => {
      Alert.alert(
        'Gosh darnit',
        'The was a problem with the request, please try again later.',
        [
          {text: 'Ok', onPress: () => {}, style: 'cancel'}
        ]
      );
    })
    .done();
  }

  render() {
    return (
      <View style={{flex:1}}>
        <Icon.ToolbarAndroid
          style={styles.toolbar}
          iconSize={26}
          title="Shared lists"
          subtitle={this.props.netStatus.message}
          subtitleColor="white"
          titleColor="white"
          navIconName="menu"
          onIconClicked={() => this.props.drawer.openDrawer()}
        />
        {
          this.props.netStatus.isConnected ? (
            <ListView
              enableEmptySections={true}
              dataSource={this.state.dataSource}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.runningRequest}
                  onRefresh={() => {this._refreshList()}}
                />
              }
              renderRow={(rowData) =>
                <View style={styles.rowContainer}>
                  <View style={styles.listItem}>
                    <View style={styles.listInfo}>
                        <Text
                          style={styles.itemText}>
                          {rowData.name}
                        </Text>
                    </View>
                    <View style={styles.listManage}>
                      <TouchableHighlight underlayColor={'#FFFFFF'}>
                        <View style={styles.manageBtn}>
                          { rowData.owner.facebookId === this.props.user.id ? (
                              <Icon
                                style={styles.shareIcon}
                                name="people"
                                onPress={() => {this._shareList(rowData)}}
                              />
                            ) : (
                              rowData.coOwners.map((user, i) => {
                                if (user.facebookId === this.props.user.id) {
                                  if (user.accepted) {
                                    return <Icon
                                      key={i}
                                      style={styles.removeIcon}
                                      name="delete"
                                      onPress={() => {this._removeMeFromShare(rowData._id)}}
                                    />
                                  }
                                  else {
                                    return <View key={i} style={{flex: 1, flexDirection: 'row'}}>
                                      <Icon
                                        style={styles.acceptIcon}
                                        name="check"
                                        onPress={() => {this._acceptShare(rowData._id)}}
                                      />
                                      <Icon
                                        style={styles.unAcceptIcon}
                                        name="do-not-disturb"
                                        onPress={() => {this._removeMeFromShare(rowData._id)}}
                                      />
                                    </View>
                                  }
                                }
                              })
                            )
                          }
                        </View>
                      </TouchableHighlight>
                    </View>
                  </View>
                  <View style={styles.additionalInfo}>
                    <Text
                      style={styles.ownerText}>
                      Created by {rowData.owner.firstName} {rowData.owner.lastName} at {Moment(rowData.createdAt).format('YYYY-MM-DD')}
                    </Text>
                  </View>
                </View>
              }
              renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
            />
          ) : (
            <Icon
              style={styles.disconnectedIcon}
              name="signal-wifi-off"
            />
          )
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  manageBtn: {
    marginTop: 28,
    flexDirection: 'row'
  },
  disconnectedIcon: {
    fontSize: 50,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 30
  },
  shareIcon: {
    fontSize: 26,
    color: '#9E9E9E',
    textAlign: 'right',
    marginRight: 9,
    flex: 1
  },
  acceptIcon: {
    fontSize: 26,
    color: '#9E9E9E',
    textAlign: 'right',
    marginRight: 12,
    flex: 1
  },
  unAcceptIcon: {
    fontSize: 26,
    color: '#9E9E9E',
    textAlign: 'right',
    marginRight: 9,
    flex: 1
  },
  removeIcon: {
    fontSize: 26,
    color: '#9E9E9E',
    textAlign: 'right',
    marginRight: 9,
    flex: 1
  },
  toolbar: {
    backgroundColor: '#FF6600',
    height: 56,
  },
  ownerText: {
    fontSize: 12,
    marginLeft: 16,
    marginBottom: 5
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
  itemText: {
    marginTop: 24,
    marginLeft: 16,
    marginRight: 10,
    fontSize: 20,
    flex: 4,
  },
  listItem: {
    flex: 6,
    flexDirection: 'row'
  },
  listInfo: {
    flex: 4
  },
  listManage: {
    flex: 1
  },
  rowContainer: {
    flexDirection: 'column',
    flex: 1,
    height: 80
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ShareOverview);
