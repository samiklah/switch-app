import React, { useState,useEffect } from 'react';
//import { AsyncStorage } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// interface AuthContext {

// }

type AuthContextType = {
  user: any;
  setUser: React.Dispatch<any>;
  error: any;
  register: (name: string, username: string, password: string) => void;
  login: (username: any, password: any) => void;
  updateUser: (newImg: string) => void;
  logout: () => void;
}

export const AuthContext = React.createContext<null | AuthContextType>(null);

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  /**
   * make hard coded data examples of users
   * 
   */

  const users = [
    {
      id: 1,
      username: 'johndoe',
      name: 'John Doe',
      password: 'password',
      following: [2, 3],
      followers: [2, 3],

    },
    {
      id: 2,
      username: 'sami',
      name: 'Sami',
      password: 'password',
      following: [1, 3],
      followers: [1, 3],
    },
    {
      id: 3,
      username: 'jane',
      name: 'Jane',
      password: 'password',
      following: [1, 2],
      followers: [1, 2],
    },
    {
      id: 4,
      username: 'ali',
      name: 'Ali',
      password: 'password',
      following: [1, 2],
      followers: [1, 2],
    }
  ]


  useEffect(() => {
    (async () => {
    axios.defaults.baseURL = 'https://backend-6qjkq.ondigitalocean.app'; 

    })();
  }, []);

  return ( 
    <AuthContext.Provider
      value={{
        user,
        setUser,
        error,
        register: (name: string, username: string, password: string) => {


          // creact a user and add to the users array

          const newUser = {
            id: users.length + 1,
            username,
            name,
            password,
            following: [],
            followers: [],
          }

          users.push(newUser);


          // axios.post('/api/sanctum/register', {
          //   name,
          //   username,
          //   password,
          //   device_name: 'mobile',
          // })
          // .then(response => {
          //   console.log(response);
          //   const userResponse = {
          //     username: response.data.user.username,
          //     name: response.data.user.name,
          //     id: response.data.user.id,
          //     token: response.data.token,
          //     following: [],
          //   }
          //   setUser(userResponse);
          //   setError(null);
          //   SecureStore.setItemAsync('user', JSON.stringify(userResponse));
          // })
          // .catch(error => {
          //   //console.log(error);
          //   const key = Object.keys(error.response.data.errors)[0];
          //   setError(error.response.data.errors[key][0]);
          //   //setError('All fields are required, the password must be more than 8 characters, choose a unique username');
          // })
        },
        login: (username, password) => {

          const theuser = users.filter(user => user.username === username && user.password === password);

          if(theuser.length > 0) {
            const userResponse = {
              username: theuser[0].username,
              name: theuser[0].name,
              id: theuser[0].id,
              following: theuser[0].following,
              followers: theuser[0].followers,
            }
            setUser(userResponse);
            setError(null);
            SecureStore.setItemAsync('user', JSON.stringify(userResponse));
          }

          // axios.post('/api/sanctum/token', {
          //   username,
          //   password,
          //   device_name: 'mobile',
          // })
          // .then(response => {
          //   //setFollowingd(response.data.following);
          //   let followingd = null;
          //   followingd = response.data.following.map(follow => follow.pivot.user_two);
          //   const userResponse = {
          //     username: response.data.user.username,
          //     name: response.data.user.name,
          //     img: response.data.user.img,
          //     id: response.data.user.id,
          //     following: followingd,
          //     token: response.data.token,
          //   }
          //   setUser(userResponse);
          //   setError(null);
          //   SecureStore.setItemAsync('user', JSON.stringify(userResponse));
          // })
          // .catch(error => {
          //   const key = Object.keys(error.response.data.errors)[0];
          //   setError(error.response.data.errors[key][0]);
          //   //setError('Invalid username or password');
          // })
        },
        updateUser: (newImg) => {
          const userResponse = {...user, img: newImg}
          setUser(userResponse);
          setError(null);
          SecureStore.setItemAsync('user', JSON.stringify(userResponse));
        },
        logout: () => {
          // axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;

          // axios.post('/api/logout')
          // .then(response => {
          //   setUser(null);
          //   SecureStore.deleteItemAsync('user')
          // })
          // .catch(error => {
          //   console.log(error.response);
          // })
          setUser(null);
          SecureStore.deleteItemAsync('user')
        }
      }}>
      {children}
    </AuthContext.Provider>
  );
}
