import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  Platform,
  AsyncStorage,
  RTCAnimation
} from 'react-native';
import { Provider } from 'react-redux';
import configureStore from './src/store/configureStore'
import Lists from './src/components/ios/lists.ios';
import ViewItems from './src/components/ios/viewitems.ios';
import NewItem from './src/components/ios/newitem.ios';
import EditItem from './src/components/ios/edititem.ios';
import NewList from './src/components/ios/newlist.ios';
import Login from './src/components/login';
import AuthCheck from './src/components/ios/authcheck.ios';
import UserInfo from './src/components/userinfo';
import ShareOverview from './src/components/ios/shareoverview.ios';
import ShareList from './src/components/ios/sharelist.ios';
import ShareWith from './src/components/ios/sharewith.ios';
import Me from './src/components/ios/me.ios';
const store = configureStore();

export default class Laundrylists extends Component {

  constructor() {
    super();
  };

  renderScene(route, navigator) {
    switch(route.name) {
      case 'NewItem':
        return <NewItem navigator={navigator} {...route.passProps} />
      case 'NewItem':
        return <NewItem navigator={navigator} {...route.passProps} />
      case 'AuthCheck':
        return <AuthCheck navigator={navigator} />
      case 'Login':
        return <Login navigator={navigator} {...route.passProps} />
      case 'EditItem':
        return <EditItem navigator={navigator} {...route.passProps} />
      case 'NewList':
        return <NewList navigator={navigator} {...route.passProps} />
      case 'ViewItems':
        return <ViewItems navigator={navigator} {...route.passProps} />
      case 'Lists':
        return <Lists navigator={navigator} {...route.passProps} />
      case 'ShareOverview':
        return <ShareOverview navigator={navigator} {...route.passProps} />
      case 'ShareList':
        return <ShareList navigator={navigator} {...route.passProps} />
      case 'ShareWith':
        return <ShareWith navigator={navigator} {...route.passProps} />
      case 'Me':
        return <Me navigator={navigator} />
    }
  }

  render() {
    return (
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
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  nav: {
    flex: 1
  }
});

AppRegistry.registerComponent('Laundrylists', () => Laundrylists);
