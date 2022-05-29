import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useState, useEffect } from "react";
import { get_token, get_stats, get_total } from "../Server";
import { useSelector, useDispatch } from "react-redux";
import * as ActionTypes from "../store/actionTypes";
import NoEvent from "../pages/NoEvent";
import PageCamera from "../pages/CameraPage/PageCamera";
import PageEvents from "../pages/eventPage/eventPage";
import PageList from "../pages/ListPage/PageList";
import { getStats } from "../Server";
//
const Tab = createBottomTabNavigator();

const Tabs = ({ NavigationContainer }) => {
  const { event } = useSelector((state) => {
    //console.log(state.event.eventId)
    return state;
  });

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Events") {
            iconName = focused ? "flame" : "flame-outline";
          } else if (route.name === "List") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Scan") {
            iconName = focused ? "barcode" : "barcode-outline";
          }
          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1e88e5",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Events"
        component={PageEvents}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="List"
        component={event.eventId === "" ? NoEvent : PageList}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={event.eventId === "" ? NoEvent : PageCamera}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};
export default Tabs;
