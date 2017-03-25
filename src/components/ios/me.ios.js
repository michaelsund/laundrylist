import React, {Component} from 'react';
import {
  ListView,
  NetInfo,
  StyleSheet,
  Text,
  View,
  Image,
  AsyncStorage
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../../actions';
import * as FBSDK from 'react-native-fbsdk';
import UserInfo from '../userinfo';
import MenuBar from './menubar.ios';
import NavigationBar from './navigationbar.ios';

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
};

const mapDispatchToProps = (dispatch) => {
	return {
    onDelUser: () => dispatch(actions.delUser())
	};
};

class Me extends Component {
  constructor(props) {
    super(props);
  };

  // componentWillReceiveProps(props) {
  //   if (props.user.picture) {
  //     this.setState({imageUrl: props.user.picture.data.url});
  //   }
  // };

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar
          canPop={false}
          canAdd={false}
          title="Me"
        />
        <View style={styles.wrapper}>
          <View style={styles.userinfo}>
            <Image
              style={styles.image}
              source={{uri: this.props.user.picture.data.url}}
            />
            <Text style={styles.nameText}>
              {this.props.user.first_name + ' ' + this.props.user.last_name}
            </Text>
          </View>
          <View style={styles.buttoncontainer}>
            <FBSDK.LoginButton
              style={styles.fbButton}
              onLogoutFinished={() => {
                AsyncStorage.removeItem('@LaundrylistsStore:user');
                this.props.onDelUser();
                this.props.navigator.resetTo({name: 'Login'});
              }} />
          </View>
        </View>
        <MenuBar
          navigator={this.props.navigator}
          activeTab={2}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  wrapper: {
    marginTop: 40,
    alignItems: 'center'
  },
  userinfo: {
    marginTop: 40
  },
  fbButton: {
    height: 30,
    width: 200
  },
  buttoncontainer: {
    alignItems: 'center',
    marginTop: 100
  },
  image: {
    height:80,
    width: 80,
    borderRadius: 40
  },
  nameText: {
    marginTop: 5,
    color: '#9E9E9E'
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Me);
