import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import {connect} from 'react-redux';

const mapStateToProps = (state) => {
  return {
    netStatus: state.netStatus
  };
};

class ConnectionState extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <View>
        {this.props.netStatus.isConnected ? (
          null
        ):(
          <View style={styles.connectionstatecontainer}>
            <View style={styles.navinner}>
              <Text style={styles.text}>Disconected from server...</Text>
            </View>
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  connectionstatecontainer: {
    backgroundColor: '#FBB552',
    height: 40
  },
  navinner: {
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16
  }
});

export default connect(mapStateToProps, null)(ConnectionState);
