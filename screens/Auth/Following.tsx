
import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import useStateRef from 'react-usestateref';
import Detector from '../../components/Detector';
import { Video, Audio } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import { AuthContext } from "../../components/AuthProvider";
import { Image } from "react-native-expo-image-cache";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
  
enableScreens();


let {width:screenWidth,height:screenHeight}=Dimensions.get('window');

const animationEndY = Math.ceil(screenHeight * 0.25);
const negativeEndY = animationEndY * -1;

let emojiCount = 1;

function getRandomNumber(min, max) {
  return Math.random()*(max-min)+min
}

export const  FolloingScreen = ({ navigation: { navigate } }) => {
  const { user } = useContext(AuthContext);
  const postsRef = useRef([]);
  const pagerView = useRef(null);
  const [status, setStatus] = useState([]);
  const [viewed, setviewed] = useState([]);
  
  const [activePage,setActivePage]=useState();
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [presentPost, setPresentPost] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [Posts, setPosts] = useState([
    {
      id: null,
      uri: null,
      user:{
        name: null
      }
    },
  ]);
  const [score,setScore,scoreRef]=useStateRef(0.1);
  const [scores,setScores,scoresRef]=useStateRef(0);
  const screenIsFocused = useIsFocused();
  const [emoji,setEmoji]=useState('https://writeshar.s3.amazonaws.com/profileImages/1.png');

  const [emojis, setEmojis] = useState([]);

  const addEmoji = () => {
    setEmojis([
        ...emojis,
        {
          id: emojiCount,
          right: getRandomNumber(0,15)
        }
      ]
    )
    emojiCount++;
  }

  removeEmoji = id => {
    setEmojis(emojis => emojis.filter(x => {
      return x.id !== id
    }));
  }






  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      axios.defaults.baseURL = 'https://backend-6qjkq.ondigitalocean.app'; 
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      
      getPosts();
      if (Posts.length > 0) {
        setPresentPost(Posts[0].id);
      }
    })();
  }, []);
  useEffect(() => { Audio.setAudioModeAsync({ playsInSilentModeIOS: true }); });

  useEffect(() => {
    (async () => {
      
      if (status.didJustFinish && screenIsFocused) {
        await postsRef.current[activePage-1].replayAsync(); 
      }

      /*
      if (status.isLoaded == false) {
        pagerView.current.setPage(activePage+1);
      }
      */
     //console.log(status);
     
     
      //console.log(scoresRef.current);
      //console.log(scoreRef.current);
      if (!screenIsFocused) {
        await postsRef.current[activePage-1].pauseAsync(); 
       }
     
     if (status.isPlaying && !status.isBuffering && predictions != null && screenIsFocused && status.positionMillis > 1000) {
        setScores(scoresRef.current+1);
        setScore(scoreRef.current+predictions);
     }

    if (status.positionMillis > 1000) {
      setviewed([...new Set([...viewed, presentPost])]);
    }
    if (predictions > 0.55) {
      addEmoji();
    }
    })();
  }, [status]);

  
  const getPosts = () => {
    setLoading(true);
    axios.get('/api/followed/posts')
    .then(response => {
      setPosts(prevPosts => {
        //return [...prevPosts, ...response.data]
        return [...new Set([...prevPosts, ...response.data])];
      })
      setLoading(false);
      //console.log(response.data);

    })
    .catch(error => {
      console.log(error.dara);
      alert('there is no now posts :(');
    })
  }

  const sendScore = (videoId, thescore) => {
    if (viewed.includes(videoId)) {
     // console.log("final "+ thescore);
      const data = new FormData();
      data.append('score',thescore);
      data.append('device_name','mobile');
      //console.log(data);
      //console.log(videoId);
      axios.post(`api/view/${videoId}`, data)
      .then(response => {
       //console.log(response);
       setScores(0);
        setScore(0);
      })
      .catch(error => {
        console.log("ERORR"+error.data);
        setScores(0);
        setScore(0);
      })
    }
  }


  const handleFacesDetected = ({ faces }) => {
    const face = faces[0];
      if (face) {
        
        // if (face.smilingProbability > 0.01 && face.smilingProbability <= 0.1) {
         // setEmoji('https://writeshar.s3.amazonaws.com/profileImages/2.png');
         //}
         if (face.smilingProbability > 0.05 && face.smilingProbability <= 0.55) {
          setEmoji('https://writeshar.s3.amazonaws.com/profileImages/3.png');
         }
         
         if(face.smilingProbability > 0.55) {
          setEmoji('https://writeshar.s3.amazonaws.com/profileImages/44.png');
          
         }
         if (face.smilingProbability <= 0.05) {
          setEmoji('https://writeshar.s3.amazonaws.com/profileImages/1.png');
         }
        setPredictions(face.smilingProbability);
      }
      
      
       
       //console.log('img'+emoji);
       //console.log('A'+face.smilingProbability);
  };

  const handlePageSelected = async ({position}) => {
    //console.log('Current Card Index', position);
    setActivePage(position);
    
    //console.log(postsRef.current[position-1]);
    
    if(position == 1 || position == 0){
      pagerView.current.setPage(2);
    }else{
      const currentStatus = await postsRef.current[position-1].getStatusAsync();
      await postsRef.current[position-2].pauseAsync(true);
      if (currentStatus.isLoaded == false && screenIsFocused) {
        await postsRef.current[position-1].loadAsync({uri : 'https://writeshar.s3.amazonaws.com/posts/'+Posts[position-1].uri});
      }
       
      if (postsRef.current[position] != null) {
        await postsRef.current[position].pauseAsync(true);  
      }
      if (screenIsFocused) {
        await postsRef.current[position-1].playAsync(true); 
      }
      
    }
    
    
    
    if (position >= 2 && position <= Posts.length) {
      //console.log("position"+position);
      let total = scoreRef.current/scoresRef.current;
        //console.log('the id'+ Posts[position-2].id);
        sendScore(Posts[position-2].id,total);
      
      //console.log(viewed);

        setPresentPost(Posts[position-1].id);
        
        //console.log(postsRef.current[position]);
        if (position > 6) {
          postsRef.current[position-5].unloadAsync();
        }

        if(position == Posts.length ){
          getPosts();
        }
        

       // postsRef.current[position-1].playAsync();
        // if is buffering 

        /*
        i tried to load the video after unload it if the user go up 
        if (status.isLoaded == false) {
          postsRef.current[position-1].loadAsync(Posts[position-1].Videourl);
        }
        */
        
    }
    if (position == 0) {
      pagerView.current.setPage(1);
    }
  }

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }


  return (
    
      
      <PagerView style={styles.pagerView}
        onPageSelected={(eventDate) => handlePageSelected(eventDate.nativeEvent)}
        initialPage={1}
        ref={pagerView}
        orientation="vertical"
        >
        <Detector onFacesDetected={handleFacesDetected} />

        {Posts && Posts.map((v, index) => 

          <View key={index}>
            <View style={{justifycontent:'center'}}>

              <Video 
                ref={(ref) => postsRef.current[index] = ref}
                source={{uri: null}}                   
                style={{height:screenHeight,}}
                resizeMode="contain"
                onPlaybackStatusUpdate={status => setStatus(() => status)}
                shouldPlay={screenIsFocused}
                posterSource={{uri : 'https://writeshar.s3.amazonaws.com/posts/load.gif'}}
                usePoster={true}
              />
              {v.id &&
              <View style={styles.userInfo}>
                <View>
                <TouchableOpacity onPress={() =>
                  navigate('User',{ user: { id: v.user.id, name:v.user.name, username:v.user.username, followed: null, img: v.user.img  }})
                }>
                {v.user.img != null ? 
                  <Image uri={ 'https://writeshar.s3.amazonaws.com/userImg/'+v.user.img } style={styles.profileImage} resizeMode="cover" transition={false}/>
                  : 
                  <Image  uri={'https://writeshar.s3.amazonaws.com/profileImages/default.png'} style={styles.profileImage} transition={false} resizeMode="cover" />
                }
                </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() =>
                  navigate('User',{ user: { id: v.user.id, name:v.user.name, username:v.user.username, followed: null, img: v.user.img  }})
                }>
                <View style={styles.nameUsername}>
                  <Text style={styles.theText}>{v.user.name }</Text>
                  <Text style={styles.theText}>{v.user.username}</Text>
                </View>
                </TouchableOpacity>
              </View>
              }
              {v.id &&
              <View style={styles.postInfo}>
                <View style={styles.reaction}>

                {emojis.map((e) => {
                  return(
                    <EmojiContainer 
                      key={e.id} 
                      style={{right:e.right}}
                      onComplete={()=> removeEmoji(e.id)}
                      />
                  )
                })}

                <Image uri={ emoji } style={styles.emoji}/>
                

               
                {user.img != null ? 
                  <Image uri={ 'https://writeshar.s3.amazonaws.com/userImg/'+user.img } style={styles.userImage} resizeMode="cover" transition={false}/>
                  :  
                  <Image  uri={'https://writeshar.s3.amazonaws.com/profileImages/default.png'} style={styles.userImage} transition={false} resizeMode="cover" />
                }
                </View>
                <View style={styles.postInfoViews}>
                <MaterialCommunityIcons name="eye-outline" size={22} color="black" /><Text  style={styles.postInfoViewsText}> : {v.view_count*12+1} |  </Text>
                <FontAwesome name="smile-o" style={{marginLeft:5}}  size={22} color="black" /><Text  style={styles.postInfoViewsText}> : {Math.round(v.score*100)/100*100} </Text> 
                
                </View>
              </View>
              }

            </View>
            


            <Text>{status.isBuffering && 'loading...' }</Text>

            <Text style={{paddingTop: 250,paddingLeft:20}}>{loading && 'loading...' }</Text>
          </View>

        )}
        
        
      </PagerView>

      
  ); 
}

