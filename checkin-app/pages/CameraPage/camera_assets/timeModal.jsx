import React, { useState, useEffect } from "react";
import { StyleSheet, Modal, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from "@react-native-community/slider";

const TimeModal = ({ visible, setVisible, interval, setInterval }) => {
    const [timeInterval, setTimeInterval] = useState('2')
    useEffect(() => {
        setTimeInterval(interval);
    }, [visible])
    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={{alignSelf:"center", fontSize:32}}>
                        Select Interval
                    </Text>
                    <View style={{
                        marginTop: "15%",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <View style={{flexDirection: "row"}}>
                            <Text style={{
                                fontSize: 22,
                            }}>
                                {timeInterval}
                            </Text>
                            <Text style={{
                                fontSize: 10,
                                alignSelf: "center"
                            }}>
                                (sec)
                        </Text>
                        </View>
                        
                    
                        <Slider
                            style={{width:"75%", marginTop:"10%"}}
                            minimumValue={0}
                            maximumValue={5}
                            minimumTrackTintColor='#806739'
                            maximumTrackTintColor='black'
                            thumbTintColor="#806739"
                            value={interval}
                            onValueChange={value => {
                                var inv = 1.0 / 0.25;    
                                setTimeInterval(Math.round(value * inv) / inv)
                            }}
                        />
                        <View style={{flexDirection:"row", marginTop: "10%", justifyContent:"space-between"}}>
                            <TouchableOpacity onPress={() => { setVisible(false); setInterval(timeInterval) }}>
                                <Ionicons name="checkbox-outline" size={40}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setVisible(false);}}>
                            <   Ionicons name="close-circle-outline" size={40}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                </View>
            </View>
        </Modal>
    )
}

export default TimeModal;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(12, 12, 12, 0.9)",
    },
    modalView: {
        alignContent: "center",
        alignItems: "center",
        width: "60%",
        height: "30%",
        padding: 10,
        backgroundColor: "#fafafa",
        borderRadius: 20,
        shadowColor: "#fff",
    },
})