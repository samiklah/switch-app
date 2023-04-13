import React, { useContext, useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, SafeAreaView , Animated, Easing, TouchableOpacity, Dimensions, Alert } from "react-native";
import { SimpleLineIcons , MaterialCommunityIcons, FontAwesome} from "@expo/vector-icons";
import { enableScreens } from 'react-native-screens';
import Detector from '../../components/Detector';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from "../../components/AuthProvider";
import { Video, Audio } from 'expo-av';
import axios from 'axios';
import { Image } from "react-native-expo-image-cache";

enableScreens();

let {width:screenWidth,height:screenHeight}=Dimensions.get('window');

const animationEndY = Math.ceil(screenHeight * 0.25);
const negativeEndY = animationEndY * -1;

let emojiCount = 1;

function getRandomNumber(min, max) {
  return Math.random()*(max-min)+min
}

export const PostScreen = ({ route, navigation: { navigate } }) => {
    const { user, logout } = useContext(AuthContext);
    const screenIsFocused = useIsFocused();
    const video = useRef(null);
    const isMountedd  = useRef(false);
    const [status, setStatus] = useState([]);
    const [emoji,setEmoji]=useState('https://writeshar.s3.amazonaws.com/profileImages/1.png');
    const [emojis, setEmojis] = useState([]);
    const [predictions, setPredictions] = useState(null);
    useEffect(() => {
      isMountedd.current = true;
      return () => isMountedd.current = false;
    }, []);

    const addEmoji = () => {
      if (isMountedd.current){
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
    }
  
    removeEmoji = id => {
      if (isMountedd.current){
        setEmojis(emojis => emojis.filter(x => {
          return x.id !== id
        }));
      }
    }
  

    useEffect(() => {
      (async () => {
        
      if (predictions > 0.55) {
        addEmoji();
      }
      
      })();
    }, [status]);
      
    

    const handleFacesDetected = ({ faces }) => {
        const face = faces[0];
          if (face) {
          
             if (isMountedd.current){
              if (face.smilingProbability > 0.05 && face.smilingProbability <= 0.55) {
                setEmoji('https://writeshar.s3.amazonaws.com/profileImages/3.png');
               }
               
               if(face.smilingProbability > 0.55) {
                setEmoji('https://writeshar.s3.amazonaws.com/profileImages/44.png');
                addEmoji();
               }
               if (face.smilingProbability <= 0.05) {
                setEmoji('https://writeshar.s3.amazonaws.com/profileImages/1.png');
               }
               setPredictions(face.smilingProbability);
             }
             
          }
          
      };

    const showAlert = () =>
      Alert.alert(
        "Alert Title",
        "My Alert Msg",
        [
            {
                text: "Delete",
                onPress: () => deletePost(),
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

      const deletePost = () => {
        axios.delete(`/api/delete/${route.params.post.id}`)
        .then(response => {
            navigate('Profile');
        })
        .catch(error => {
          alert(error.data);
        })
      }
    
    
    return (
        <SafeAreaView style={styles.container}>
                 
                <Detector onFacesDetected={handleFacesDetected} />

                    <Video 
                        ref={video}
                        source={{uri: 'https://writeshar.s3.amazonaws.com/posts/'+route.params.post.uri}}                   
                        style={{height:screenHeight,marginTop:-65}}
                        resizeMode="contain"
                        onPlaybackStatusUpdate={status => setStatus(() => status)}
                        shouldPlay={true}
                        posterSource={{uri : 'https://writeshar.s3.amazonaws.com/posts/load.gif'}}
                        usePoster={true}
                        isLooping={true}
                    />
                    {route.params.post.auth &&
                      <View style={styles.userInfo}>
                          <TouchableOpacity onPress={() => showAlert()}>
                              <SimpleLineIcons style={styles.theText} name="options-vertical" size={24} color="white" />
                          </TouchableOpacity>  
                      </View>
                    }
                    
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
                          <MaterialCommunityIcons name="eye-outline" size={22} color="black" /><Text  style={styles.postInfoViewsText}> : {route.params.post.views*12+1 } |  </Text>
                          <FontAwesome name="smile-o" style={{marginLeft:5}}  size={22} color="black" /><Text  style={styles.postInfoViewsText}> : {route.params.post.score*100} </Text> 
                        </View>
                        
                    </View>

                    <Text>{status.isBuffering && 'loading...' }</Text>
                
        </SafeAreaView>
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
      outputRange: ['0deg', '0deg', '-20deg', '20deg', '0deg']
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
        backgroundColor: "#FFF",
    },
    profileImage: {
        marginLeft:10,
        width: 42,
        height: 42,
        borderRadius: 100,
        overflow: "hidden",
      },
      userInfo: {
        flex: 1,
        alignSelf:'flex-end',
        position: 'absolute',
        top:15,
        right:10
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
      nameUsername: {
        flexDirection: "column",
        
      },
      theText: {
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 5,
        shadowOpacity: 0.50,
        textShadowColor: 'black',
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
        bottom:5
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
        backgroundColor: "#41444B",
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



/*
<FontAwesome name="smile-o" style={{marginLeft:5}}  size={22} color="black" /><Text  style={styles.postInfoViewsText}> : {Math.round(route.params.post.score*100)/100*100} </Text>
*/