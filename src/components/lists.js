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
    onDeleteList: (listId) => dispatch(actions.deleteList(listId))
	};
};

class Lists extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: this.ds.cloneWithRows([]),
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

  _getLists() {
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

      AsyncStorage.setItem('@LaundrylistsStore:lastUpdated', new Date().toLocaleString());
      AsyncStorage.setItem('@LaundrylistsStore:lastLists', JSON.stringify(responseData));
      this.props.onSetNetStatus(true, new Date().toLocaleString());
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
    this._getLists();
  }

  componentWillReceiveProps(nextProps) {
    for (let i = 0; i < nextProps.lists.length; i++) {
      for (let x = 0; x < nextProps.lists[i].coOwners.length; x++) {
        if (nextProps.lists[i].coOwners[x].facebookId === this.props.user.id) {
          console.log('LIST IS: ' + JSON.stringify(nextProps.lists[i].coOwners[x]));
          if (!nextProps.lists[i].coOwners[x].accepted) {
            this.props.onDeleteList(nextProps.lists[i]._id);
          }
        }
      }
    }
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(nextProps.lists)
    });
  }

  _listPressed(list) {
    this.props.navigator.push({
      name: 'ViewItems',
      passProps: {
        list: list
      }
    });
  }

  _newListView() {
    this.props.navigator.push({name: 'NewList'});
  }

  _onAddPressed() {
    this.props.navigator.push({
      name: 'NewList'
    });
  }

  render() {
    return (
      <View style={{flex:1}}>
        <Icon.ToolbarAndroid
          style={styles.toolbar}
          navIconName="menu"
          iconSize={26}
          subtitle={this.props.netStatus.message}
          title="Laundrylists"
          subtitleColor="white"
          titleColor="white"
          // logo={require ('../../LL-inverted-48x48.png')}
          onIconClicked={() => this.props.drawer.openDrawer()}
        />
        <ListView
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          refreshControl={
            <RefreshControl
              refreshing={this.state.runningRequest}
              onRefresh={() => {this._getLists()}}
            />
          }
          renderRow={(rowData) =>
            <View style={styles.rowContainer}>
              <TouchableHighlight style={styles.listItem} underlayColor={'#FFFFFF'} onPress={()=>this._listPressed(rowData)}>
                <View style={styles.listInfo}>
                    <Text
                      style={styles.itemText}>
                      {rowData.name}
                    </Text>
                </View>
              </TouchableHighlight>
              <Text
                style={styles.ownerText}>
                Created by {rowData.owner.firstName} {rowData.owner.lastName}
              </Text>
            </View>
          }
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
        />
        {this.props.netStatus.isConnected ? (
          <ActionButton
            buttonColor="rgba(255,102,0,1)"
            onPress={() => {this._onAddPressed()}}
          />
        ):(
          null
        )}
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
    marginTop: 10,
    marginLeft: 16,
    marginRight: 10,
    fontSize: 20,
    flex: 4,
  },
  createdAtText: {
    marginTop: 20,
    marginRight: 10,
    fontSize: 16,
    color: '#9E9E9E',
    flex: 1
  },
  listItem: {
    height: 40,
    flex: 6,
    flexDirection: 'row'
  },
  listInfo: {
    flex: 1,
    flexDirection: 'row'
  },
  rowContainer: {
    flexDirection: 'column',
    flex: 1
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Lists);
