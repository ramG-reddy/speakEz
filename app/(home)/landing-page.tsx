import { View, Text } from 'react-native'
import React from 'react'

export default function LandingPage() {
  return (
    <View className='flex-1 justify-center items-center bg-white gap-4'>
      <Text className='text-2xl font-bold'>Welcome to the App!</Text>
      <Text>Connect to the Sensors to Proceed</Text>
    </View>
  )
}