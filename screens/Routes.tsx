import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Button, TextInput, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../components/AuthProvider';
import { GuestStack } from './Guest/GuestStack';
import { AppStack } from './Auth/AppStack';
import * as SecureStore from 'expo-secure-store';

interface User {
  user: React.Context<{}>;
  setUser: React.Context<{}>;
  login?: any;
  logout?: any;
}

const Routes: React.FC<User> = () => {
  const { user, setUser} = useContext(AuthContext)
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    let userObject: User | null = null;
    // check if the user is logged in or not
    SecureStore.getItemAsync('user')
      .then(userString => {
        if (userString) {
          // decode it
          // login();
          userObject = JSON.parse(userString)
          setUser(userObject);
        }
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
      })
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {user ? <AppStack />: <GuestStack />}
    </NavigationContainer>
  );
}

//{user ? <GuestStack />: <AppStack /> }

export default Routes;