import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  TextInput,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { get_token } from "../../Server";
import * as ActionTypes from "../../store/actionTypes";
import Ionicons from "react-native-vector-icons/Ionicons";

const PageLogin = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state);
  const [isLogged, setIsLogged] = useState(token != "");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState(user.password);
  const [sent, setSent] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setUsername(username.toLowerCase());
    if (!isLogged) return;
    console.log("#### Login Success ✔️");
    navigation.navigate("App");
  }, [isLogged]);

  const login = async () => {
    if (username === "" || password === "") return;
    if (isLogged) setIsLogged(false);
    Keyboard.dismiss();
    setSent(true);
    setIsLoading(true);
    setTimedOut(false);

    let [data, error] = await get_token(username, password);
    setIsLoading(false);
    token_recieved(data, error);
  };

  const token_recieved = (data, error) => {
    if (error) {
      if (error === "Connection Error") setTimedOut(true);
      console.log("Login Failed ❗");
      console.log(error);
      return;
    }
    const token = data.token;
    console.log(`>>> Recieved Token [${token}]`);
    dispatch({
      type: ActionTypes.setToken,
      payload: token,
    });
    dispatch({
      type: ActionTypes.setCredentials,
      payload: {
        username: username.toLowerCase(),
        password: password,
      },
    });
    setIsLogged(true);
  };

  const renderLoader = () => {
    return isLoading ? (
      <View style={styles.loaderStyle}>
        <ActivityIndicator size="small" color="#aaa" />
      </View>
    ) : null;
  };

  const renderError = () => {
    if (sent && !isLoading && !isLogged) {
      return (
        <View
          style={{
            width: "100%",
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "5%",
          }}
        >
          <Text
            style={[
              styles.wrong_creds_text,
              { fontSize: 16, fontWeight: "bold" },
            ]}
          >
            {timedOut ? "Connection Error" : "Wrong Password"}
          </Text>
          {!timedOut ? null : (
            <Text
              style={[
                styles.wrong_creds_text,
                { fontSize: 14, marginTop: "1%" },
              ]}
            >
              Please try again.
            </Text>
          )}
        </View>
      );
    } else {
      return null;
    }
  };

  return (
    <KeyboardAvoidingView>
      <View style={styles.base_container}>
        <View style={styles.top_design}>
          <View style={styles.header_container}></View>
        </View>
        <View style={styles.bottom_container}>
          <View style={styles.placement} />

          <View style={styles.input_container}>
            <Ionicons name="person" size={20} color="#444444" />
            <TextInput
              placeholder="Event Operator"
              style={[styles.input, { fontSize: 20 }]}
              value={username}
              onChangeText={(data) => setUsername(data)}
            />
          </View>

          <View style={[styles.input_container, { marginTop: "5%" }]}>
            <Ionicons name="key" size={20} color="#444444" />
            <TextInput
              placeholder="Password"
              style={[styles.input, { fontSize: 20 }]}
              value={password}
              secureTextEntry={true}
              password={true}
              onChangeText={(data) => setPassword(data)}
            />
          </View>

          {renderError()}

          <TouchableOpacity
            style={[
              styles.submit_button,
              {
                height: styles.input_container.height,
                width: styles.input_container.width,
              },
            ]}
            onPress={() => login()}
          >
            <Text style={styles.submit_text}>Login</Text>
          </TouchableOpacity>

          {isLoading ? renderLoader() : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  base_container: {
    backgroundColor: "#1e88e5",
  },
  top_design: {
    height: "20%",
    backgroundColor: "#fefefe",
  },
  header_container: {
    borderBottomRightRadius: 35,
    borderBottomLeftRadius: 35,
    backgroundColor: "#1e88e5",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headline: {
    fontSize: 32,
  },
  placement: {
    height: "15%",
  },
  bottom_container: {
    alignItems: "center",
    backgroundColor: "#fefefe",
    height: "80%",
  },
  wrong_creds_text: {
    color: "red",
    width: "75%",
    textAlign: "center",
    fontFamily: "brandon",
  },
  input_container: {
    width: 330,
    height: 65,
    backgroundColor: "#eee",
    paddingHorizontal: 20,
    overflow: "hidden",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  input: {
    marginLeft: 10,
    fontWeight: "600",
    fontSize: 16,
    color: "#444",
    fontFamily: "brandon",
    width: "100%",
    //borderWidth: 3,
    //borderColor: "red",
  },
  submit_button: {
    alignSelf: "center",
    borderRadius: 20,
    marginTop: "10%",
    backgroundColor: "#1e88e5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  submit_text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "brandon",
  },
  loaderStyle: {
    marginTop: "5%",
  },
});

export default PageLogin;
