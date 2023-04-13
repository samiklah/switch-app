import React, { useContext, useState, useEffect, useRef } from "react";
import useStateRef from 'react-usestateref';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, FlatList, TouchableOpacity, Alert, Dimensions, LogBox } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { enableScreens } from 'react-native-screens';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from "../../components/AuthProvider";
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Image } from "react-native-expo-image-cache";
import { RNS3 } from "react-native-aws3";
import ProgressBar from 'react-native-progress/Bar';

enableScreens();
 
let {width:screenWidth,height:screenHeight}=Dimensions.get('window');


export const ProfileScreen = ({ route, navigation: { navigate } }) => {
    const { user, logout, updateUser } = useContext(AuthContext);
    const screenIsFocused = useIsFocused();
    const postsRef = useRef([]);
    const pagerView = useRef(null);
    const [profile, setProfile] = useState();
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [score, setScore] = useState(1);
    const [loading,setLoading,loadingRef]=useStateRef();
    const [img,setImg]=useState(null);
    const [ error, setError ] = useState();
    const [Posts, setPosts] = useState([]);
    const [ progress, setProgress ] = useState(0.01);

    useEffect(() => {
        (async () => {
            
            getInfo(user.id);
            setLoading(false);
            LogBox.ignoreLogs(["Can't preform a React state update"]);
        })();
    }, [route, screenIsFocused]);

 
    useEffect(() => {
        (async () => {
            axios.defaults.baseURL = 'https://backend-6qjkq.ondigitalocean.app'; 
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
            LogBox.ignoreLogs(['Each child in a list should']);
        })();
      }, []);
    

    const getFollowers = () => {
        axios.get(`/api/user/followers/${user.id}`)
        .then(response => {
            setFollowers(response.data);
        })
        .catch(error => {
        console.log(error);
        })
    }

    const getInfo = (id) => {
        axios.get(`/api/show/user/${id}`)
        .then(response => {
            setProfile(response.data.user);
            if (response.data.user.img) {
                setImg('https://writeshar.s3.amazonaws.com/userImg/'+response.data.user.img);   
                //Image.prefetch({uri: 'https://writeshar.s3.amazonaws.com/userImg/'+response.data.user.img});
            }
            if (response.data.posts) {
                setPosts(response.data.posts);
                let sum = 1;
                for (let index = 0; index < response.data.posts.length; index++) {
                    
                    sum = response.data.posts[index].score + sum;
                }
                let ssum = sum.toString();
                const sumParts = ssum.split('.');
                setScore(sumParts[0]);
            }
            
            setFollowing(response.data.folowing);
            setFollowers(response.data.folowers);


            if (response.data.following == null) {
                user.following = [];
            }else{
                let followingd = null;
                followingd = response.data.following.map(follow => follow.pivot.user_two);
                user.following = followingd;
            }
            
        })
        .catch(error => {
            console.log(error);
        })
    }

    const showAlert = () =>
      Alert.alert(
        "Logout",
        "Do You Want to Logout?",
        [
            {
                text: "Logout",
                onPress: logout,
                style: "cancel",
            },
            {
                text: "Cancel",
                style: "cancel",
            },
            
        ],
        {
          cancelable: true,
        }
      );

      const generateUUID = () => {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
           return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid; 
      }

    const uploadImage2 = async () => {

        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              alert('Sorry, we need camera roll permissions to make this work!');
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [3, 3],
        });

        if (!result.cancelled) {
      
            console.log(result);
            setLoading(true);
            const uriParts = result.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            const name = generateUUID();
            const data = new FormData();
            data.append('img',
                {
                  uri: result.uri, 
                  name: name+'.'+fileType,
                  type: 'image/'+fileType
                });
                console.log(data);
            axios.post('/api/user/update', data)
            .then(response => {
                setImg('https://writeshar.s3.amazonaws.com/userImg/'+response.data.img);
                //user.img = response.data.img;
                updateUser(response.data.img);

                console.log(response.data);

                setLoading(false);
                getInfo(user.id);
            })
            .catch(error => {
                setLoading(false);
                console.log(error.response.data);
                const key = Object.keys(error.response.data.errors)[0];
                setError(error.response.data.errors[key][0]);
            })
        }
    }



    const uploadImage = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [3, 3],
        });
        if (!result.cancelled) {
            
          
            console.log(result);
            setLoading(true);
            const uriParts = result.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            const name = generateUUID();
    
            const file = {
              uri: result.uri,
              name: name+'.'+fileType,
              type: result.type+'/'+fileType
            };
    
            
    
            if (result.type == "Image" || result.type == "image") {
              try {
                const data = new FormData();
                data.append('img',name+'.'+fileType);
                axios.post('/api/user/update', data)
                .then(response => {
                    
                })
                .catch(error => {
                  const key = Object.keys(error.response.data.errors)[0];
                  console.log(error.response.data.errors[key][0]);
                });
              } catch (error) {
                console.log(error);
              }
            }
            
            const options = {
              keyPrefix: "userImg/",
              bucket: "writeshar",
              region: "us-east-1",
              accessKey: "AKIAXIHQPUYBQ55G7Q7F",
              secretKey: "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",
              successActionStatus: 201
            };
            return RNS3.put(file, options).progress(event => {
              setProgress(event.percent);
            }).then(response => {
              if (response.status != 201){
                alert(
                  "Failed to upload"
                );
                throw new Error("Failed to upload");
                
              }
              else { 
                
                setLoading(false);
                setImg('https://writeshar.s3.amazonaws.com/userImg/'+name+'.'+fileType);
                    //user.img = response.data.img;
                    updateUser(name+'.'+fileType);
    
                    setProgress(0.01);
    
                    getInfo(user.id);
                
              }
            })
            .catch(error => {
              console.log(error);
            });
    
            
          }
    
        
        
      };

    
    const handlePageSelected = ({position}) => {
        console.log('Current Card Index', position);
        setActivePage(position);
        if (position != 0 || position < 0) {
            //console.log(Posts[position-1].id);  
            console.log(postsRef.current[position]);
            
            
    
            postsRef.current[position-1].playAsync();
            // if is buffering 
    
            /*
            i tried to load the video after unload it if the user go up 
            if (status.isLoaded == false) {
              postsRef.current[position-1].loadAsync(Posts[position-1].Videourl);
            }
            */
            
        }
        if (position == 0) {
          //pagerView.current.setPage(1);
        }
      }
      const goUp = () => {
        pagerView.current.setPage(0);
        //getInfo(user.id);
        console.log(user.id);
        console.log("user.id");
      }
    
    return (
        <SafeAreaView style={styles.container}>
                <ScrollView style={{flex: 1}}>
                
                    <View style={styles.titleBar}>
                        <TouchableOpacity onPress={() => showAlert()}>
                            <Text>Logout</Text>
                        </TouchableOpacity>
                    </View>

                <View style={{ alignSelf: "center" }}>
                    <View style={styles.profileImage}>
                        {img != null ? 
                        <Image uri={ img } style={{width:150, height:150}} resizeMode="cover" transition={false}/>
                        : 
                        <Image  uri={'https://writeshar.s3.amazonaws.com/profileImages/default.png'} transition={false} style={{width:150, height:150}} resizeMode="cover" />
                        }
                    </View>
                    <View style={styles.add}>
                    <TouchableOpacity disabled={loadingRef.current} onPress={uploadImage}>
                    <Text style={[styles.text, { color: "#45474A", fontSize: 18 }]}><Ionicons name="ios-add" size={18} color="#45474A" style={{}}></Ionicons>Image</Text>
                    </TouchableOpacity>
                    </View>
                    
                </View>
                
                <View style={styles.infoContainer}>
                {loadingRef.current && <ProgressBar progress={progress} width={200} /> }
                <Text style={[styles.text, { fontWeight: "200", fontSize: 26 }]}>{user.name }</Text>
                    <Text style={[styles.text, { color: "#AEB5BC", fontSize: 18 }]}>{user.username} | <FontAwesome name="smile-o" style={{marginLeft:5}}  size={18} color="gray" /> {score}</Text>
                    
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statsBox}>
                        <Text style={[styles.text, { fontSize: 24 }]}>{Posts ? Posts.length : 0}</Text>
                        <Text style={[styles.text, styles.subText]}>Posts</Text>
                    </View>
                    
                    <View style={[styles.statsBox, { borderColor: "#DFD8C8", borderLeftWidth: 1, borderRightWidth: 1 }]}>
                    {followers ?
                        <TouchableOpacity onPress={() =>
                        navigate('FollowersUsers',{
                            users: { users: followers}})
                        }>
                        <Text style={[styles.text, { fontSize: 24 }]}>{ followers.length }</Text>
                        </TouchableOpacity>
                        :
                        <Text style={[styles.text, { fontSize: 24 }]}>0</Text>
                        }
                        {followers ?
                        <TouchableOpacity onPress={() =>
                            navigate('FollowersUsers',{
                                users: { users: followers}})
                            }>
                            <Text style={[styles.text, styles.subText]}>Followers</Text>
                            </TouchableOpacity>
                        :
                        <Text style={[styles.text, styles.subText]}>Followers</Text>
                        }
                        
                    </View>
                    
                    <View style={styles.statsBox}>
                        {following ?
                        <TouchableOpacity onPress={() =>
                        navigate('FollowingUsers',{
                            users: { users: following}})
                        }>
                        <Text style={[styles.text, { fontSize: 24 }]}>{following.length}</Text>
                        </TouchableOpacity>
                        :
                        <Text style={[styles.text, { fontSize: 24 }]}>0</Text>
                        }
                        {following ?
                        <TouchableOpacity onPress={() =>
                        navigate('FollowingUsers',{
                            users: { users: following}})
                        }>
                        <Text style={[styles.text, styles.subText]}>Following</Text>
                        </TouchableOpacity>
                        :
                        <Text style={[styles.text, styles.subText]}>Following</Text>
                        }
                    </View>
                </View>
                <View style={styles.postsContainer}>
                <FlatList
                    data={Posts}
                    renderItem={({item}) => (
                    <View style={styles.imageContainerStyle}>
                        <TouchableOpacity
                        key={item.id}
                        style={{flex: 1}}
                        onPress={() => {navigate('Post',{ post: { id: item.id, uri: item.uri, views: item.view_count, score: item.score, auth: true  }})}}>
                        <Image uri={ 'https://writeshar.s3.amazonaws.com/posts/'+item.thumbnail } style={styles.imageStyle} />
                        </TouchableOpacity>
                    </View>
                    )}
                    //Setting the number of column
                    numColumns={3}
                    scrollEnabled={false}
                    keyExtractor={(item, index) => index.toString()}
                />
                </View>   
                
                </ScrollView>
                
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF"
    },
    imageContainerStyle: {
        flex: 1,
        flexDirection: 'column',
        margin: 1,
      },
    text: {
        fontFamily: "HelveticaNeue",
        color: "#52575D"
    },
    imageStyle: {
        height: 120,
        width: '100%',
      },
    image: {
        flex: 1,
        height: undefined,
        width: undefined
    },
    titleBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
        marginHorizontal: 16
    },
    subText: {
        fontSize: 12,
        color: "#AEB5BC",
        textTransform: "uppercase",
        fontWeight: "500"
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 100,
        overflow: "hidden",
        borderColor:'#ccc', 
        borderWidth: 2,
    },
    dm: {
        backgroundColor: "#41444B",
        position: "absolute",
        top: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    active: {
        backgroundColor: "#34FFB9",
        position: "absolute",
        bottom: 28,
        left: 10,
        padding: 4,
        height: 20,
        width: 20,
        borderRadius: 10
    },
    add: {
        backgroundColor: "#FFC83A",
        position: "absolute",
        bottom: 0,
        right: -50,
        width: 100,
        height: 30,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    infoContainer: {
        alignSelf: "center",
        alignItems: "center",
        marginTop: 16
    },
    postsContainer: {
        marginTop: 315,
    },
    statsContainer: {
        flexDirection: "row",
        alignSelf: "center",
        marginTop: 32,
        marginBottom: -300
    },
    statsBox: {
        alignItems: "center",
        flex: 1
    },
    mediaImageContainer: {
        width: 180,
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        marginHorizontal: 10
    },
    mediaCount: {
        backgroundColor: "#41444B",
        position: "absolute",
        top: "50%",
        marginTop: -50,
        marginLeft: 30,
        width: 100,
        height: 100,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        shadowColor: "rgba(0, 0, 0, 0.38)",
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        shadowOpacity: 1
    },
    recent: {
        marginLeft: 78,
        marginTop: 32,
        marginBottom: 6,
        fontSize: 10
    },
    recentItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16
    },
    activityIndicator: {
        backgroundColor: "#CABFAB",
        padding: 4,
        height: 12,
        width: 12,
        borderRadius: 6,
        marginTop: 3,
        marginRight: 20
    },
    pagerView: {
        flex: 1,
    },
});



