import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { get_gstlst, get_token } from "../../Server";
import GuestTab from "./guestTab";
import React, { useState, useEffect } from "react";
import GuestPageHeader from "./guestPageHeader";
import { getStats } from "../../Server";
import { useSelector, useDispatch } from "react-redux";
import * as ActionTypes from "../../store/actionTypes";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
//
//
//
function PageList({ navigation }) {
  const { user, tickets, event, token } = useSelector((state) => {
    return state;
  });
  const dispatch = useDispatch();
  const range = 10;
  const [offset, setOffset] = useState(0);
  const [guests, setGuests] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [listLength, setListLength] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [focus, setFocus] = useState(true);
  const current = tickets.current;
  const capacity = tickets.capacity;

  useEffect(() => {
    console.log(
      `\n\n==========NEW===[${event.ID}]===== ` +
        String(new Date().getMinutes()) +
        ":" +
        String(new Date().getSeconds())
    );
    if (event.eventId === undefined) return;
  }, []);

  useEffect(() => {
    if (focus) {
      console.log(`\n\n==[${event.Title}]===========[${event.ID}]===== `);
      console.log(">>> LIST: REQUESTING STATS ON " + event.title);
      //getStats({ user, event }, dispatch, token);
      setArrived(false);
      setPhrase(false);
      newSearch();
    }
  }, [focus]);

  useFocusEffect(
    React.useCallback(() => {
      setFocus(true);
      return () => setFocus(false);
    }, [])
  );

  useEffect(() => {
    console.log(">>> arrived changed {" + arrived + "}");
    newSearch();
  }, [arrived]);

  useEffect(() => {
    Keyboard.dismiss();
    if (phrase == "") {
      setArrived(false);
      return;
    }
    console.log(">>> phrase changed [" + phrase + "]");
    newSearch();
  }, [phrase]);

  useEffect(() => {
    if (offset != 0) return;
    getGuests();
  }, [offset]);

  const setCurrent = (x) => {
    dispatch({
      type: ActionTypes.setDynamicTickets,
      payload: x,
    });
  };

  const newSearch = () => {
    setGuests([]);
    setOffset(0);
    setListLength(0);
  };

  const getGuests = async (time = 0) => {
    let valid = arrived;
    while (true && time < 3) {
      console.log("\nusers time: ", time);
      setIsLoading(true);
      let [data, error] = await get_gstlst(
        user.username,
        token,
        event.ID,
        offset,
        range,
        arrived ? 1 : 0,
        phrase.refresh === true ? "" : phrase
      );
      if (!handleGuests(data, error, valid)) {
        time++;
        continue;
      }
      console.log("### got guests 😃");
      break;
    }
    setIsLoading(false);
  };

  const handleGuests = (data, error, valid) => {
    console.log(data);

    if (error) {
      console.log(error);
      return false;
    }
    if (valid != arrived) {
      console.log("!!! guests are invalid 😢");
      return;
    }
    setListLength(data.Max);

    const list = data.tickets;
    setOffset(offset + range);
    setGuests([...guests, ...list]);
    return true;
  };

  // renderers:

  const renderLoader = () => {
    return isLoading ? (
      <View style={styles.loaderStyle}>
        <ActivityIndicator size="large" color="#aaa" />
      </View>
    ) : null;
  };

  const renderItem = ({ item }) => {
    if (item.end == true) return null;
    return (
      <GuestTab
        item={item}
        state={arrived}
        setNumber={setCurrent}
        username={user.username}
        password={user.password}
      />
    );
  };

  const renderEndFooter = () => {
    return (
      <View
        style={{
          width: "100%",
          height: 20,
          backgroundColor: "#ddd",
          justifyContent: "center",
          alignItems: "center",
        }}
      ></View>
    );
  };

  const Devider = () => {
    return (
      <View
        style={{
          width: "100%",
          height: 1,
          backgroundColor: "#555",
        }}
      ></View>
    );
  };

  const refresh = () => {
    console.log("refresh pressed");
    setPhrase("");
  };

  const renderUsers = () => {
    return guests.length == 0 ? (
      <View style={styles.err_container}>
        <Text style={[styles.users_text, { fontFamily: "brandon" }]}>
          {guests.length == 0 && isLoading
            ? "Searching Guests"
            : "No Guests Found"}
        </Text>
        {!isLoading ? (
          <TouchableOpacity style={styles.refresh_button} onPress={refresh}>
            <Ionicons
              name="refresh-outline"
              color="#1e88e5"
              size={styles.refresh_text.fontSize}
            />
          </TouchableOpacity>
        ) : (
          renderLoader()
        )}
      </View>
    ) : (
      <FlatList
        style={styles.flat_list_container}
        data={guests}
        onEndReached={() => {
          getGuests();
        }}
        keyExtractor={(ticket) => ticket.ID}
        ListFooterComponent={() => {
          return offset >= listLength ? renderEndFooter() : renderLoader();
        }}
        onEndReachedThreshold={0.4}
        renderItem={renderItem}
        ItemSeparatorComponent={Devider}
      />
    );
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: "#1e88e5",
        alignItems: "center",
        height: "100%",
      }}
    >
      <GuestPageHeader
        sphrase={setPhrase}
        setter={setArrived}
        getter={arrived}
        max={tickets.capacity}
        current={tickets.current}
        event={event}
      />
      <SafeAreaView style={styles.bottom_container}>
        {renderUsers()}
      </SafeAreaView>
    </SafeAreaView>
  );
}

export default PageList;
const styles = StyleSheet.create({
  flat_list_container: {
    height: "75%",
    width: "100%",
    backgroundColor: "#fafafa",
  },
  header_container: {},

  bottom_container: {
    backgroundColor: "#fafafa",
    height: "80%",
    width: "100%",
  },
  users_text: {
    fontSize: 32,
    color: "#1e88e5",
    fontWeight: "bold",
  },
  loaderStyle: {
    marginTop: "5%",
  },
  refresh_button: {
    marginTop: "15%",
    justifyContent: "center",
    alignItems: "center",
  },
  refresh_text: {
    color: "white",
    fontFamily: "brandon",
    fontSize: 30,
  },
  err_container: {
    alignSelf: "center",
    marginTop: "50%",
    //
    alignItems: "center",
    justifyContent: "center",
  },
});
