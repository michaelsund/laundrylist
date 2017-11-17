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
  Image,
  Alert
} from 'react-native';
import {
    LazyloadListView,
    LazyloadView,
    LazyloadImage
} from 'react-native-lazyload';
import ActionButton from 'react-native-action-button';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Icon from 'react-native-vector-icons/MaterialIcons';

const mapStateToProps = (state) => {
  return {
    netStatus: state.netStatus,
    lists: state.lists,
    user: state.user
  };
};

const mapDispatchToProps = (dispatch) => {
	return {
    onAddCoOwner: (listId, coOwnerObject) => dispatch(actions.addCoOwner(listId, coOwnerObject))
	};
};


class ShareWith extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      searchQuery: '',
      allUsers: [],
      coOwnersInfo: [],
      dataSource: this.ds.cloneWithRows([])
    };
    this.serverUrl = '';
    if (Config.devMode) {
      this.serverUrl = Config.dev + ':' + Config.devPort;
    }
    else {
      this.serverUrl = Config.prod + ':' + Config.port;
    }
  };

  _getUsers() {
    fetch('http://' + this.serverUrl + '/api/users',
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.setState({allUsers: responseData.users});
    })
    .catch((error) => {
      //Todo
    })
    .done();
  };

  _searchUniqueItems(text) {
    this.setState({searchQuery: text});
    if (text.length > 0) {
      const tmpUsersFirstName = this.state.allUsers.map((user) => {return user.firstName});
      const tmpUsersLastName = this.state.allUsers.map((user) => {return user.lastName});
      tmpUsersFirstName = String.prototype.toLowerCase.apply(tmpUsersFirstName).split(",");
      tmpUsersLastName = String.prototype.toLowerCase.apply(tmpUsersLastName).split(",");
      const results = [];
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows([])
      });
      // Search for matches in firstname
      for (const i = 0; i < tmpUsersFirstName.length; i++) {
        if (tmpUsersFirstName[i].indexOf(text.toLowerCase()) == 0) {
          // Check if we allready have object in array
          if (results.indexOf(this.state.allUsers[i]) < 0) {
            results.push(this.state.allUsers[i]);
          }
        }
      }
      // Search for matches in lastname
      for (const i = 0; i < tmpUsersLastName.length; i++) {
        if (tmpUsersLastName[i].indexOf(text.toLowerCase()) == 0) {
          if (results.indexOf(this.state.allUsers[i]) < 0) {
            results.push(this.state.allUsers[i]);
          }
        }
      }
      if (results.length > 0) {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(results)
        });
      }
    }
    else {
      this.setState({dataSource: this.ds.cloneWithRows([])});
    }
  };

  componentWillMount() {
    this._getUsers();
    this.props.lists.map((list) => {
      if (list._id === this.props.listId) {
        this.state.coOwnersInfo = list.coOwnersInfo;
      }
    });
  }

  _onBackClicked() {
    this.props.navigator.pop();
  };

  _addUser(user) {
    // Dont add yourself
    if (user.facebookId !== this.props.user.id) {
      let exists = false;
      for (const i = 0; i < this.state.coOwnersInfo.length; i++) {
        if (this.state.coOwnersInfo[i].facebookId === user.facebookId) {
          exists = true;
        }
      }
      if (!exists) {
        fetch('http://' + this.serverUrl + '/api/addcoowner',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listId: this.props.listId,
            facebookId: user.facebookId
          })
        })
        .then((response) => response.json())
        .then((responseData) => {
          this.props.onAddCoOwner(this.props.listId, responseData.user);
          this.props.navigator.pop();
        })
        .done();
      }
      else {
        Alert.alert(
          'Hey',
          'Allready sharing this list with that user',
          [
            {text: 'Ok', onPress: () => {}, style: 'cancel'}
          ]
        );
      }
    }
    else {
      Alert.alert(
        'What?',
        'You own this list, no need to add yourself.',
        [
          {text: 'Ok', onPress: () => {}, style: 'cancel'}
        ]
      );
    }
  };

  renderRow(user) {
    const base64Image = `data:image/png;base64,${user.pictureBlob}`;
    return (
      <View style={styles.view}>
        <LazyloadView host="shareList">
            <TouchableHighlight underlayColor={'#FFFFFF'} style={styles.userItem} onPress={() => {this._addUser(user)}}>
              <View style={styles.itemContainer}>
                <Image
                  style={styles.image}
                  source={{uri: base64Image}}
                />
                <Text style={styles.nameText}>
                  {user.firstName} {user.lastName}
                </Text>
              </View>
            </TouchableHighlight>
        </LazyloadView>
      </View>
    );
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Icon.ToolbarAndroid
          style={styles.toolbar}
          title="Add user"
          subtitle=""
          subtitleColor="white"
          titleColor="white"
          navIconName="arrow-back"
          iconSize={26}
          onIconClicked={this._onBackClicked.bind(this)}
        />
        <TextInput
          style={styles.input}
          placeholder="Search for a person"
          autoFocus={true}
          style={styles.input}
          onChangeText={(text) => {this._searchUniqueItems(text)}}
          value={this.state.selectedUserId}
        />
        <LazyloadListView
          enableEmptySections={true}
          style={styles.container}
          contentContainerStyle={styles.content}
          name="shareList"
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          scrollRenderAheadDistance={200}
          renderDistance={100}
          pageSize={1}
          initialListSize={10} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    height: 100,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E8E'
  },
  input: {
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  toolbar: {
    backgroundColor: '#FF6600',
    height: 56,
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
  nameText: {
    fontSize: 16,
    marginLeft: 15,
    marginTop: 25
  },
  image: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginTop: 10
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ShareWith);
