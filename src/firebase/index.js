import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyA_Bj9BosJrBmg2_VCQ46cDcS1h6fQko-8",
  authDomain: "rizky-baru.firebaseapp.com",
  databaseURL: "https://rizky-baru.firebaseio.com",
  projectId: "rizky-baru",
  storageBucket: "rizky-baru.appspot.com",
  messagingSenderId: "953755157111",
  appId: "1:953755157111:web:4556fc6ba8e69621ab7c72",
  measurementId: "G-84VV6MQRFQ",
};
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const auth = firebase.auth();
export const functions = firebase.functions();
