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
import SuccessScreen from './screens/success';
import FailureScreen from './screens/failure';
import QrScreen from './screens/qr'

const AppNavigator = createStackNavigator(
  {
    login: LoginScreen,
    scanner: ScannerScreen,
    success: SuccessScreen,
    failure: FailureScreen,
    qr: QrScreen
  },
  {
    initialRouteName: 'success',
    headerMode: 'none'
  }
);

export default AppNavigator;
