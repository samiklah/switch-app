import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../components/AuthProvider";
import { StyleSheet, SafeAreaView, Button, Text, View, ScrollView, TextInput, TouchableOpacity} from "react-native";
import axios from 'axios';
import { enableScreens, } from 'react-native-screens';
import { useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { Image } from "react-native-expo-image-cache";

enableScreens();
const Stack = createNativeStackNavigator();

export const SearchScreen = ({ navigation: { navigate } }) => {
  const { user } = useContext(AuthContext);
  const [ error, setError ] = useState();
  const [ loading, setLoading ] = useState(false);
  const [results, setResults] = useState([]);
  const [seggested, setSeggested] = useState([]);

  const isFocused = useIsFocused();
  useEffect(() => {
    setResults([]);
    //change this
    getSeggested([]);
    console.log(user.following);
  }, [isFocused]);

  useEffect(() => {
    (async () => {
      axios.defaults.baseURL = 'https://backend-6qjkq.ondigitalocean.app'; 
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    setResults([]);
    getSeggested();
    //Image.prefetch({uri: 'https://writeshar.s3.amazonaws.com/profileImages/default.png'});
    })();
  }, []);

  const getSeggested = () => {
    axios.get('/api/suggested')
    .then(response => {
      setSeggested(response.data);
      seggested.map(item => item.followed = false);
      //seggested.map(item => item.img != null && Image.prefetch({uri: 'https://writeshar.s3.amazonaws.com/userImg/'+item.img}));
      setError(null);
    })
    .catch(error => {
      const key = Object.keys(error.response.data.errors)[0];
      setError(error.response.data.errors[key][0]);
    })
  }

  const search = (username) => {
    if (username.length > 3) {
      axios.get(`/api/search/${username}`)
      .then(response => {
        
        response.data.map(item => user.following.includes(item.id) ? item.followed = true : item.followed = false);
        setResults(response.data);
        console.log(response.data);    
        //response.data.map(item => item.img != null && Image.prefetch({uri: 'https://writeshar.s3.amazonaws.com/userImg/'+item.img}));
      })
      .catch(error => {
        const key = Object.keys(error.response.data.errors)[0];
        setError(error.response.data.errors[key][0]);
      })
    }
    
  }

  const follow = (userId) => {
     setLoading(true);
    axios.post(`/api/follow/${userId}`)
    .then(response => {

      const newa = results.map(p =>
        p.id === userId
          ? { ...p, followed: true }
          : p
      );
  
      setResults(newa);
      user.following.push(userId);
      setLoading(false);
    })
    .catch(error => {
      console.log(error.response.data);
      const key = Object.keys(error.response.data.errors)[0];
      setError(error.response.data.errors[key][0]);
    })
  }
  const unfollow = (userId) => {
    setLoading(true);
    axios.post(`/api/unfollow/${userId}`)
    .then(response => {

      const newa = results.map(p =>
        p.id === userId
          ? { ...p, followed: false }
          : p
      );
      setResults(newa);
      let array = user.following.filter(e => e !== userId);
      user.following = array;
      console.log(user.following);
      setError(null);
      setLoading(false);
    }) 
    .catch(error => {
      console.log(error.response.data);
      const key = Object.keys(error.response.data.errors)[0];
      setError(error.response.data.errors[key][0]);
    })
  }  

  const sfollow = (userId) => {
    setLoading(true);
      axios.post(`/api/follow/${userId}`)
      .then(response => {

        const newa = seggested.map(p =>
          p.id === userId
            ? { ...p, followed: true }
            : p
        );
    
        setSeggested(newa);
        user.following.push(userId);
        setLoading(false);
      })
      .catch(error => {
        console.log(error.response.data);
        const key = Object.keys(error.response.data.errors)[0];
        setError(error.response.data.errors[key][0]);
      })
  }
  const sunfollow = (userId) => {
    setLoading(true);
    axios.post(`/api/unfollow/${userId}`)
    .then(response => {

      const newa = seggested.map(p =>
        p.id === userId
          ? { ...p, followed: false }
          : p
      );
      setSeggested(newa);
      let array = user.following.filter(e => e !== userId);
      user.following = array;
      setError(null);
      setLoading(false);
    })
    .catch(error => {
      console.log(error.response.data);
      const key = Object.keys(error.response.data.errors)[0];
      setError(error.response.data.errors[key][0]);
    })
  }
  

  return (
    <SafeAreaView style={styles.container}>
      
      <TextInput
        style={{fontSize:18, height: 40}}
        placeholder="Search"
        placeholderTextColor= 'grey' 
        onChangeText={text => search(text)}
      />
      <ScrollView style={{width:"100%"}}>
      
      {results.map((ruser, index) => 
      ruser.id != user.id &&  
      <View key={ruser.id} style={styles.line}>
        <TouchableOpacity onPress={() =>
            navigate('User',{ user: { id: ruser.id,
                                      name:ruser.name, 
                                      username:ruser.username, 
                                      followed: null, 
                                      img: ruser.img 
                                    }})
        }>
          
          {ruser.img != null ? 
            <Image uri={'https://writeshar.s3.amazonaws.com/userImg/'+ruser.img} resizeMode="cover" style={{borderRadius:30,borderColor:'#ccc', borderWidth: 2,width:55, height:55,marginLeft:10}} />
          : 
            <Image uri={'https://writeshar.s3.amazonaws.com/profileImages/default.png'} resizeMode="cover" style={{borderRadius:30,borderColor:'#ccc', borderWidth: 2,width:55, height:55,marginLeft:10}}  />
          }
        </TouchableOpacity>
        
        <View style={{flex:1, marginLeft:10}}>
        <TouchableOpacity onPress={() =>
            navigate('User',{ user: { id: ruser.id, name:ruser.name, username:ruser.username, followed: null, img: ruser.img  }})
        }>
          <Text style={{fontSize:20, height:25, alignItems: 'center'}}>{ruser.name}</Text>
          <Text style={{fontSize:20, color:'grey', height:30}}>{ruser.username}</Text>
          </TouchableOpacity>
        </View>
        
        
      </View> 
      )} 

      <View style={styles.line}>
      <Text style={{fontSize:17,marginLeft:10, height:20, alignItems: 'center'}}>Sugessted Users</Text>
      </View>
      {seggested.map((suser, index) => 
      <View key={suser.id} style={styles.line}>
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
        <View style={{position: 'absolute', right: 0}}>
        {!suser.followed ? 
        <Button
        title="Follow"
        disabled={loading}
        onPress={() => sfollow(suser.id)}
        style={{fontSize:17, height:30, marginRight:12, }}
        />
        : 
        <Button
        title="Unfollow"
        disabled={loading}
        onPress={() => sunfollow(suser.id)}
        style={{fontSize:17, height:30, marginRight:12}}
        />
        }
         </View>
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
    paddingTop: 10,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'gray',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
    height: 50,
    height: '100%'
},
  mainImoji: {
    width: 70,
    height: 70,
  },
  user: {
    flex: 1,

  }
});

