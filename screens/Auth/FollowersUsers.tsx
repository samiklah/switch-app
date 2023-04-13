import React, { useContext, useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, SafeAreaView, Button, ScrollView, TouchableOpacity, LogBox } from "react-native";
import { enableScreens } from 'react-native-screens';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from "../../components/AuthProvider";
import axios from 'axios';
import { Image } from "react-native-expo-image-cache";

enableScreens();

export const FollowersUsersScreen = ({ route, navigation: { navigate } }) => {
    const { user } = useContext(AuthContext);
    const [ error, setError ] = useState();
    const [ users, setUsers ] = useState([]);
    const [ loading, setLoading ] = useState(false);

    const isFocused = useIsFocused();

    useEffect(() => {
        let isMounted = true;
          axios.defaults.baseURL = 'https://backend-6qjkq.ondigitalocean.app'; 
          axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
          setUsers(route.params.users.users);
          LogBox.ignoreLogs(['Encountered two children']);
          LogBox.ignoreLogs(["Can't preform a React state update"]);

            //users.map(item => item.img != null && Image.prefetch({uri: 'https://writeshar.s3.amazonaws.com/userImg/'+item.img}));
          //Image.prefetch({uri: 'https://writeshar.s3.amazonaws.com/profileImages/default.png'});
          //console.log(route.params.user);
          return () => { isMounted = false }; 
      }, [route,isFocused]);

    // const follow = (userId) => {
    //     setLoading(true);
    //     axios.post(`/api/follow/${userId}`)
    //     .then(response => {

    //         const newa = users.map(p =>
    //         p.id === userId
    //             ? { ...p, followed: true }
    //             : p
    //         );
        
    //         setUsers(newa);
    //         let array = user.following.push(userId);
    //         user.following = array;
    //         setLoading(false);
    //     })
    //     .catch(error => {
    //         console.log(error.response.data);
    //         const key = Object.keys(error.response.data.errors)[0];
    //         setError(error.response.data.errors[key][0]);
    //     })
    // }
    // const unfollow = (userId) => {
    //     setLoading(true);
    //     axios.post(`/api/unfollow/${userId}`)
    //     .then(response => {

    //         const newa = users.map(p =>
    //         p.id === userId
    //             ? { ...p, followed: false }
    //             : p
    //         );
    //         setUsers(newa);
    //         let array = user.following.filter(e => e !== userId);
    //         user.following = array;
    //         setError(null);
    //         setLoading(false);
    //     }) 
    //     .catch(error => {
    //         console.log(error.response.data);
    //         const key = Object.keys(error.response.data.errors)[0];
    //         setError(error.response.data.errors[key][0]);
    //     })
    // }  
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={{width:"100%", marginTop: 10}}>   
            {users !== null && users.map((suser, index) => 
            <View key={suser} style={styles.line}>
                <TouchableOpacity onPress={() =>
                    navigate('User',{ user: { id: suser.id, name:suser.name, username:suser.username, followed: null, img: suser.img }})
                }>
                    {suser.img != null ? 
                    <Image uri={'https://writeshar.s3.amazonaws.com/userImg/'+suser.img} resizeMode="cover" style={{borderRadius:30,borderColor:'#ccc', borderWidth: 2,width:55, height:55,marginLeft:10}} />
                    : 
                    <Image uri={'https://writeshar.s3.amazonaws.com/profileImages/default.png'} resizeMode="cover" style={{borderRadius:30,borderColor:'#ccc', borderWidth: 2,width:55, height:55,marginLeft:10}}  />
                    }
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() =>
                    navigate('User',{ user: { id: suser.id, name:suser.name, username:suser.username, followed: null, img: suser.img  }})
                }>
                <View style={{flex:1, marginLeft:10}}>
                    <Text style={{fontSize:20, height:25, alignItems: 'center'}}>{suser.name}</Text>
                    <Text style={{fontSize:20, color:'grey', height:30}}>{suser.username}</Text>
                
                </View>
                </TouchableOpacity>
            </View>
            )}
            
            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    line: {
      paddingBottom: 10,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: 'gray',
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: 10,
      height: 50,
      //height: '100%'
  },
    mainImoji: {
      width: 70,
      height: 70,
    },
    user: {
      flex: 1,
  
    }
  });
  
  
  /**
   * 
   * {!suser.followed ? 
                <Button
                title="Follow"
                disabled={loading}
                onPress={() => follow(suser.id)}
                style={{fontSize:17, height:30, marginRight:12, }}
                />
                : 
                <Button
                title="Unfollow"
                disabled={loading}
                onPress={() => unfollow(suser.id)}
                style={{fontSize:17, height:30, marginRight:12}}
                />
                }
   */