class EmojiContainer extends React.Component {
      constructor() {
        super();

        this.yAnimation = this.state.position.interpolate({
          inputRange: [negativeEndY, 0],
          outputRange: [animationEndY, 0]
        });

        this.opacityAnimation = this.yAnimation.interpolate({
          inputRange: [0, animationEndY],
          outputRange: [1, 0]
        });

        this.scaleAnimation = this.yAnimation.interpolate({
          inputRange: [0, 15, 25],
          outputRange: [0, 1.4, 1],
          extrapolate: 'clamp'
        });

        this.xAnimation = this.yAnimation.interpolate({
          inputRange: [0, animationEndY/5, animationEndY/3, animationEndY/2, animationEndY],
          outputRange: [0, 25, 15, 0, 10]
        });

        this.rotateAnimation = this.yAnimation.interpolate({
          inputRange: [0, animationEndY/6, animationEndY/3, animationEndY/2, animationEndY],
          outputRange: ['0deg', '-20deg', '0deg', '20deg', '0deg']
        })

      }

      state = {
        position: new Animated.Value(0)
      };

      static defaultProps = {
        onComplete(){}
      }

      componentDidMount(){
        
    
        Animated.timing(this.state.position, {
          duration: 1000,
          toValue: negativeEndY,
          easing: Easing.ease,
          useNativeDriver: true
        }).start(this.props.onComplete);
      }

