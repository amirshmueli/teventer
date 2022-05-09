import React, { useState, useEffect, useContext } from "react";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  get_token,
  get_events,
  get_stats,
  get_total,
  get_params,
} from "../../Server";
import TabEvent from "./eventTab";
import { useSelector, useDispatch } from "react-redux";
import * as ActionTypes from "../../store/actionTypes";
import Ionicons from "react-native-vector-icons/Ionicons";

const PageEvent = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const {
    event,
    user: { username, password },
    token,
  } = useSelector((state) => state);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getEvents = async (time = 0) => {
    while (true && time < 3) {
      console.log("\nevents time: ", time);
      setIsLoading(true);
      let [data, error] = await get_events(username, token);
      if (!handleEvents(data, error)) {
        time++;
        continue;
      }
      console.log("### got events 🥳");
      break;
    }
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("-".repeat(60));
    //getStats();
    getEvents();
  }, []);

  // const getStats = async () => {
  //   let [data, error] = await get_params(username, token);
  //   if (error) {
  //     console.log("!!! error at params 📊");
  //   }
  //   dispatch({
  //     type: ActionTypes.setInterval,
  //     payload: data.timeout,
  //   });
  //   console.log(">>> got params 📈📈📈");
  // };

  const handleEvents = (data, error) => {
    if (error) {
      console.log(error);
      return false;
    }
    setEvents(
      data.events.sort((x, y) => new Date(x.StartTime) - new Date(y.StartTime))
    );
    return true;
  };

  const renderLoader = () => {
    return isLoading ? (
      <View style={styles.loaderStyle}>
        <Text style={styles.searching_text}>Searching for upcoming events</Text>
        <ActivityIndicator
          style={{ marginTop: "10%" }}
          size="large"
          color="#aaa"
        />
      </View>
    ) : null;
  };

  const renderBase = () => {
    return isLoading ? (
      renderLoader()
    ) : events.length > 0 ? (
      <FlatList
        style={styles.flat_list}
        data={events}
        renderItem={renderEvents}
        keyExtractor={(item) => item.ID}
      />
    ) : (
      <View style={styles.no_container}>
        <Text style={styles.refresh_text}>Could Not Find Any Events</Text>
        <TouchableOpacity
          onPress={() => {
            console.log("event refresh");
            getEvents().finally(() => setIsLoading(false));
          }}
          style={styles.refresh_button}
        >
          <Ionicons
            name="refresh-outline"
            color="#1e88e5"
            size={2 * styles.refresh_text.fontSize}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const setGlobalEvent = (new_event) => {
    dispatch({
      type: ActionTypes.setEventData,
      payload: new_event,
    });
  };

  const renderEvents = ({ item }) => {
    return <TabEvent item={item} Event={event} SetEvent={setGlobalEvent} />;
  };

  return (
    <SafeAreaView style={styles.base_container}>
      <View style={styles.desgin_container}>
        <View style={styles.header_container}>
          <Text
            style={[
              styles.header_text,
              { fontFamily: "Verdana", fontSize: 22 },
            ]}
          >
            Choose An Event
          </Text>
        </View>
      </View>
      <View style={styles.bottom_container}>{renderBase()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  base_container: { width: "100%", height: "100%", backgroundColor: "#1e88e5" },
  desgin_container: {
    height: "15%",
    width: "100%",
    backgroundColor: "#fefefe",
  },
  header_container: {
    backgroundColor: "#1e88e5",
    width: "100%",
    height: "90%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  header_text: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
  },
  bottom_container: {
    backgroundColor: "#fefefe",
    width: "100%",
    height: "85%",
    alignItems: "center",
  },
  searching_text: {
    fontSize: 26,
    color: "#1e88e5",
    fontWeight: "bold",
    fontFamily: "brandon",
  },
  flat_list: {
    marginTop: "5%",
    backgroundColor: "#fefefe",
    height: "100%",
    width: "100%",
  },
  loaderStyle: {
    marginTop: "50%",
  },
  refresh_button: {
    marginTop: "15%",
    justifyContent: "center",
    alignItems: "center",
  },
  refresh_text: {
    color: "white",
    fontFamily: "brandon",
    fontSize: 18,
  },
  no_container: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    height: "50%",
  },
});

export default PageEvent;
