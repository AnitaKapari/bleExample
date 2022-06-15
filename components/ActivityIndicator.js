import React, {useState, useEffect} from 'react';
import { StyleSheet,Text,Image, View,  ActivityIndicator} from "react-native";

export default function ActivityIndicator() {

    return (
      <View style={[styles.container,{marginTop:200}]}>
              <ActivityIndicator
           // animating={animating}
            color="#fcba03"
            size={50}
            style={styles.activityIndicator}
          />
           </View>  
    );
}


const styles = StyleSheet.create({
  spinnerStyle: {
    flex: 1,
    justifyContent: 'center',
  },
})

