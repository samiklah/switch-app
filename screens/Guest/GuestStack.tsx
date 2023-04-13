
import React, { useContext, useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Camera } from 'expo-camera';
import { AuthContext } from "../../components/AuthProvider";
import Detector from '../../components/Detector';
import { StyleSheet, Button, Text, View,TextInput } from "react-native";
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
//import { NavigationContext } from "@react-navigation/core";
import { Image } from "react-native-expo-image-cache";
 
const Stack = createStackNavigator();

function LoginScreen({ navigation }) {
  const { login, error } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      { error &&
        <Text style={{ color: 'red', marginBottom: 24 }}>{ error }</Text>
      }
      <Text style={styles.lable}>Username:</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setUsername(text)}
        placeholder="Username"
        textContentType="username"
        autoCapitalize = 'none'
        textAlign='center'
        placeholderTextColor= 'grey' 
      />
      <Text style={styles.lable}>Password:</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setPassword(text)}
        placeholder="Password"
        secureTextEntry={true}
        textAlign='center'
        placeholderTextColor= 'grey' 
      />
      <Button
        title="Log In"
        onPress={() => login(username, password)}
      />
      <Text style={{ marginTop: 150 }}>You don't have an account?</Text>
      <Button
        title="Sign Up"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
}

function RegisterScreen({ navigation }) {
  const { register, error } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom:50 }}>
      { error &&
        <Text style={{ color: 'red', marginBottom: 24 }}>{ error }</Text>
      }
      <Text style={styles.lable}>Name:</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setName(text)}
        placeholder="Name"
        textContentType="name"
        textAlign='center'
        placeholderTextColor= 'grey' 
      />
      <Text style={styles.lable}>Username:</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setUsername(text)}
        placeholder="Username"
        textContentType="username"
        autoCapitalize = 'none'
        textAlign='center'
        placeholderTextColor= 'grey' 
      />
      <Text style={styles.lable}>Password:</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setPassword(text)}
        placeholder="Password"
        secureTextEntry={true}
        textAlign='center'
        placeholderTextColor= 'grey' 
      />
      <Button
        style={styles.actionButton}
        title="Sign Up"
        onPress={() => register(name, username, password)}
      />
      <Text style={{ marginTop: 150 }}>Do you have an account?</Text>
      <Button
        title="Log In"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}








interface Face {
  // define properties of a face object
  smilingProbability: number;
}

interface Props {
 // onFacesDetected: ({ faces }: { faces: Face[] }) => void;
  navigation: any;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {

  const [hasPermission, setHasPermission] = useState(null);
  //const [predictions, setPredictions] = useState(null);
  const [img, setImg] = useState("https://writeshar.s3.amazonaws.com/profileImages/1.png");

  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [smileProbability, setSmileProbability] = useState(100);
  const [face, setFace] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);


  const askPromission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
  };
  

  const handleFacesDetected = ({ faces }) => {
    setFace(faces[0])
    const face = faces[0];
    if (face) {
      setSmileProbability(face.smilingProbability);
      if (face.smilingProbability > 0.4) {
        
        setIsFaceDetected(true);
        setImg("https://writeshar.s3.amazonaws.com/profileImages/2.png");
        setTimeout(() => navigation.navigate('Register'), 1500);
      }
    }
  };


  i18n.translations = {
    en: { welcome: 'Smile To Open The App' },
    ar: { welcome: 'أبتسم لفتح التطبيق' },
  };

  i18n.defaultLocale = "en";
  i18n.locale = Localization.locale;
  i18n.fallbacks = true;


  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>No access to camera</Text>
      <Button title="Allow Access" onPress={askPromission} />  
      </View>
      );
  }
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

      <Image uri={ img } style={styles.mainImoji}/>
      <Text style={{marginTop:20}}>{i18n.t('welcome')}</Text>
      <Detector onFacesDetected={handleFacesDetected} />
      {/* <Button title="Go back" onPress={() => navigation.goBack()} /> */}
    </View>
  );
}

export const GuestStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} 
      options={{
        headerLeft: null,
        gesturesEnabled: false,
        title: 'Sign Up',
      }}
      />
      <Stack.Screen name="Login" component={LoginScreen} 
      options={{
        headerLeft: null,
        gesturesEnabled: false,
        title: 'Log In',
      }}
      />
      
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImoji: {
    width: 50,
    height: 50,
  },
  input:{ height: 50, width: 300, borderColor: 'gray', borderWidth: 1, padding: 8, borderRadius:5,backgroundColor: 'white', marginBottom:20 },
  lable:{
    alignSelf:'flex-start',
    marginLeft: 40,
   
  },
  actionButton:{
  }
});