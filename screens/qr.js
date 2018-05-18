/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default class QrScreen extends Component {
  render() {
    const { navigation } = this.props;
    let data = navigation.getParam('data');
    console.log(data, typeof data, JSON.parse(`${data}`));
    data = JSON.parse(data);
    console.log(data);
    return (
      <View style={styles.container}>
        <Text>{data.resourceEmail}</Text>
        <Text>{data.resourceName}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});
