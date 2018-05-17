import React, { Component } from 'react';
import {
  Alert,
  Linking,
  Dimensions,
  LayoutAnimation,
  Text,
  View,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BarCodeScanner, Permissions, Google } from 'expo';
import { SafeAreaView, createStackNavigator } from 'react-navigation';
import LoginScreen from './screens/login';
import ScannerScreen from './screens/scanner'
import ArScreen from './screens/ar';

const AppNavigator = createStackNavigator(
  {
    login: ArScreen,
    scanner: ScannerScreen
  },
  {
    initialRouteName: 'login',
    headerMode: 'none'
  }
);

export default AppNavigator;
