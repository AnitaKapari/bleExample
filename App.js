/**
 * Sample BLE React Native App
 *
 * @format
 * @flow strict-local
 */

import React, {
  useState,
  useEffect,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from 'react-native';


import BleList from './screens/BleList'

export default App = () => {

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
         <BleList/>
        </SafeAreaView>
      </>
    );
  };

  const styles = StyleSheet.create({
   });
