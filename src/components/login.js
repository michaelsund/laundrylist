import Config from '../../server/serversettings.json';
import PackageInfo from '../../package.json';
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
  BackAndroid,
  Navigator,
  Slider,
  AsyncStorage,
  Image
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../actions';
// import Icon from 'react-native-vector-icons/MaterialIcons';
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

  _saveUserOnServer(user) {
    console.log('_saveUserOnServer got: ' + JSON.stringify(user));
    fetch('http://' + this.serverUrl + '/api/newuser',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: user.first_name,
        lastName: user.last_name,
        id: user.id,
        picture: user.picture.data.url
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      // TODO: handle response
    })
    .catch((error) => {
      // TODO: handle response
    })
    .done();
  };

  _getUserInfo(token) {
    console.log('TOKEN ' + JSON.stringify(token));
    fetch('https://graph.facebook.com/me?access_token=' + token.toString() + '&fields=first_name,last_name,picture.type(large)')
    .then((response) => response.json())
    .then((data) => {
      console.log('USERINFO: ' + JSON.stringify(data));
      this._saveUserOnServer(data);
      AsyncStorage.setItem('@LaundrylistsStore:user', JSON.stringify(data));
      this.props.onSetUser(data);
      this.props.navigator.resetTo({name: 'Lists'});
    })
    .catch((error) => {
      console.log('GRAPH POST ERROR: ' + JSON.stringify(error));
    })
    .done();
  }

  componentDidMount() {
    AsyncStorage.getItem('@LaundrylistsStore:user').then((user) => {
      const storedUserObject = JSON.parse(user);
      // Check if the object stored exists, and has the id property, in case faulty data is set.
      if (storedUserObject !== null && storedUserObject.id) {
        this.props.onSetUser(JSON.parse(user));
        // If user is found, continue to the application.
        this.props.navigator.resetTo({name: 'Lists'});
      }
    })
    .done();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
        <Image
          style={styles.logo}
          source={require('../img/LL-inverted.png')}
        />
        <Text style={styles.desctext}>Laundry lists</Text>
        <Text style={styles.versiontext}>v{PackageInfo.version}</Text>
        <FBSDK.LoginButton
          style={styles.fbButton}
          publishPermissions={["publish_actions"]}
          onLoginFinished={
            (error, result) => {
              if (error) {
                console.log('login has error: ', result.error)
              } else if (result.isCancelled) {
                console.log('login is cancelled.')
              } else {
                console.log('logging in');
                FBSDK.AccessToken.getCurrentAccessToken().then((data) => {
                  console.log('DATA ' + JSON.stringify(data));
                  this._getUserInfo(data.accessToken);
                })
              }
            }
          }
          onLogoutFinished={() => {
            AsyncStorage.removeItem('@LaundrylistsStore:user');
            this.props.onDelUser();
            this.props.navigator.resetTo({name: 'Login'});
          }}
        />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF6600'
  },
  fbButton: {
    marginTop: 40,
    width: 300,
    height: 30
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  versiontext: {
    color: '#FFFFFF',
    fontSize: 16
  },
  desctext: {
    color: '#FFFFFF',
    fontSize: 24
  },
  logo: {
    height: 144,
    width: 144
  }
});

export default connect(null, mapDispatchToProps)(Login);
