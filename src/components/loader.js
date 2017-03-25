import React, {Component} from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

class Loader extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <View>
        {this.props.loading ? (
          <ActivityIndicator
            animating={this.props.loading}
            style={[styles.centering, {height: 80}]}
            size="large"
          />
        ): (null)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  }
});

export default Loader;
