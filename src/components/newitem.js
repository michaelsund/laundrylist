import Config from '../../server/serversettings.json';
import React, {Component} from 'react';
import {
  ListView,
  NetInfo,
  StyleSheet,
  Text,
  Button,
  TextInput,
  TouchableHighlight,
  View,
  Fetch,
  Navigator,
  Slider
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Icon from 'react-native-vector-icons/MaterialIcons';

const mapDispatchToProps = (dispatch) => {
  return {
    onAddItem: (itemObject, listId) => dispatch(actions.addItem(itemObject, listId)),
    onSetNetStatus: (isConnected, lastUpdated) => dispatch(actions.setNetStatus(isConnected, lastUpdated))
  };
};

class NewItem extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      suggesting: false,
      text: '',
      description: '',
      quantity: 1,
      dataSource: this.ds.cloneWithRows([])
    };
    this.serverUrl = '';
    if (Config.devMode) {
      this.serverUrl = Config.dev + ':' + Config.port;
    } else {
      this.serverUrl = Config.prod + ':' + Config.port;
    }
  };

  _onAddClicked() {
    if (this.state.text.length > 0) {
      fetch('http://' + this.serverUrl + '/api/newitem', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({listId: this.props.listId, name: this.state.text, quantity: this.state.quantity, description: this.state.description})
      }).then((response) => response.json()).then((responseData) => {
        this.props.onAddItem({name: this.state.text, quantity: this.state.quantity, description: this.state.description, picked: false, _id:responseData.itemId}, this.props.listId);
        this.props.navigator.pop();
      }).catch((error) => {
        this.props.onSetNetStatus(false, null);
        this.props.navigator.pop();
      }).done();
    }
  }

  _onBackClicked() {
    this.props.navigator.pop();
  }

  _searchUniqueItems(text) {
    this.setState({text: text});
    if (text.length > 0) {
      // Make searches non case sensitive
      const tmpUniqueItems = String.prototype.toLowerCase.apply(this.props.uniqueItems).split(",");
      const results = [];
      // Reset the search and result array, to not show the suggestion if words no longer match
      this.setState({
        suggesting: false,
        dataSource: this.state.dataSource.cloneWithRows([])
      });
      for (var i = 0; i < tmpUniqueItems.length; i++) {
        if (tmpUniqueItems[i].indexOf(text.toLowerCase()) == 0) {
          // We push the non lowercase items to the suggested array
          results.push(this.props.uniqueItems[i]);
        }
      }
      if (results.length > 0) {
        this.setState({
          suggesting: true,
          dataSource: this.state.dataSource.cloneWithRows(results)
        });
      }
    }
    else {
      this.setState({dataSource: this.ds.cloneWithRows([]), suggesting: false});
    }
  };

  render() {
    return (
      <View>
        <Icon.ToolbarAndroid
          style={styles.toolbar}
          title="New item"
          titleColor="white"
          navIconName="arrow-back"
          iconSize={26}
          onIconClicked={this._onBackClicked.bind(this)}
        />
        <View>
          <TextInput
            placeholder="Item name"
            style={styles.input}
            autoFocus={true}
            onChangeText={(text) => {this._searchUniqueItems(text)}}
            value={this.state.text} />
          <TextInput
            placeholder="A short description (not required)"
            style={styles.input}
            onChangeText={(desc) => { this.setState({description: desc}) }}
            value={this.state.description} />
          {this.state.suggesting ? (
            <View style={styles.fillerContainer}>
              <Icon name="cancel" style={styles.cancel} onPress={() => {this.setState({dataSource: this.ds.cloneWithRows([]), suggesting: false})}} />
            </View>
          ) : (
            null
          )}
          {this.state.suggesting ? (
            null
          ) : (
            <View style={styles.buttonContainer}>
              <Text style={styles.quantity}>x{this.state.quantity}</Text>
              <Slider style={styles.slider} onValueChange={(quantity) => this.setState({quantity: quantity})} value={this.state.quantity} step={1} minimumValue={1} maximumValue={10}/>
              <Button title="Add" onPress={() => {this._onAddClicked()}} />
            </View>
          )}
        </View>
        <ListView
          dataSource={this.state.dataSource}
          style={styles.listView}
          renderRow={(rowData) =>
            <View>
              <TouchableHighlight
                style={styles.listItem}
                onPress={() => {
                  this.setState({text: rowData, dataSource: this.ds.cloneWithRows([]), suggesting: false});
                }}>
                <Text style={styles.itemText}>{rowData}</Text>
              </TouchableHighlight>
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
    flexDirection: 'row'
  },
  toolbar: {
    backgroundColor: '#FF6600',
    height: 56,
    marginBottom: 20
  },
  slider: {
    marginBottom: 20
  },
  quantity: {
    fontSize: 30,
    textAlign: 'center'
  },
  input: {
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    fontSize: 16,
  },
  buttonContainer: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 30
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
  itemText: {
    marginTop: 15,
    marginLeft: 16,
    marginRight: 10,
    fontSize: 16,
  },
  listItem: {
    height: 50
  },
  fillerContainer: {
    flexDirection: 'row',
    flex: 6
  },
  cancel: {
    fontSize: 26,
    height: 50,
    color: '#9E9E9E',
    textAlign: 'right',
    marginRight: 20,
    marginTop: 20,
    flex: 1,
  },
  listView: {
    marginTop: 50
  }
});

export default connect(null, mapDispatchToProps)(NewItem);
