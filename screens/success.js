/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Button } from 'react-native-elements';
import { DangerZone } from 'expo';
const { Lottie } = DangerZone;


export default class SuccessScreen extends Component {
  state = {
   animation: null,
 };

 componentDidMount() {
   this.animation.play();
  }

  render() {
    const { navigation } = this.props;
    let status = navigation.getParam('status') || {};
    console.log(status, 'success');
    return (
      <View style={styles.container}>
        <Lottie
          ref={animation => { this.animation = animation; }}
          style={{
            width: 400,
            height: 400,
            flex: 1,
            backgroundColor: '#eee',
          }}
          loop={false}
          source={require('../assets/animation-w320-h320.json')}
        />
        <Text style={styles.successMessage}>
          {`You have invaded the Room ${status.location}`}
        </Text>
        <Button
          large
          icon={{ name: 'target', type: 'simple-line-icon'}}
          title='Next target'
          backgroundColor="#2089dc"
          color="#fff"
          onPress={() => this.props.navigation.navigate('scanner')}
         />
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
  successMessage: {
    color: 'rgb(0,202,113)',
    fontSize: 20,
    marginBottom: 20,
    height: 40
  }
});
