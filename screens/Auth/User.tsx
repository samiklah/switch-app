import React, { useContext, useState, useEffect, useRef } from "react";
import useStateRef from 'react-usestateref';
import { FlatList, StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, LogBox } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { enableScreens } from 'react-native-screens';
import { Video, AVPlaybackStatus } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import { AuthContext } from "../../components/AuthProvider";
import axios from 'axios';
import { Image } from "react-native-expo-image-cache";

enableScreens();



export const UserScreen = ({ route, navigation: { navigate } }) => {
    const { user, logout } = useContext(AuthContext);
    const screenIsFocused = useIsFocused();
    const postsRef = useRef([]);
    const pagerView = useRef(null);
    const [status, setStatus] = useState([]);
    const [userId, setUserId] = useState();
    const [profile, setProfile] = useState();
    const [name, setname] = useState();
    const [username, setusername] = useState();
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [score, setScore] = useState(1);
    const [followed, setFollowed] = useState(null);
    const [img,setImg]=useState(null);
    const [activePage, setActivePage] = useState(1);
    const [ error, setError ] = useState();
    const [Posts, setPosts] = useState([]);
    const isFocused = useIsFocused();


    useEffect(() => {
        let isMounted = true;
          axios.defaults.baseURL = 'https://backend-6qjkq.ondigitalocean.app'; 
          axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
          setUserId(route.params.user.id);
          setname(route.params.user.name);
          setusername(route.params.user.username);
          //setFollowed(route.params.user.followed);
          if (route.params.user.img !== null) {
            //Image.prefetch({uri: 'https://writeshar.s3.amazonaws.com/userImg/'+route.params.user.img});
            setImg('https://writeshar.s3.amazonaws.com/userImg/'+route.params.user.img);
          }
          //Image.prefetch({uri: 'https://writeshar.s3.amazonaws.com/profileImages/default.png'});
          //console.log(route.params.user);
          getInfo(route.params.user.id);
          LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
          LogBox.ignoreLogs(['Each child in a list should']);
          LogBox.ignoreLogs(["Can't preform a React state update"]);
          return () => { isMounted = false }; 
      }, [route,isFocused]);

    const getInfo = (id) => {
        axios.get(`/api/show/user/${id}`)
        .then(response => {
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
            setFollowed(response.data.isFollowing);
            //console.log(response.data);
            
            setFollowing(response.data.folowing);
            setFollowers(response.data.folowers);
        })
        .catch(error => {
        console.log(error.response.data);
        })
    }

    const follow = () => {
        axios.post(`/api/follow/${userId}`)
        .then(response => {
            setFollowed(true);
            let array = user.following.push(userId);
            user.following = array;

            console.log(user.following);
        })
        .catch(error => {
        console.log(error.response.data);
        const key = Object.keys(error.response.data.errors)[0];
        setError(error.response.data.errors[key][0]);
        })
    }
    const unfollow = () => {
        axios.post(`/api/unfollow/${userId}`)
        .then(response => {
            setFollowed(false);
          let array = user.following.filter(e => e != userId);
          user.following = array;
          console.log(user.following);
        })
        .catch(error => {
          console.log(error.response.data);
          const key = Object.keys(error.response.data.errors)[0];
          setError(error.response.data.errors[key][0]);
        })
      }

    
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
                    

                <View style={{ alignSelf: "center" }}>
                    <View style={styles.profileImage}>
                        {img != null ? 
                        <Image uri={ img } style={{width:150, height:150}} resizeMode="cover" />
                        : 
                        <Image uri={'https://writeshar.s3.amazonaws.com/profileImages/default.png'} style={{width:150, height:150}} resizeMode="cover" />
                        }
                    </View>
                    <View style={styles.add}>
                        {followed != null &&
                        [
                        (!followed ?
                        <TouchableOpacity onPress={() => follow()}>
                            <Text style={[styles.text, { color: "#45474A", fontSize: 18 }]}><Ionicons name="ios-add" size={18} color="#45474A" style={{}}></Ionicons>Follow</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={() => unfollow()}>
                            <Text style={[styles.text, { color: "#45474A", fontSize: 18 }]}>UnFollow</Text>
                        </TouchableOpacity>
                        )]
                        }
                    
                    </View>
                    
                </View>
                
                <View style={styles.infoContainer}>
                <Text style={[styles.text, { fontWeight: "200", fontSize: 26 }]}>{ name }</Text>
                    <Text style={[styles.text, { color: "#AEB5BC", fontSize: 18 }]}>{ username } | <FontAwesome name="smile-o" style={{marginLeft:5}}  size={18} color="gray" /> {score}</Text>
                    
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statsBox}>
                        <Text style={[styles.text, { fontSize: 24 }]}>{Posts ? Posts.length : 0}</Text>
                        <Text style={[styles.text, styles.subText]}>Posts</Text>
                    </View>
                    <View style={[styles.statsBox, { borderColor: "#DFD8C8", borderLeftWidth: 1, borderRightWidth: 1 }]}>
                        <Text style={[styles.text, { fontSize: 24 }]}>{followers ? followers.length : 0}</Text>
                        <Text style={[styles.text, styles.subText]}>Followers</Text>
                    </View>
                    <View style={styles.statsBox}>
                        <Text style={[styles.text, { fontSize: 24 }]}>{following ? following.length : 0}</Text>
                        <Text style={[styles.text, styles.subText]}>Following</Text>
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
                            onPress={() => {navigate('Post',{ post: { id: item.id, uri: item.uri, views: item.view_count, score: item.score, auth: false  }})}}>
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
    text: {
        fontFamily: "HelveticaNeue",
        color: "#52575D"
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
        marginTop:10,
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
    postsContainer: {
        marginTop: 315,
    },
    imageContainerStyle: {
        flex: 1,
        flexDirection: 'column',
        margin: 1,
    },
    imageStyle: {
        height: 120,
        width: '100%',
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