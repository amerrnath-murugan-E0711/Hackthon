/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SocialIcon } from 'react-native-elements';
import { Google, SecureStore } from 'expo';
import { amerKey, bagiKey } from '../keys';

const Auth = bagiKey;

const rooms = `https://calendarsuggest.clients6.google.com/v2/rooms:suggest?alt=protojson&key=${Auth.API_KEY}`;
const query = encodeURIComponent(`show_unavailable=false`);
const gsuite = `https://www.googleapis.com/admin/directory/v1/customer/my_customer/resources/calendars?alt=json&quotaUser=${Auth.API_KEY}&query=${query}`;
const body = {
	"single_time": {
		"start_time": {
			"seconds": "1526508000"
		},
		"end_time": {
			"seconds": "1526511600"
		},
		"all_day": false
	},
	"attendees": [{
		"email": "amerrnath.murugan@freshworks.com",
		"organizer": true
	}],
	"user_context": {
		"locale": "en",
		"timezone": "Asia/Calcutta"
	},
	"recommendations_params": {
		"max_suggestions": 5,
		"smart_restrict_max": true
	},
	"listing_params": {
		"prefer_hierarchy": true,
		"max_results_per_page": 50,
		"show_unavailable": false
	},
	"event_reference": "6udjie6q7rqbcevi4a9ftvjcob"
};

export default class Login extends Component {
  login = async () => {
    let accessToken = await Expo.SecureStore.getItemAsync('accessToken');
    let user = await Expo.SecureStore.getItemAsync('user');
    if (accessToken && user) {
      this.props.navigation.navigate('scanner');
    } else {
      let result = await this.googleAuth();
      result.type == 'success' && this.props.navigation.navigate('scanner');
    }
  }

  googleAuth = async () => {
    const options = {
      behavior: 'web',
      scopes: ['profile', 'email',
        'https://www.googleapis.com/auth/admin.directory.resource.calendar',
        'https://www.googleapis.com/auth/admin.directory.resource.calendar.readonly',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.readonly'
      ],
      androidClientId: Auth.ANDROID_KEY,
      iosClientId: Auth.IOS_KEY
    };
    let result = await Google.logInAsync(options);
    if (result.type == 'success') {
      console.log(result);
      await SecureStore.setItemAsync('accessToken', result.accessToken);
      await SecureStore.setItemAsync('user', JSON.stringify(result.user));
      // await this.fetchCalendar(result.accessToken)
    } else {
      console.log(result);
    }
    return result;
  }

  fetchCalendar = async (accessToken) => {
    let userInfoResponse = await fetch(gsuite, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }).then(response => {
      console.log(response);
      return response.json();
    }).catch(e => {
      console.log(e);
    });
    console.log(userInfoResponse);
  }

  render() {
    return (
      <View style={styles.container}>
        <SocialIcon
          button
          type='google-plus-official'
          style={styles.googleBtn}
          title='Sign in with Google'
          onPress={this.login}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  googleBtn: {
    flexBasis: '50%'
  }
});
