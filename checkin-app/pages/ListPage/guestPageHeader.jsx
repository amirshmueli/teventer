import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Switch,
  keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

const GuestPageHeader = ({
  getter,
  setter,
  sphrase,
  max,
  current,
  event,
  pholder = "Guest name",
}) => {
  const [phrase, setPhrase] = useState("");
  const date = () => {
    const d = new Date(event.StartTime);
    var options = { month: "short", day: "2-digit" };
    return String(d.toLocaleDateString("en-US", options));
  };
  return (
    <View style={styles.design_container}>
      <View style={styles.header_container}>
        <View style={styles.top_container}>
          <Text style={[styles.header_text, { fontFamily: "brandon" }]}>
            {event.Title}
          </Text>

          <Text
            style={[
              { fontSize: 18, alignSelf: "center", color: "white" },
              { fontFamily: "brandon" },
            ]}
          >
            {date()}
          </Text>
        </View>
        <View style={styles.mid_container}>
          <Text
            style={[
              {
                fontSize: max === "" || current === "" ? 18 : 24,
                alignSelf: "center",
                color: "white",
              },
              { fontFamily: "brandon" },
            ]}
          >
            {max === "" || current === ""
              ? "Loading stats..."
              : current + " | " + max}
          </Text>
          <Switch
            style={styles.switch}
            ios_backgroundColor="#05b"
            trackColor={{ false: "#05a", true: "#0ca" }}
            value={getter}
            onValueChange={() => setter(!getter)}
          />
        </View>
        <View style={styles.search_container}>
          <View style={styles.input_container}>
            <TouchableOpacity
              onPress={() => {
                console.log(phrase);
                if (phrase == "") {
                  sphrase({ refresh: true });
                }
                sphrase(phrase);
                setPhrase("");
              }}
            >
              <Ionicons
                name="search-outline"
                size={styles.input.fontSize + 5}
                color="#777"
              />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={phrase}
              onChangeText={(x) => {
                setPhrase(x);
              }}
              placeholder={pholder}
              placeholderTextColor="#777"
            />
            {phrase == "" ? (
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  sphrase("");
                  setPhrase("");
                }}
              >
                <Ionicons
                  name="refresh-outline"
                  color="#777"
                  size={styles.input.fontSize + 5}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  setPhrase("");
                }}
              >
                <Ionicons
                  name="close-outline"
                  color="#000"
                  size={styles.input.fontSize + 5}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default GuestPageHeader;

const styles = StyleSheet.create({
  design_container: {
    height: "20%",
    width: "100%",
    backgroundColor: "#fafafa",
  },
  header_container: {
    overflow: "hidden",
    height: "100%",
    width: "100%",
    backgroundColor: "#1e88e5",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  top_container: {
    paddingHorizontal: "5%",
    //backgroundColor: "purple",
    alignSelf: "center",
    width: "100%",
    height: "30%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header_text: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
  },

  mid_container: {
    paddingHorizontal: "5%",
    width: "100%",
    height: "25%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  search_container: {
    marginTop: 1,
    width: "100%",
    height: "45%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  input_container: {
    width: "90%",
    paddingHorizontal: "5%",
    height: "55%",
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row",
    paddingLeft: 10,
    alignItems: "center",
    backgroundColor: "#efefef",
    justifyContent: "flex-start",
  },
  input: {
    width: "90%",
    height: "100%",
    color: "#838383",
    paddingHorizontal: 5,
    fontSize: 18,
  },
  button: {
    backgroundColor: "dodgerblue",
    borderRadius: 20,
    overflow: "hidden",
    height: "50%",
    aspectRatio: 1,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  switch: {
    marginHorizontal: "1%",
    alignSelf: "center",
  },
});
