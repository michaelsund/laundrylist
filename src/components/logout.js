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
  AsyncStorage,
  Slider
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as FBSDK from 'react-native-fbsdk';

const mapDispatchToProps = (dispatch) => {
	return {
		onSetUser: (user) => dispatch(actions.setUser(user)),
    onDelUser: () => dispatch(actions.delUser())
	};
};


class Login extends Component {
  constructor(props) {
    super(props);
    this.serverUrl = '';
    if (Config.devMode) {
      this.serverUrl = Config.dev + ':' + Config.port;
    } else {
      this.serverUrl = Config.prod + ':' + Config.port;
    }
  };

  render() {
    return (
      <View>
        <Icon.ToolbarAndroid
          style={styles.toolbar}
          title="Logout"
          subtitleColor="white"
          titleColor="white"
          navIconName="menu"
          iconSize={26}
          onIconClicked={() => this.props.drawer.openDrawer()}
        />
        <View style={styles.container}>
          <View style={styles.contentFiller}></View>
          <View style={styles.content}>
            <FBSDK.LoginButton
              style={styles.fbButton}
              onLogoutFinished={() => {
                AsyncStorage.removeItem('@LaundrylistsStore:user');
                this.props.onDelUser();
                this.props.navigator.resetTo({name: 'Login'});
              }} />
          </View>
          <View style={styles.contentFiller}></View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 8,
    flexDirection: 'row'
  },
  fbButton: {
    marginTop: 200,
    height: 30
  },
  content: {
    flex: 4
  },
  contentFiller: {
    flex: 2
  },
  toolbar: {
    backgroundColor: '#FF6600',
    height: 56,
    marginBottom: 20
  }
});

export default connect(null, mapDispatchToProps)(Login);
