/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SecureStore } from 'expo';
import RoomList from '../rooms_list';
import { amerKey, bagiKey } from '../keys';
import { Icon } from 'react-native-elements';

const Auth = bagiKey;
const bookRoom = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${Auth.API_KEY}`;

export default class FailureScreen extends Component {
  state = {
    nearByRooms: []
  }
  componentDidMount() {
    this.checkNearByRooms();
  }

  roomCategory = (room) => {
    let category = ['Blue', 'Red', 'Yellow', 'Green'];
    return category.find((i) => {
      return room.generatedResourceName.includes(i);
    });
  }

  checkNearByRooms = () => {
    const { navigation } = this.props;
    let status = navigation.getParam('status');
    let room = navigation.getParam('room') || {} ;
    console.log('Failed scenario', status, room);
    let currentRoom = RoomList.items.find((i) => i.resourceEmail === room.resourceEmail);
    let nearByRooms = RoomList.items.filter((i) =>
      (i.buildingId == currentRoom.buildingId)
      && (i.floorName == currentRoom.floorName)
      && (this.roomCategory(i) == this.roomCategory(currentRoom))
    );
    this.setState({
      nearByRooms: nearByRooms.map((i) => { i.status = false; return i })
    });
    console.log(nearByRooms, 'nearByRooms');
    this.requestForRooms(nearByRooms)
  }

  requestForRooms = (nearByRooms) => {
    let allPromises = nearByRooms.map((room) => {
      return this.checkRoom(room.resourceEmail);
    });
    Promise.all(allPromises).then((rooms) => {
      rooms = rooms.filter((room) => {
        console.log('Retured Room', room);
        return room.items.length == 0;
      }).map((i) => { i.status = true; return i; });
      this.setState({
        nearByRooms: rooms
      });
    });
  }

  checkRoom = async (room) => {
    let dateTime = new Date();
    let startTime = dateTime.toISOString();
    let minutes =  dateTime.getMinutes();
    if (minutes > 29) {
      dateTime.setHours(dateTime.getHours() + 1);
    } else {
      dateTime.setMinutes(dateTime.getMinutes() + 30);
    }
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

  bookRoom = async (item) => {
    console.log('Book this room', item);
    let { resourceEmail, generatedResourceName: location } = RoomList.items.find((i) => i.generatedResourceName == item.summary);
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
   return result
  }

  navigateToSuccessPage = async (item) => {
    let { resourceEmail, generatedResourceName } = RoomList.items.find((i) => i.generatedResourceName == item.summary);
    let bookedStatus = await this.bookRoom(item);
    console.log(bookedStatus, 'Create Room', '############');
    if (bookedStatus.status == 'confirmed') {
      this.props.navigation.navigate('success', {
        status: bookedStatus
      });
    } else {
      this.props.navigation.navigate('failure', {
        status: bookedStatus,
        room: { resourceEmail, generatedResourceName }
      });
    }
  }


  render() {
    const { navigation } = this.props;
    let status = navigation.getParam('status');
    let room = navigation.getParam('room') || {};

    let name;
    if (status) {
      name = status.items[0].organizer.displayName;
    }
    let { nearByRooms } = this.state;
    let emptyRooms = nearByRooms.length;

    let renderItem = ({ item }) => (
      <View style={styles.listItem}>
        <TouchableOpacity style={styles.listItemLink} onPress={() => { this.navigateToSuccessPage(item) }}>
          <Text>
            {item.resourceName || item.summary}
          </Text>
            <Icon
              size={20}
              name={item.status ? 'ios-checkmark-circle-outline' : 'md-close'}
              type={'ionicon'}
            />
        </TouchableOpacity>
      </View>
    );

    let showRooms = nearByRooms.length ? (
      <FlatList
        data={nearByRooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.resourceName || item.summary}
        style={styles.roomList}
      />): '';



    return (
      <View style={styles.container}>
        <Text style={styles.dangerText}>
          {`Oops Room ${room.generatedResourceName} is invaded by ${name} `}
        </Text>
        <Text style={styles.dangerText}>
          {nearByRooms.length ? `You have these rooms available for the next 60 minutes`: ``}
        </Text>

        {showRooms}
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
  listItem: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row'
  },
  listItemLink: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dangerText: {
    marginTop: 40,
    fontSize: 20,
    color: '#c31e1e',
    flexBasis: 70,
  },
  roomList: {
    flex: 1,
    width: '100%'
  }
});
