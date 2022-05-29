import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
//
//
//

const TabEvent = ({ item, Event, SetEvent }) => {
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    if (Event === undefined) return;
    if (Event.ID != item.ID) {
      setPressed(false);
    }
  }, [Event]);

  useEffect(() => {
    if (!pressed) return;
    SetEvent(item);
  }, [pressed]);

  const date = () => {
    const d = new Date(item.StartTime);
    var options = {
      month: "short",
      day: "2-digit",
    };
    return String(d.toLocaleDateString("en-GB", options));
  };

  const self_pressed = () => {
    setPressed(true);
  };

  return (
    <TouchableOpacity
      style={[styles.tab_container, { borderWidth: pressed ? 2 : 0 }]}
      onPress={() => self_pressed()}
    >
      <Text style={[styles.text]}>{item.Title} </Text>
      <Text style={styles.date}>{date()}</Text>
    </TouchableOpacity>
  );
};

export default TabEvent;

const styles = StyleSheet.create({
  tab_container: {
    marginBottom: 15,
    alignSelf: "center",
    borderColor: "#04437a",
    height: 75,
    overflow: "hidden",
    width: "100%",
    backgroundColor: "#1e88e5",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    marginHorizontal: 20,
    color: "white",
    fontSize: 18,
  },
  date: {
    marginHorizontal: 20,
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
});
