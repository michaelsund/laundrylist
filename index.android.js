import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  Platform,
  ToolbarAndroid,
  AsyncStorage,
  DrawerLayoutAndroid,
  TouchableHighlight
} from 'react-native';
import { Provider } from 'react-redux';
import configureStore from './src/store/configureStore'
import Lists from './src/components/lists';
import ViewItems from './src/components/viewitems';
import NewItem from './src/components/newitem';
import EditItem from './src/components/edititem';
import NewList from './src/components/newlist';
import Login from './src/components/login';
import AuthCheck from './src/components/authcheck';
import Logout from './src/components/logout';
import UserInfo from './src/components/userinfo';
import ShareOverview from './src/components/shareoverview';
import ShareList from './src/components/sharelist';
import ShareWith from './src/components/sharewith';
const store = configureStore();

export default class Laundrylists extends Component {

  constructor() {
    super();
  };

  _menuNavigation(route, navigator) {
    // Compare route to current route, and dont navigate if same
    const curRoutes = navigator.getCurrentRoutes();
    const stackSize = curRoutes.length;
    if (curRoutes[stackSize - 1].name !== route.name) {
      navigator.resetTo(route);
    }
    this.refs.DRAWER.closeDrawer();
  }

  renderScene(route, navigator) {
    switch(route.name) {
      case 'NewItem':
        return <NewItem navigator={navigator} {...route.passProps} drawer={this.refs.DRAWER} />
      case 'NewItem':
        return <NewItem navigator={navigator} {...route.passProps} drawer={this.refs.DRAWER} />
      case 'AuthCheck':
        return <AuthCheck navigator={navigator} />
      case 'Login':
        return <Login navigator={navigator} {...route.passProps} />
      case 'Logout':
        return <Logout navigator={navigator} {...route.passProps} drawer={this.refs.DRAWER} />
      case 'EditItem':
        return <EditItem navigator={navigator} {...route.passProps} drawer={this.refs.DRAWER} />
      case 'NewList':
        return <NewList navigator={navigator} {...route.passProps} drawer={this.refs.DRAWER} />
      case 'ViewItems':
        return <ViewItems navigator={navigator} {...route.passProps} drawer={this.refs.DRAWER} />
      case 'Lists':
        return <Lists navigator={navigator} {...route.passProps} drawer={this.refs.DRAWER} />
      case 'ShareOverview':
        return <ShareOverview navigator={navigator} {...route.passProps} drawer={this.refs.DRAWER} />
      case 'ShareList':
        return <ShareList navigator={navigator} {...route.passProps} drawer={this.refs.DRAWER} />
      case 'ShareWith':
        return <ShareWith navigator={navigator} {...route.passProps} drawer={this.refs.DRAWER} />
    }
  }

  _drawerView() {
    return (
      <View style={styles.drawer}>
        <UserInfo style={styles.userInfo} store={store} />
        <View style={styles.menuItems}>
          <TouchableHighlight
            underlayColor={'#FFFFFF'}
            style={styles.menuButton}
            onPress={this._menuNavigation.bind(this, {name: 'Lists'}, this.refs.NAV)}>
            <Text
              style={styles.menuButtonTxt}>
              My lists
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={'#FFFFFF'}
            style={styles.menuButton}
            onPress={this._menuNavigation.bind(this, {name: 'ShareOverview'}, this.refs.NAV)}>
            <Text
              style={styles.menuButtonTxt}>
              Shared lists
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={'#FFFFFF'}
            style={styles.menuButton}
            onPress={this._menuNavigation.bind(this, {name: 'Logout'}, this.refs.NAV)}>
            <Text
              style={styles.menuButtonTxt}>
              Logout
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  };

  render() {
    return (
      <DrawerLayoutAndroid
        ref={'DRAWER'}
        drawerWidth={250}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={() => this._drawerView()}>
        <Provider store={store}>
          <View style={styles.container}>
            <Navigator
              ref={'NAV'}
              initialRoute={{name: 'AuthCheck'}}
              renderScene={(this.renderScene.bind(this))}
              configureScene={(route, routeStack) =>
                Navigator.SceneConfigs.FloatFromBottomAndroid} />
          </View>
        </Provider>
      </DrawerLayoutAndroid>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  menuButtonTxt: {
    fontSize: 16,
    marginLeft: 20
  },
  menuButton: {
    height: 70,
  },
  drawer: {
    backgroundColor: '#FFFFFF',
    flex: 10,
    flexDirection: 'column'
  },
  menuItems: {
    flex: 9,
    flexDirection: 'column',
    marginTop: 120
  },
  userInfo: {
    flex: 1
  }
});

AppRegistry.registerComponent('Laundrylists', () => Laundrylists);
