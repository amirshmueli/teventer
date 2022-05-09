import { createStackNavigator } from "@react-navigation/stack";
import PageLogin from "../pages/loginPage/PageLogin";
import Tabs from "./tabs";
import { get_token, get_stats, get_total } from "../Server";
import { Provider } from "react-redux";
import store from "../store/store";
import { useEffect } from "react";
const Stack = createStackNavigator();

function Stacknav() {
  return (
    <Provider store={store}>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={PageLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="App"
          component={Tabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </Provider>
  );
}

export default Stacknav;
