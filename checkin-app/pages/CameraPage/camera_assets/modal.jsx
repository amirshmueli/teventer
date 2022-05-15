import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { get_token, make_scan, scan_ticket } from "../../../Server";
import { useSelector, useDispatch } from "react-redux";
import * as ActionTypes from "../../../store/actionTypes";
/*
<Ionicons name="checkmark-circle" color="#00c907" size={150} />
*/
const PopUp = ({ visible, setVisible, setScan, urlData, Tinterval }) => {
  const dispatch = useDispatch();
  const { user, tickets, event, token } = useSelector((state) => {
    console.log("changed");
    return state;
  });

  // icons
  const checkMark = (
    <Ionicons name="checkmark-circle" color="#00c907" size={150} />
  );
  const XMark = <Ionicons name="close-circle" color="#eb3434" size={150} />;
  const alertMark = <Ionicons name="alert-circle" color="#f7d600" size={150} />;
  const connectionMark = <Ionicons name="wifi" color="#eb3434" size={150} />;

  const [Icon, setIcon] = useState(LoadingIndicator);
  const [TicketData, setTicketData] = useState({
    message: "none-message",
    owner: "none-owner",
    type: "none-type",
  });
  const [isLoading, setIsLoading] = useState(false);

  const LoadingIndicator = (
    <View
      style={{
        height: 150,
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator
        size="large"
        color="#806739"
        style={{
          height: 150,
        }}
      />
    </View>
  );

  const handleUrl = async () => {
    setIsLoading(true);
    setIcon(LoadingIndicator);
    let [data, error] = await make_scan(user.username, token, urlData);

    setIsLoading(false);
    if (!handleResult(data, error)) return;
    console.log("ticket scanned");
  };

  const handleResult = (data, error) => {
    if (error === "URL error")
      data = {
        result: { status: 500 },
      };
    else if (error) {
      console.log(error);
      return false;
    }
    const status = data.status;
    if (status == 300) {
      setIcon(alertMark);
      setTicketData({
        message: "Already Checked In!",
        owner: data.guest,
      });
    } else if (status == 200) {
      setIcon(checkMark);
      dispatch({
        type: ActionTypes.setTicketsCurrent,
        payload: tickets.current + 1,
      });
      setTicketData({
        message: "Guest Arrived!",
        owner: resp.message,
        type: resp.ticket.Type,
      });

      console.log(Tinterval);
      if (Tinterval == 0) {
        return;
      }

      setTimeout(() => setVisible(false), Tinterval * 1000);
    } else if (status == 500) {
      setIcon(XMark);
      setTicketData({
        message: "Wrong Ticket",
        err: "This ticket is for a different event",
      });
    } else {
      setIcon(connectionMark);
      setTicketData({
        message: "Connection Error",
        err: "please try again",
      });
    }

    return true;
  };

  //
  useEffect(() => {
    handleUrl();
  }, [urlData]);

  const render_messages = () => {
    return isLoading ? (
      <Text style={[styles.loadingText, { fontFamily: "brandon" }]}>
        Authenticating Ticket
      </Text>
    ) : (
      <View>
        {TicketData.message === undefined ? null : (
          <Text style={styles.mainMessage}>{TicketData.message}</Text>
        )}
        {TicketData.type !== undefined ? (
          <Text style={styles.typeText}>{TicketData.type}</Text>
        ) : null}
        {TicketData.owner === undefined ? null : (
          <Text style={styles.guestName}>{TicketData.owner}</Text>
        )}

        {TicketData.err !== undefined ? (
          <Text style={styles.MinorText}>{TicketData.err}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View>{Icon}</View>
          {render_messages()}
          {isLoading ? null : (
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setVisible(false);
                setScan(false);
              }}
            >
              <Text style={styles.textStyle}>Scan Another Ticket</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};
export default PopUp;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(12, 12, 12, 0.9)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#fafafa",
    borderRadius: 20,
    padding: 50,
    alignItems: "center",
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    marginTop: "10%",
    padding: 15,
    paddingVertical: 20,
    elevation: 2,
    backgroundColor: "#806739",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingText: {
    fontSize: 20,
    marginBottom: "5%",
    textAlign: "center",
  },
  mainMessage: {
    fontWeight: "600",
    fontSize: 20,
    marginBottom: "5%",
    textAlign: "center",
  },
  guestName: {
    fontSize: 18,
    marginBottom: "5%",
    textAlign: "center",
  },
  MinorText: {
    fontSize: 12,
    marginBottom: "5%",
    textAlign: "center",
  },
  typeText: {
    padding: 10,
    borderColor: "black",
    fontSize: 26,
    marginBottom: "5%",
    textAlign: "center",
    fontWeight: "bold",
  },
});
