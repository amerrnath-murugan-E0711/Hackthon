/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { BarCodeScanner, Permissions, SecureStore, GLView } from 'expo';
import { Icon } from 'react-native-elements';
import { amerKey, bagiKey } from '../keys';

const Auth = bagiKey;

const bookRoom = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${Auth.API_KEY}`;

export default class Scanner extends Component {
  state = {
    hasCameraPermission: null,
    showStatus: false,
    stopScanning: false,
    roomAvailable: false
  }
  async componentWillMount() {
   const { status } = await Permissions.askAsync(Permissions.CAMERA);
   this.setState({hasCameraPermission: status === 'granted'});
   // let data = await this.createRoom({"resourceEmail":"freshworks.com_2d3133323233393936323338@resource.calendar.google.com","resourceName":"London - Strand (2)"});
   // let roomStatus = await this.checkRoom(data).then((res) => {
   //   return res.json();
   // });
   // let createdRoom = roomStatus.attendees.filter((i) => i.resource = true);
   // this.setState({
   //   showStatus: true,
   //   roomAvailable: createdRoom.responseStatus == 'accepted'
   // });
   // console.log(data);
   this.setState({
     showStatus: true,
     roomAvailable: true || createdRoom.responseStatus == 'accepted'
   });
  }

  _handleBarCodeRead = async ({ data }) => {

    if (!this.state.stopScanning) {
      this.setState({stopScanning: true});
      console.log(data);
      let room = await this.createRoom(JSON.parse(data));
      console.log(room);
      let status = await this.checkRoom(room);
      let createdRoom = status.attendees.findBy('resource', true);
      this.setState({
        showStatus: true,
        roomAvailable: createdRoom.responseStatus == 'accepted'
      });
    }
  }

  checkRoom = async (room) => {
    const roomStatus = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${room.id}?key=${Auth.API_KEY}`;
    let accessToken = await SecureStore.getItemAsync('accessToken');
    return await fetch(roomStatus, {
      headers: { Authorization: `Bearer ${accessToken}`},
      'content-type': 'application/json'
    });
  }

  createRoom = async (data) => {
    let user = await SecureStore.getItemAsync('user');
    let accessToken = await SecureStore.getItemAsync('accessToken');
    user = JSON.parse(user);
    let dateTime = new Date();
    let startTime = dateTime.toISOString();
    dateTime.setHours(dateTime.getHours() + 1);
    let endTime = dateTime.toISOString();
    let bookRoomData = {
       summary: `Invaded by ${user.name}`,
       'start': {
        'dateTime': startTime,
      },
      'end': {
        'dateTime': endTime
      },
       'attendees': [
         {
           email: data.resourceEmail,
           resource: true
         }, {
           email: user.email
         }
       ],
       'location': data.resourceName
    };
    console.log(bookRoom, bookRoomData, accessToken);
    let res = await fetch(bookRoom, {
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }),
     method: 'POST',
     body: JSON.stringify(bookRoomData)
   });
   let result = await res.json();
   return result;
  }

  invade = () => {

  }

  conquerNext = () => {

  }


  render() {
    const { hasCameraPermission, roomAvailable, showStatus } = this.state;

    let showActions = showStatus && (
      <View style={styles.action}>
        <Icon color='red' size={60} type='entypo' name='aircraft-landing' onPress={this.invade}/>
        <Icon color='red' size={60} type='entypo' name='aircraft-take-off' onPress={this.conquerNext}/>
      </View>
    );

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          {/* <View style={styles.barCodeScanner}>
            {showActions}
          </View> */}
          <BarCodeScanner
            onBarCodeRead={this._handleBarCodeRead}
            style={styles.barCodeScanner}>
            {showActions}
          </BarCodeScanner>
        </View>
      );
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  barCodeScanner: {
    flex: 1,
    backgroundColor: 'white'
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  }
});