      getEmojiStyle(){
        return{
          transform: [
            {translateY: this.state.position},
            {scale: this.scaleAnimation}, 
            {translateX: this.xAnimation},
            {rotate: this.rotateAnimation}
          ],
          opacity: this.opacityAnimation
        }
      }
  
  render() {
      return (
        <Animated.View style={[styles.emojiContainer, this.getEmojiStyle(),this.props.style]}>
        <Emoji />
      </Animated.View>
              
      )
  }
  }



const Emoji = props => (

  <View {...props} style={[styles.emojiContainer]}>
    <Image uri={ 'https://writeshar.s3.amazonaws.com/profileImages/44.png' } name="emoji" style={styles.emoji2}/>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  vView:{
    flex: 1,
    
  },
  fackContent: {
    height:850,
    backgroundColor: '#CCC',
    paddingTop: 250,
    alignItems: 'center',
  },
  nameUsername: {
    flexDirection: "column",
    
  },
  theText: {
    marginLeft:7,
    marginTop:4,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
    shadowOpacity: 0.50,
    textShadowColor: 'black',
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "flex-start",
    flexWrap: "wrap",
    position: 'absolute',
    top:90
  },
  profileImage: {
    marginLeft:10,
    width: 42,
    height: 42,
    borderRadius: 100,
    overflow: "hidden",
  },
  userImage:{
    width: 42,
    height: 42,
    borderRadius: 100,
    overflow: "hidden",
  },
  emoji:{
    width: 42,
    height: 42,
    overflow: "hidden",
  },
  reaction: {
    borderRadius: 100,
    borderColor: '#8f8f8f',
    borderWidth:1,
    marginLeft: 8,
    width:48,
    padding:2,
  },
  postInfo:{
    flex: 1,
    flexDirection: "column-reverse",
    flexWrap: "wrap",
    position: 'absolute',
    bottom:100
  },
  pagerView: {
    marginTop: -80,
    flex: 1,
  },
  bar:{
    transform: [{ rotate: '-90deg' }],
    color:'#ffcc33',

  },
  hide:{
    display: 'none'
  },
  postInfoViews:{
    backgroundColor: 'rgba(255,255,255,.3)',
    bottom:145,
    borderRadius:10,
    flexDirection: "row",
    marginLeft:60,
    marginBottom:60
  },
  postInfoViewsText:{
    paddingTop:3,
  },
  theposterStyle:{
    width:1
  },


  emojiContainer:{
    position:'absolute',
    bottom:42,
    backgroundColor:"transparent",
    right:0,
    marginRight:0
  },
  emoji2:{
    width:25,
    height:25,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'transparent'
  }


});
