import React, {Component} from 'react';
import { Alert, StyleSheet, ScrollView, ActivityIndicator, Image, View, TouchableOpacity, Text, TextInput } from 'react-native';
import { List, ListItem, Button } from 'react-native-elements';
import firebase from '../Firebase';
import styles from './style';
import colors from './colors';


class SignIn extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Sign In/Up',
    }
  }

  constructor() {
    super();
    this.state = {
      email: null,
      password: null,
      password2: null, // for new user signup password confirmation
      signIn: true, // state for sign in v. logon
      login: false, // state for logged in user
      justSignedUp: false, // if new user add their username to the userData
    }
    this.signIn = this.signIn.bind(this);
  }


  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        console.log("Auth state is logged in Now!");
        this.setState({login: true, email: user.email});
        // if the user just signed up then add their branch to the database
        // give them a profile under userData and set hasD to false
        if(this.state.justSignedUp){
          firebase.database().ref('userData/' + user.uid + '/Profile').update(
            {'hasD': false}
          ).catch(error => {
            console.log('Failed to add user: ' + error.code + error.message);
          });
          this.setState({justSignedUp: false});
        }
        //this.props.navigation.navigate('Home');
      } else {
        // User is signed out.
        console.log("Auth state is logged out now!");
        //this.setState({login: false});
        // ...
      }
    });

  }

  //unsubscribe from the firebase auth listener
  componentWillUnmount(){
    //firebase.auth().off();
    if (this.unsubscribe){
      this.unsubscribe();
    }
  }

  // updates text input fields
  updateTextInput = (text, field) => {
    const state = this.state;
    state[field] = text;
    this.setState(state);
  }

  // check it has the form of an email address
  // from : https://stackoverflow.com/questions/43676695/email-validation-react-native-returning-the-result-as-invalid-for-all-the-e
  emailValidate = (text) => {
    // console.log(text);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
    if (reg.test(text) === false) {
      // console.log("Email is Not Correct");
      return false;
    }
    else {
      // console.log("Email is Correct");
      return true;
    }
  }


  // signup a new user
  signUp() {

    if (this.state.password == this.state.password2 && this.emailValidate(this.state.email)){
      console.log("passwords matched and email is valid.");
      // call the firebase sign in action
      firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("ERROR adding user:" + error.code);
        console.log(error.message);
        Alert.alert(error.message);
      });
      this.setState({justSignedUp: true});
    }
    else {
      console.log("Passwords do not match or email is invalid.");
    }
  }

  // signin a user, give alerts for failed attempts
  signIn() {
    if(this.emailValidate(this.state.email) && (this.state.password != null)) {
      firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if(error.code == 'auth/user-not-found') {
          Alert.alert("No known user with this email address.");
          this.setState({password: null});
        }
        else if (error.code == 'auth/wrong-password') {
          Alert.alert("Incorrect email address and password combination.");
          this.setState({password: null});
        }
        else {
          Alert.alert("There was an error signing you in.");
          this.setState({password: null});
        }
        console.log("ERROR adding user: " + error.code);
        console.log(error.message);
      });
      console.log("Sign in successful!");
    }
    //this.props.navigation.push('Home');
  }

  logOut() {
    firebase.auth().signOut().then(()=>{console.log("Signed Out");},
      (error) => { console.log("Sign Out error : " + error.code + error.message);});
  }


  render() {
    //this.props.navigation.push('Home');
    let inUpOut; // buttons for sign in and up or for logout and back
    let form; // input for signing in or up

    // if logged in give logout and homescreen links
    // this view can likely be removed and the user can be directed straight to the homescreen
    if (this.state.login) {
      // this.props.navigation.push('Home'); // throws warning regarding changes during state transition
       inUpOut = (
         <View>
          <View style={styles.tripleToggle}>
            <TouchableOpacity style={styles.button} onPress={()=>this.logOut()}>
              <Text style={styles.buttonNoFlexText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={()=>this.props.navigation.navigate('Home')}>
              <Text style={styles.buttonNoFlexText}>Home Screen</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <Text style={styles.smallText}>Hello!</Text>
            <Text style={styles.smallText}>Welcome to the Serta Simmons children's smart mattress testing app.
              Thank you for signing in. Visit the homescreen or logout above.
            </Text>
          </View>
        </View>);
    }
    else { // logged out, give sign in and sign up options
      inUpOut = (
        <View style={styles.tripleToggle}>
          <TouchableOpacity
            onPress = {()=> this.setState({signIn: true})}
            style={(this.state.signIn ? styles.buttonSelected : styles.button)}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress = {()=> this.setState({signIn: false})}
            style={(this.state.signIn ? styles.button : styles.buttonSelected)}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      );

      form = (this.state.signIn ? (
        <View style={styles.form}>
          <Text style={styles.smallText}>Hello!</Text>
          <Text style={styles.smallText}>Welcome to the Serta Simmons children's smart mattress testing app.
            Please sign in if you have an account or sign up if you are joining.
          </Text>
          <TextInput
            placeholder={'Email'}
            placeholderTextColor={colors.tabText}
            value={this.state.email}
            onChangeText={(text) => this.updateTextInput(text, 'email')}
            style={styles.textInput}
          />
          <TextInput
            placeholder={'Password'}
            placeholderTextColor={colors.tabText}
            secureTextEntry={true}
            value={this.state.password}
            onChangeText={(text) => this.updateTextInput(text, 'password')}
            style={styles.textInput}
          />
          <TouchableOpacity style={styles.buttonNoFlex} onPress={()=>this.signIn()}>
            <Text style={styles.buttonNoFlexText}>Sign In</Text>
          </TouchableOpacity>
        </View>)
        :
        (
          <View  style={styles.form}>
            <Text style={styles.smallText}>Hello!</Text>
            <Text style={styles.smallText}>Welcome to the Serta Simmons children's smart mattress testing app.
              Please sign in if you have an account or sign up if you are joining. When signing up please pick
              a password that is at least 8 characters and includes both upper and lowercase letters.
            </Text>
            <TextInput
              placeholder={'Email'}
              placeholderTextColor={colors.tabText}
              value={this.state.email}
              onChangeText={(text) => this.updateTextInput(text, 'email')}
              style={styles.textInput}
            />
            <TextInput
              placeholder={'Password'}
              placeholderTextColor={colors.tabText}
              secureTextEntry={true}
              value={this.state.password}
              onChangeText={(text) => this.updateTextInput(text, 'password')}
              style={styles.textInput}
            />
            <Text style={styles.smallText}>Please re-enter your password:</Text>
            <TextInput
              placeholder={'Password'}
              placeholderTextColor={colors.tabText}
              secureTextEntry={true}
              value={this.state.password2}
              onChangeText={(text) => this.updateTextInput(text, 'password2')}
              style={styles.textInput}
            />
            <TouchableOpacity style={styles.buttonNoFlex} onPress={()=>this.signUp()}>
              <Text style={styles.buttonNoFlexText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
      ));
    }

    return (
      <View style={styles.container}>
        {inUpOut}
        <View style={styles.centerContainer}>
          {form}
        </View>
      </View>
    )
  }

}

export default SignIn;
