import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={{
        padding: 5, alignItems: 'center', backgroundColor: 'white', height: 95,
        width: 300, borderRadius: 300, margin: 10
      }}>
      </View>
      <Text>Home</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
})