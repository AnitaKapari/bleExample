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
  ScrollView,
  View,
  Text,
  Modal,
  ToastAndroid,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Button,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  Dimensions,
  Image,
  ImageBackground
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import  FontAwesome from 'react-native-vector-icons/FontAwesome';

import BleManager from '../util/BleManager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const { width } = Dimensions.get("window");

export default BleList = () => {
  const [isScanning, setIsScanning] = useState(false);
  const peripherals = new Map();
  const [list, setList] = useState([]);
  const image = { uri: "https://reactjs.org/logo-og.png" };

  // This is to manage Modal State
  const [isModalVisible, setModalVisible] = useState(false);

  // This is to manage TextInput State
  const [inputValue, setInputValue] = useState("");

  // Create toggleModalVisibility function that will
  // Open and close modal upon button clicks.
  const toggleModalVisibility = () => {
    setModalVisible(!isModalVisible);
  };
  const ItemDivider = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#607D8B",
        }}
      />
    );
  }
  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 3, true).then((results) => {
        ToastAndroid.show(
          "Scanning...",
          ToastAndroid.SHORT,
        );
        setIsScanning(true);
        if (!isScanning) {
          toggleModalVisibility()
        }
      }).catch(err => {
        console.log("error", err);
        ToastAndroid.show(
          "error" + err,
          ToastAndroid.SHORT,
        );
      });
    }
  }

  const handleStopScan = () => {
    console.log('Scan is stopped');
    ToastAndroid.show(
      "Scan is stopped",
      ToastAndroid.SHORT,
    );
    setIsScanning(false);
  }



  const handleUpdateValueForCharacteristic = (data) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  const retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length == 0) {
        console.log('No connected peripherals')
        ToastAndroid.show(
          "No connected peripherals",
          ToastAndroid.SHORT,
        );
      }
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
    });
  }

  const handleDiscoverPeripheral = (peripheral) => {
    console.log('Got ble peripheral', peripheral);
    // ToastAndroid.show(
    //   "Got ble peripheral",
    //   ToastAndroid.SHORT,
    // );
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    setList(Array.from(peripherals.values()));
  }

  const testPeripheral = (peripheral) => {
    if (peripheral) {
      ToastAndroid.show(
        "Wait for connect Ble....",
        ToastAndroid.LONG,
      );
     
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
        
      } else {
        BleManager.connect(peripheral.id).then(() => {
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            setList(Array.from(peripherals.values()));
          }
          console.log('Connected to ' + peripheral.id);
          ToastAndroid.show(
            "Connected....",
            ToastAndroid.SHORT,
          );
          setTimeout(() => {
            /* Test read current RSSI value */
            BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
              console.log('Retrieved peripheral services', peripheralData);

              BleManager.readRSSI(peripheral.id).then((rssi) => {
                console.log('Retrieved actual RSSI value', rssi);
                let p = peripherals.get(peripheral.id);
                if (p) {
                  p.rssi = rssi;
                  peripherals.set(peripheral.id, p);
                  setList(Array.from(peripherals.values()));
                }
              });
            });
          }, 200);
        }).catch((error) => {
          ToastAndroid.show(
            "Connection error" + error,
            ToastAndroid.LONG,
          );
          toggleModalVisibility()
        });
      }
    }
  } 

  const handleDisconnectedPeripheral = (data) => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
     alert("Disconnected from this Device " + data.peripheral)
  }
  useEffect(() => {
    BleManager.start({ showAlert: false });

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }

    return (() => {
      console.log('unmount');
      bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
      bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
      bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
      bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
    })
  }, []);

  const renderItem = (item) => {
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableHighlight onPress={() => testPeripheral(item)}>
        <View style={[styles.row, { backgroundColor: color }]}>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 5 }}>{item.name}</Text>
          <Text style={{ fontSize: 10, textAlign: 'center', color: '#333333', padding: 2 }}>RSSI: {item.rssi}</Text>
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20 }}>{item.id}</Text>
          {/* <View style={{
                height: 1,
                width: width * 0.8,
                backgroundColor: "grey",
                marginBottom:5
              }}></View>*/}
        </View>
      </TouchableHighlight>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>

            <View style={{ margin: 10 }}>
              <Button
                title={'Scan Bluetooth (' + (isScanning ? 'on' : 'off') + ')'}
                onPress={() => startScan()}
              />
              <Modal animationType="slide"
                transparent visible={isModalVisible}
                presentationStyle="overFullScreen"
                onDismiss={toggleModalVisibility}>
                <View style={styles.viewWrapper}>
                  <View style={styles.modalView}>
                  {(list.length == 0) &&
                    <View style={{ flex: 1, margin: 20 }}>
                      <Text style={{ textAlign: 'center' }}>No peripherals</Text>
                    </View>
                  } 
                  <ScrollView>
                  <FlatList
                      data={list}
                      renderItem={({ item }) => renderItem(item)}
                      keyExtractor={item => item.id}
                      ItemSeparatorComponent={ItemDivider}
                    />
                  </ScrollView>
                    <Button title="Close" onPress={toggleModalVisibility} />

                  </View>
                </View>
              </Modal>
            </View>

            {/*  <View style={{ margin: 10 }}>
                  <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected()} />
                </View>
              
                {/* {(list.length == 0) &&
                  <View style={{ flex: 1, margin: 20 }}>
                    <Text style={{ textAlign: 'center' }}>No peripherals</Text>
                  </View>
                }
  */ }
            <View style={{height:400}}>
            <ImageBackground  source={require('../assets/images/mallMap.jpg')}
            resizeMode="cover" style={{flex: 1,padding:5}}>
            <FontAwesome
            name="user"
            size={30}
        />
            <FontAwesome
            name="location-arrow"
            size={30}
        />
       
          </ImageBackground>
            </View>        
              </View>
        </ScrollView>

      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  text: {
    color: "white",
    fontSize: 42,
    lineHeight: 84,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#000000c0"
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  viewWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalView: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    elevation: 5,
    transform: [{ translateX: -(width * 0.4) },
    { translateY: -90 }],
    //height: 200,
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 7,
    padding: 10
  },
});

