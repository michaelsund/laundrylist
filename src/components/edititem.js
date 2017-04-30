import Config from '../../server/serversettings.json';
import React, {Component} from 'react';
import {
  ListView,
  NetInfo,
  StyleSheet,
  Text,
  Button,
  TextInput,
  View,
  Fetch,
  BackAndroid,
  Navigator,
  Slider
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Icon from 'react-native-vector-icons/MaterialIcons';

const mapDispatchToProps = (dispatch) => {
  return {
    onEditItem: (item) => dispatch(actions.editItem(item)),
    onSetNetStatus: (isConnected, lastUpdated) => dispatch(actions.setNetStatus(isConnected, lastUpdated))
  };
};

class EditItem extends Component {
  constructor(props) {
    super(props);
    console.log(this.props.data);
    this.state = {
      text: this.props.data.name,
      description: this.props.data.description,
      quantity: this.props.data.quantity
    };
    this.serverUrl = '';
    if (Config.devMode) {
      this.serverUrl = Config.dev + ':' + Config.port;
    } else {
      this.serverUrl = Config.prod + ':' + Config.port;
    }
  };

  _onEditDoneClicked() {
    if (this.state.text.length > 0) {
      // if (this.state.description.length <= 0) {
      //   this.state.description = undefined;
      // }
      fetch('http://' + this.serverUrl + '/api/edititem', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({listId: this.props.listId, name: this.state.text, quantity: this.state.quantity, description: this.state.description, itemId: this.props.data._id})
      }).then((response) => response.json()).then((responseData) => {
        this.props.onEditItem({
          name: this.state.text,
          description: this.state.description,
          quantity: this.state.quantity,
          itemIndex: parseInt(this.props.index)
        });
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

  render() {
    return (
      <View>
        <Icon.ToolbarAndroid style={styles.toolbar} title="Edit" titleColor="white" navIconName="arrow-back" iconSize={26} onIconClicked={this._onBackClicked.bind(this)}/>
        <TextInput placeholder="Item name" style={styles.input} autoFocus={true} onChangeText={(text) => this.setState({text})} value={this.state.text}/>
        <TextInput placeholder="A short description (not required)" style={styles.input} onChangeText={(description) => this.setState({description})} value={this.state.description}/>
        <View>
          <Text style={styles.quantity}>x{this.state.quantity}</Text>
          <Slider style={styles.slider} onValueChange={(quantity) => this.setState({quantity: quantity})} value={this.state.quantity} step={1} minimumValue={1} maximumValue={10}/>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Ok" onPress={this._onEditDoneClicked.bind(this)}/>
        </View>
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
    flex: 1,
    height: 30,
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
    fontSize: 16
  },
  buttonContainer: {
    marginLeft: 10,
    marginRight: 10
  }
});

export default connect(null, mapDispatchToProps)(EditItem);
