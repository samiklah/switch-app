import React, { useContext, useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "../../components/AuthProvider";
import { UploadScreen } from "./Upload";
import { FolloingScreen } from "./Following";
import { FollowingUsersScreen } from "./FollowingUsers";
import { FollowersUsersScreen } from "./FollowersUsers";
import { PostScreen } from "./Post";
import { SearchScreen } from "./Search";
import { HomeScreen } from "./Home";
import { ProfileScreen } from "./Profile";
import { UserScreen } from "./User";
import { Button, Text, View} from "react-native";
import axios from 'axios';
import { enableScreens } from 'react-native-screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons,Ionicons,MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';


axios.defaults.baseURL = 'http://writeshar-env.eba-hj6mmsgz.us-east-1.elasticbeanstalk.com';

enableScreens();
const Tab = createBottomTabNavigator();

const SearchStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const FollowingStack = createStackNavigator();
const HomeStack = createStackNavigator();

function SearchStackScreen() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="Search" component={SearchScreen} 
      options={{
        headerShown: false
      }}
      />
      <SearchStack.Screen name="User" component={UserScreen} />
      <SearchStack.Screen name="Post" component={PostScreen} />
    </SearchStack.Navigator>
  );
}
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} 
      options={{
        headerShown: false
      }}
      />
      <ProfileStack.Screen name="User" component={UserScreen} />
      <ProfileStack.Screen name="FollowingUsers" component={FollowingUsersScreen} />
      <ProfileStack.Screen name="FollowersUsers" component={FollowersUsersScreen} />
      <ProfileStack.Screen name="Post" component={PostScreen} />
    </ProfileStack.Navigator>
  );
}
function FollowingStackScreen() {
  return (
    <FollowingStack.Navigator>
      <FollowingStack.Screen name="Following" component={FolloingScreen} 
      options={{
        headerShown: false
      }}
      />
      <FollowingStack.Screen name="User" component={UserScreen} />
      <FollowingStack.Screen name="Post" component={PostScreen} />
    </FollowingStack.Navigator>
  );
}
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} 
      options={{
        title: 'Switch'
      }}
      />
      <HomeStack.Screen name="User" component={UserScreen} />
      <HomeStack.Screen name="Post" component={PostScreen} />
    </HomeStack.Navigator>
  );
}

// function DashboardScreen({ navigation }) {
//   const { user, logout } = useContext(AuthContext)
//   const [name, setName] = useState(null);

//   useEffect(() => {
//     axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;

//     axios.get('/api/user')
//       .then(response => {
//         setName(response.data.name);
//       })
//       .catch(error => {
//         console.log(error.response);
//       })

//   }, []);


//   return (
//     <View>
 
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

//       <Text>Dashboard Screen Logged In View</Text>
//       <Text>User: {user.username}</Text>
//       <Text>User from Server: {name}</Text>
//       <Button title="Go to Settings" onPress={() => navigation.navigate('Settings')} />
//       <Button title="Logout" onPress={() => logout()} />
//     </View>
//     </View>
//   );
// }

function SettingsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext)

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Settings Screen</Text>
      <Text>User: {user.username}</Text>
      <Button title="Go to Dashboard" onPress={() => navigation.navigate('Home')} />
      <Button title="Logout" onPress={() => logout()} />
    </View>
  );
}



export const AppStack = () => {
  return (
    <NavigationContainer independent={true}>
    <Tab.Navigator
    tabBarOptions = {{
      showLabel: false,
      activeTintColor: '#FFC83A',
    }}
    >
      
      <Tab.Screen 
        name="Home" 
        component={HomeStackScreen} 
        options={{
          tabBarLabel: 'Public',
          tabBarIcon:({ color }) => (
            <Ionicons name="globe-outline"  size={27} color={color} />
          ),
          
        }}
        />

      <Tab.Screen 
        name="Following" 
        component={FollowingStackScreen} 
        
        options={{
          //keyboardHidesTabBar: true,
          tabBarLabel: 'Following',
          tabBarIcon:({ color }) => (
            <MaterialCommunityIcons name="account-group" size={32} color={color} />
          ),
        }}
        />

      <Tab.Screen 
        name="Upload" 
        component={UploadScreen} 
        
        options={{
          //keyboardHidesTabBar: true,
          tabBarLabel: 'Upload',
          tabBarIcon:({ color }) => (
            <MaterialIcons name="video-call" size={32} color={color} />
          ),
        }}
        />

      <Tab.Screen 
        name="Search" 
        component={SearchStackScreen} 
        
        options={{
          tabBarLabel: 'Search',
          tabBarIcon:({ color }) => (
            <MaterialIcons name="search" size={30} color={color} />
          ),
        }}
        />


      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen} 
        
        options={{
          //keyboardHidesTabBar: true,
          tabBarLabel: 'Profile',
          tabBarIcon:({ color }) => (
            <Ionicons name="person" size={28} color={color} />
          ),
        }}
        />
    </Tab.Navigator>
    </NavigationContainer>
  )
}
/*
<Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
*/ 
