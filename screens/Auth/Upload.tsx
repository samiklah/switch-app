import React, { useContext, useState, useEffect } from "react";
import useStateRef from 'react-usestateref';
import { AuthContext } from "../../components/AuthProvider";
import { Button, Text, View} from "react-native";
import axios from 'axios';
import { enableScreens } from 'react-native-screens';
import * as ImagePicker from 'expo-image-picker';
import * as Localization from 'expo-localization';
import { RNS3 } from "react-native-aws3";
// import { createStackNavigator } from "@react-navigation/stack";
import * as VideoThumbnails from 'expo-video-thumbnails';
// import { ProfileScreen } from "./Profile";
import ProgressBar from 'react-native-progress/Bar';

enableScreens();

export const UploadScreen = () => {
  const { user } = useContext(AuthContext);
  // const [ videoUri, setVideoUri ] = useState();
  const [ error, setError ] = useState();
  const [ language, setLanguage ] = useState();
  // const [ videoThumbnail, setVideoThumbnail ] = useState();
  const [loading,setLoading,loadingRef]=useStateRef(false);
  // const [thumnail,setThumnail,thumnailRef]=useStateRef('');
  const [ progress, setProgress ] = useState(0.01);
  //const [ url, setUrl ] = useState();

  useEffect(() => {
    (async () => {
      
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
      axios.defaults.baseURL = 'https://backend-6qjkq.ondigitalocean.app'; 
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;

    

    let tow = Localization.locale.split('-');
    setLanguage(tow[0]);

    })();
  }, []);

  useEffect(() => {
    console.log('error'+error);
  }, [error]);

  const generateUUID = () => {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
       return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid; 
  }

  const _pickVideo = async () => {
    
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: 'Videos',
      durationLimit: 20,
      thumbnail: true,
    });
    console.log(result);
    if (!result.cancelled) {
      if (result.duration < 20000) {
        
      
        console.log(result);
        setLoading(true);
        const uriParts = result.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        const name = generateUUID();
        const name2 = generateUUID();

        const file = {
          uri: result.uri,
          name: name+'.'+fileType,
          type: result.type+'/'+fileType
        };

        

        if (result.type == "Video" || result.type == "video") {
          try {
            const  tempUri  = await VideoThumbnails.getThumbnailAsync(
              result.uri,
              {time: result.duration/2,quality: 0.5}
            );
            // const data = new FormData();
            // data.append('user_id', user.id);
            // data.append('uri',name+'.'+fileType);
            // data.append('type',result.type);
            // data.append('country',Localization.region);
            // data.append('language',language);
            // data.append('device_name','mobile');
            // data.append('thumbnail',
            //     {
            //       uri:tempUri.uri,
            //       name:name2+'.jpg',
            //       type:'image/jpg'
            //     });
            //     console.log(data);
            // axios.post('/api/add/post', data)
            // .then(response => {
            //   setLoading(false);
            //   setProgress(0.01);
            //   setError(null);
            //   alert('Your post is uploaded successfully!');
            // })
            // .catch(error => {
            //   const key = Object.keys(error.response.data.errors)[0];
            //   console.log(error.response.data.errors[key][0]);
            // });
          } catch (error) {
            console.log(error);
          }
        }
        
        const options = {
          keyPrefix: "posts/",
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
              setProgress(0.01);
              setError(null);
              alert('Your post is uploaded successfully!');
            
          }
        })
        .catch(error => {
          console.log(error);
        });

        }else{
          alert('Video limit is 20 seconds');
        }
      }

    
    
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

      <Button
          title="Upload"
          onPress={_pickVideo}
          disabled={loadingRef.current}
        />
      <Text>{"\n"}{loadingRef.current ? 'Uploading...' : ' '}{"\n"}</Text>
      {loadingRef.current? 
           <ProgressBar progress={progress} width={200} />
          :
          <Text></Text>
          }
        
      {progress == 1 ? <Text>{"\n"}Wait a moment...</Text> : <Text></Text> }
    </View>
  );
}