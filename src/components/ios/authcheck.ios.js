import Config from '../../../server/serversettings.json';
import React, {Component} from 'react';
import {
  AsyncStorage
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../../actions';

const mapDispatchToProps = (dispatch) => {
	return {
		onSetUser: (user) => dispatch(actions.setUser(user))
	};
};


class AuthCheck extends Component {
  constructor(props) {
    super(props);
    this.serverUrl = '';
    this.state = {
      isLoggedIn: true
    };
    if (Config.devMode) {
      this.serverUrl = Config.dev + ':' + Config.port;
    } else {
      this.serverUrl = Config.prod + ':' + Config.port;
    }
  };

  componentDidMount() {
    AsyncStorage.getItem('@LaundrylistsStore:user').then((user) => {
      const storedUserObject = JSON.parse(user);
      // Check if the object stored exists, and has the id property, in case faulty data is set.
      if (storedUserObject !== null && storedUserObject.id) {
        this.props.onSetUser(JSON.parse(user));
        // If user is found, continue to the application.
        this.props.navigator.resetTo({
          name: 'Lists'
        });
      }
      else {
        this.props.navigator.resetTo({
          name: 'Login'
        });
      }
    })
    .done();
  }

  render() {
    return null;
  };
};

export default connect(null, mapDispatchToProps)(AuthCheck);
