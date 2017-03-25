import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ConnectionState from './connectionstate.ios';

class NavigationBar extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <View style={styles.navcontainer}>
        <View style={styles.navinner}>
          <View style={styles.navleft}>
            {this.props.canPop ? (
              <Icon
                name="arrow-back"
                style={styles.icons}
                onPress={() => {this.props.navigator.pop()}}
              />
            ):(
              null
            )}
          </View>
          <View style={styles.navmid}>
            <Text style={styles.title}>{this.props.title}</Text>
          </View>
          <View style={styles.navright}>
            {this.props.canAdd ? (
              <Icon
                name="add"
                style={styles.icons}
                onPress={() => {this.props.addFunc()}}
              />
            ):(
              null
            )}
          </View>
        </View>
        <ConnectionState />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  navcontainer: {
    backgroundColor: '#FF6600',
    height: 70
  },
  navinner: {
    flex: 5,
    flexDirection: 'row',
    marginTop: 35,
    marginLeft: 20,
    marginRight: 20
  },
  navleft: {
    flex: 1,
    alignItems: 'flex-start'
  },
  navmid: {
    flex: 3,
    alignItems: 'center'
  },
  navright: {
    flex: 1,
    alignItems: 'flex-end'
  },
  icons: {
    color: '#FFFFFF',
    fontSize: 20
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16
  }
});

export default NavigationBar;
