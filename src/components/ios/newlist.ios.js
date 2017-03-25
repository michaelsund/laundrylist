import Config from '../../../server/serversettings.json';
import React, { Component } from 'react';
import {
  ListView,
  NetInfo,
  StyleSheet,
  Text,
  Button,
  TextInput,
  View,
  Fetch,
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationBar from './navigationbar.ios';

const mapDispatchToProps = (dispatch) => {
	return {
		onAddList: (list) => dispatch(actions.addList(list)),
    onSetNetStatus: (isConnected, lastUpdated) => dispatch(actions.setNetStatus(isConnected, lastUpdated))
	};
};

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
};

class NewList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
    this.serverUrl = '';
    if (Config.devMode) {
      this.serverUrl = Config.dev + ':' + Config.port;
    }
    else {
      this.serverUrl = Config.prod + ':' + Config.port;
    }
  };

  _onAddClicked() {
    if (this.state.text.length > 0) {
      var listName = this.state.text[0].toUpperCase() + this.state.text.substr(1);
      fetch('http://' + this.serverUrl + '/api/newlist', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({listName: listName, userId: this.props.user.id})
      }).then((response) => response.json()).then((responseData) => {
        console.log(responseData);
        this.props.onAddList(responseData);
        this.props.navigator.pop();
      })
      .catch((error) => {
        this.props.onSetNetStatus(false, null);
        this.props.navigator.pop();
      })
      .done();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar
          canPop={true}
          canAdd={false}
          title="New list"
          navigator={this.props.navigator}
        />
        <TextInput
          placeholder="My shiny little list"
          autoFocus={true}
          style={styles.input}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
        />
        <View style={styles.buttonContainer}>
          <Button
            title="Add"
            onPress={this._onAddClicked.bind(this)} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  input: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 20,
    height: 40,
    fontSize: 16
  },
  buttonContainer: {
    marginLeft: 10,
    marginRight: 10
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewList);
