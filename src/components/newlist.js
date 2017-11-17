import Config from '../../server/serversettings.json';
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
  Navigator,
  Slider
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
      this.serverUrl = Config.dev + ':' + Config.devPort;
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

  _onBackClicked() {
    this.props.navigator.pop();
  }

  render() {
    return (
      <View style={styles.container}>
        <Icon.ToolbarAndroid
          style={styles.toolbar}
          title="New list"
          titleColor="white"
          navIconName="arrow-back"
          iconSize={26}
          onIconClicked={this._onBackClicked.bind(this)}
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
  toolbar: {
    backgroundColor: '#FF6600',
    height: 56,
    marginBottom: 20,
  },
  input: {
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    fontSize: 16
  },
  buttonContainer: {
    marginLeft: 10,
    marginRight: 10
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewList);
