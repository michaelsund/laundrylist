import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
import {connect} from 'react-redux';
import * as actions from '../actions';
import Icon from 'react-native-vector-icons/MaterialIcons';

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
};

class UserInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: ''
    };
  };

  componentWillReceiveProps(props) {
    if (props.user.picture) {
      this.setState({imageUrl: props.user.picture.data.url});
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={{uri: this.state.imageUrl}}
        />
        <Text style={styles.nameText}>
          {this.props.user.first_name + ' ' + this.props.user.last_name}
        </Text>
      </View>
    )
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    height:80,
    width: 80,
    borderRadius: 40,
    marginTop: 80
  },
  nameText: {
    marginTop: 5,
    color: '#9E9E9E'
  }
});
export default connect(mapStateToProps, null)(UserInfo);
