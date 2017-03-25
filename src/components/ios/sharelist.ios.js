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
  Image,
  Alert
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationBar from './navigationbar.ios';

const mapStateToProps = (state) => {
  return {
    lists: state.lists,
    netStatus: state.netStatus,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
	return {
    onDelCoOwner: (listId, coOwnerId) => dispatch(actions.delCoOwner(listId, coOwnerId))
  }
};

class ShareList extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: this.ds.cloneWithRows([])
    };
    this.serverUrl = '';
    if (Config.devMode) {
      this.serverUrl = Config.dev + ':' + Config.port;
    }
    else {
      this.serverUrl = Config.prod + ':' + Config.port;
    }
  };

  componentDidMount() {
    this.props.lists.map((list) => {
      if (list._id === this.props.listId) {
        this.setState({dataSource: this.ds.cloneWithRows(list.coOwners)});
      }
    });
  };

  componentWillReceiveProps(nextProps) {
    nextProps.lists.map((list) => {
      if (list._id === this.props.listId) {
        this.setState({dataSource: this.ds.cloneWithRows(list.coOwners)});
      }
    });
  };

  _onBackClicked() {
    this.props.navigator.pop();
  };

  _removeUserAlert(user) {
    const alertMsg = '';
    Alert.alert(
      'Confirmation',
      'Remove ' + user.firstName + ' ' + user.lastName + '?',
      [
        {text: 'No', onPress: () => {}, style: 'cancel'},
        {text: 'Yes', onPress: () => this._removeUser(user.facebookId)},
      ]
    )
  };

  _removeUser(id) {
    console.log('removing coOwner ' + id);
    fetch('http://' + this.serverUrl + '/api/removecoowner',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        facebookId: id,
        listId: this.props.listId
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.props.onDelCoOwner(this.props.listId, id);
    })
    .done();
  };

  _onAddNewCoOwner() {
    this.props.navigator.push({
      name: 'ShareWith',
      passProps: {
        listId: this.props.listId
      }
    });
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar
          canPop={true}
          canAdd={true}
          title="Sharing with"
          navigator={this.props.navigator}
          addFunc={() => {this._onAddNewCoOwner()}}
        />
        <ListView
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          renderRow={(rowData) =>
            <View style={styles.view}>
              <Image
                style={styles.image}
                source={{uri: rowData.pictureURL}}
              />
              <Text style={styles.nameText} ellipsizeMode="middle" numberOfLines={1}>
                {rowData.firstName} {rowData.lastName}
              </Text>
              <View style={styles.btnContainer}>
                <Icon
                  style={styles.removeIcon}
                  name="clear"
                  onPress={()=> {this._removeUserAlert(rowData)}}
                />
              </View>
            </View>
          }
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    height: 100,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E8E',
    flexDirection: 'row',
    flex: 8
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  toolbar: {
    backgroundColor: '#FF6600',
    height: 56,
  },
  removeIcon: {
    fontSize: 26,
    textAlign: 'center',
    color: '#9E9E9E',
    marginTop: 34,
    marginRight: 25,
    flex: 2
  },
  itemContainer: {
    flex: 8,
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 16,
  },
  nameText: {
    fontSize: 16,
    marginLeft: 15,
    marginTop: 35,
    flex: 6
  },
  image: {
    height:60,
    width: 60,
    borderRadius: 30,
    marginTop: 20,
    marginLeft: 15
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ShareList);