/**
 * <Text style={[styles.text, { color: "#AEB5BC", fontSize: 18 }]}><Ionicons name="ios-add" size={18} color="#DFD8C8" style={{}}></Ionicons>Follow</Text>
 *  
 *<Ionicons name="ios-add" size={24} color="#52575D"></Ionicons>
 * 
 * <ScrollView contentContainerStyle={{ flex: 1 }} >
                <View style={styles.titleBar}>
                    <Ionicons name="ios-add" size={24} color="#52575D"></Ionicons>
                </View>

                <View style={{ alignSelf: "center" }}>
                    <View style={styles.profileImage}>
                    </View>
                    <View style={styles.add}>
                    <Text style={[styles.text, { color: "#AEB5BC", fontSize: 18 }]}><Ionicons name="ios-add" size={18} color="#DFD8C8" style={{}}></Ionicons>Follow</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                <Text style={[styles.text, { fontWeight: "200", fontSize: 26 }]}>Julie Abd kalah </Text>
                    <Text style={[styles.text, { color: "#AEB5BC", fontSize: 18 }]}>@Photographer | 1,321</Text>
                    
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statsBox}>
                        <Text style={[styles.text, { fontSize: 24 }]}>483</Text>
                        <Text style={[styles.text, styles.subText]}>Posts</Text>
                    </View>
                    <View style={[styles.statsBox, { borderColor: "#DFD8C8", borderLeftWidth: 1, borderRightWidth: 1 }]}>
                        <Text style={[styles.text, { fontSize: 24 }]}>45,844</Text>
                        <Text style={[styles.text, styles.subText]}>Followers</Text>
                    </View>
                    <View style={styles.statsBox}>
                        <Text style={[styles.text, { fontSize: 24 }]}>302</Text>
                        <Text style={[styles.text, styles.subText]}>Following</Text>
                    </View>
                </View>
                </ScrollView>
 */