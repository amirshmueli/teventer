import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import react, { useEffect, useState } from "react";
import { remove_ticket, scan_ticket, ticket_maker } from "../../Server";
import { useSelector } from "react-redux";
import * as ActionTypes from "../../store/actionTypes";

const GuestTab = ({ item, state, setNumber }) => {
  const { user, token, tickets, event } = useSelector((state) => state);
  const { username } = user;
  const [pressed, setPressed] = useState(state);
  const [checkedIn, setCheckedIn] = useState(state ? "present" : "absent");
  const [isLoading, setIsLoading] = useState(false);
  const [icon, setIcon] = useState("person-add");
  const mainColor = "#1e88e5";
  const secColor = "#fff";

  const styles = StyleSheet.create({
    arrive_button: {
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: pressed ? secColor : mainColor,
      width: "20%",
      height: "80%",
      borderWidth: pressed ? 2 : 0,
      borderRadius: 10,
      borderColor: mainColor,
    },
    arrive_text: {
      alignSelf: "center",
      color: "blue",
    },
    big_text: {
      fontSize: 20,
      fontWeight: "bold",
      color: "black",
      fontFamily: "brandon",
    },
    small_text: {
      fontSize: 14,
      color: "black",
      fontWeight: "400",
      fontFamily: "brandon",
    },
    container: {
      width: "100%",
      height: 60,
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
      alignSelf: "center",
      overflow: "hidden",
      paddingVertical: "2%",
      paddingHorizontal: "3%",
      backgroundColor: "#fafafa",
    },
  });

  useEffect(() => {
    switch (checkedIn) {
      case "absent":
        setIcon("person-add");
        setPressed(false);
        break;
      case "already-present":
        setIcon("alert-circle");
        setPressed(true);
        break;
      case "changed-present":
        setIcon("checkmark-circle");
        setPressed(true);
        break;
      case "present":
        setIcon("person-remove");
        setPressed(true);
        break;
      case "gone":
        setIcon("close-circle");
        setPressed(false);
        break;
    }
  }, [checkedIn]);

  const guestPress = async () => {
    if (isLoading) return;
    setIsLoading(true);
    if (checkedIn != "absent" && checkedIn != "gone") {
      const [data, error] = await remove_ticket(
        username,
        token,
        item.EventRefer,
        item.ticketID
      );
      rm_ticket(data, error);
    } else {
      const [data, error] = await scan_ticket(
        username,
        token,
        item.EventRefer,
        item.ticketID
      );

      got_ticket(data, error);
    }
    setIsLoading(false);
  };

  const rm_ticket = (data, error) => {
    if (error) {
      return false;
    }
    console.log("procceed");
    let status = data.status;
    if (status == 200) {
      setNumber(-1);
      console.log("--- removed guest ❗");
      setCheckedIn("gone");
    } else {
      console.log("!!! could not remove guest ❗");
    }
    return true;
  };

  const got_ticket = (data, error) => {
    if (error) {
      return false;
    }
    handleResult(data);
  };

  const handleResult = (resp) => {
    setIsLoading(false);
    const status = resp.status;
    if (status == 300) {
      console.log("already here 😎");
      setCheckedIn("already-present");
    } else if (status == 200) {
      console.log("guest arrived 😺");
      setNumber(1);
      setCheckedIn("changed-present");
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.big_text}>
          {item.Name} {item.LastName}
        </Text>
        <Text style={styles.small_text}>{item.Email}</Text>
      </View>
      <TouchableOpacity
        style={styles.arrive_button}
        onPress={() => guestPress()}
      >
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Ionicons
            name={icon}
            color={pressed ? mainColor : secColor}
            size={styles.big_text.fontSize}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default GuestTab;
