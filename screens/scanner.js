/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { BarCodeScanner, Camera, Permissions, SecureStore, GLView } from 'expo';
import { Icon } from 'react-native-elements';
import { amerKey, bagiKey } from '../keys';
import RoomList from '../rooms_list';

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
   // this.setState({
   //   showStatus: true,
   //   roomAvailable: true || createdRoom.responseStatus == 'accepted'
   // });
   // this._handleBarCodeRead("freshworks.com_2d3133323233393936323338@resource.calendar.google.com");
  }

  delay = (time) => {
    return new Promise(function(resolve, reject) {
      setTimeout(() => resolve(), time);
    });
  }

  _handleBarCodeRead = async ({ data }) => {
    if (!this.state.stopScanning) {
      this.setState({stopScanning: true});
      console.log(data);
      let status = await this.checkRoom(data);
      console.log(status, 'CheckRoom', '****');
      if (status.error) {

      } else {
        let sample = RoomList.items.find((i) => i.resourceEmail == data);
        console.log(sample);
        let {generatedResourceName} = sample;
        console.log(generatedResourceName);
        if (status && status.items.length == 0) {
          let bookedStatus = await this.createRoom(data, generatedResourceName);
          console.log(bookedStatus, 'Create Room', '############');
          if (bookedStatus.status == 'confirmed') {
            this.props.navigation.navigate('success', {
              status: bookedStatus
            });
          } else {
            this.props.navigation.navigate('failure', {
              status: bookedStatus,
              room: { resourceEmail: data, generatedResourceName }
            });
          }

        } else {
          this.props.navigation.navigate('failure', {
            status,
            room: { resourceEmail: data, generatedResourceName }
          });
        }
      }
    }
  }

  checkRoom = async (room) => {
    // room = JSON.parse(room);
    // console.log('checkRoom', room, typeof room, room['resourceEmail'], room.resourceEmail, 'end');
    let dateTime = new Date();
    let startTime = dateTime.toISOString();
    dateTime.setHours(dateTime.getHours() + 1);
    let endTime = dateTime.toISOString();
    let params = {
      key: encodeURIComponent(Auth.API_KEY),
      timeMin: encodeURIComponent(startTime),
      timeMax: encodeURIComponent(endTime)
    };
    let calendarId = encodeURIComponent(room);
    let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${params.key}&timeMin=${params.timeMin}&timeMax=${params.timeMax}`;
    let accessToken = await SecureStore.getItemAsync('accessToken');
    console.log(url, accessToken);
    let result = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
    });
    let status = await result.json();
    return status;
  }

  createRoom = async (resourceEmail, location) => {
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
           email: resourceEmail,
           resource: true
         }, {
           email: user.email
         }
       ],
       location
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
    const { hasCameraPermission, roomAvailable, showStatus, stopScanning } = this.state;
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
          <Camera
            type={Camera.Constants.Type.back}
            onBarCodeRead={(data) => { !stopScanning && this._handleBarCodeRead(data); }}
            style={styles.barCodeScanner}>
            {showActions}
          </Camera>
          {/* <BarCodeScanner
            onBarCodeRead={this._handleBarCodeRead}
            style={styles.barCodeScanner}>
            {showActions}
          </BarCodeScanner> */}
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
