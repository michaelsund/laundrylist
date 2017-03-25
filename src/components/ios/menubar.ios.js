import React, {Component} from 'react';
import {
  NetInfo,
  StyleSheet,
  Text,
  View,
  TabBarIOS
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

class MenuBar extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <View style={styles.container}>
        <TabBarIOS tintColor="#000000">
          <Icon.TabBarItem
            title="My lists"
            iconName="home"
            selected={this.props.activeTab === 0}
            selectedIconName="home"
            onPress={() => {
              this.props.navigator.resetTo({
                name: 'Lists'
              });
              this.setState({activeTab: 'My lists'});
            }}
            >
            <View>
              {/* <Text>My lists</Text> */}
            </View>
          </Icon.TabBarItem>
          <Icon.TabBarItem
            title="Shared lists"
            iconName="share"
            selected={this.props.activeTab === 1}
            selectedIconName="share"
            onPress={() => {
              this.props.navigator.resetTo({
                name: 'ShareOverview'
              });
              this.setState({activeTab: 'Shared lists'});
            }}
            >
            <View>
              {/* <Text>Shared lists</Text> */}
            </View>
          </Icon.TabBarItem>
          <Icon.TabBarItem
            title="Me"
            iconName="person"
            selected={this.props.activeTab === 2}
            selectedIconName="person"
            onPress={() => {
              this.props.navigator.resetTo({
                name: 'Me'
              });
              this.setState({activeTab: 'Me'});
            }}
            >
            <View>
              {/* <Text>Me</Text> */}
            </View>
          </Icon.TabBarItem>
        </TabBarIOS>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default MenuBar;
