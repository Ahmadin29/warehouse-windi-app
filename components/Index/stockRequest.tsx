import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Divider } from "react-native-paper";
import Colors from "../../constants/Colors";
import Button from "../Button";
import Text from "../Text";

export default function StockRequest(props:any) {

    const [data,setData] = useState([]);
    const [page,setPage] = useState(1);

    const [accepting,setAccepting] = useState(false);
    const [rejecting,setRejecting] = useState(false);

    const checkSession = async()=>{
        const session = await AsyncStorage.getItem('session');

        if (session) {
            axios.defaults.headers.common["x-api-key"] = JSON.parse(session).api_key;
            getRequestStock();
        }
    }

    useEffect(()=>{
        checkSession();
    },[])

    const getRequestStock = async()=>{
        
        try {
            const response = await axios.get('/stock');
            setData(response.data.data);
        } catch (error:any) {
            console.log(error);
        }

    }

    const getNextRequest = async()=>{
        try {
            const response = await axios.get('/stock',{
                params:{
                    _page:page + 1
                }
            });
            setPage(page + 1)

            const newData = [...data,...response.data.data];
            
            setData(newData);
        } catch (error:any) {
            console.log(error);
        }
    }

    const acceptRequest = (v:any,type:any)=>{

        const request = {
            _id:v._id,
            val:v,
        }

        setAccepting(true);

        axios.post('/stock/accept-'+type,request)
        .then(response=>{
            Alert.alert('Berhasil','Berhasil menerima request '+type)
            setAccepting(false);
            getRequestStock();
        })
        .catch(e=>{
            setAccepting(false);
            console.log(e.response);
            
        })
    }

    const rejectRequest = (v:any,type:any)=>{
        const request = {
            val:v,
            _id:v.id,
        }

        setRejecting(true);

        axios.post('/stock/reject-'+type,request)
        .then(response=>{
            Alert.alert('Berhasil','Berhasil menolak request '+type)
            setRejecting(false);
            getRequestStock();
        })
        .catch(e=>{
            setRejecting(false);
            Alert.alert('Terjadi kesalahan','Gagal menolak request '+type)
            console.log(e.response);
            
        })
    }

    return(
        <View style={{
            margin:15,
            marginTop:0,
        }} >
            <View style={{
                flexDirection:"row",
                alignItems:"center",
                justifyContent:"space-between"
            }} >
                <Text weight="semi" >Permintaan Persetujuan Stok</Text>
                <TouchableOpacity
                    onPress={()=>{
                        setPage(1);
                        setData([]);
                        getRequestStock();
                    }}
                >
                    <Text>Perbaharui</Text>
                </TouchableOpacity>
            </View>
            {
                !data || data.length < 1 &&
                <View style={{
                    alignItems:"center",
                    backgroundColor:Colors.grey1,
                    padding:15,
                    marginTop:15,
                }} >
                    <Text>Tidak Ada Permintaan Persetujuan</Text>
                </View>
            }
            {
                data?.map((v:any)=>{
                    return(
                        <View key={v._id} style={{
                            padding:10,
                            elevation:3,
                            backgroundColor:Colors.white,
                            marginTop:15,
                            borderRadius:10,
                        }} >
                            <View style={{
                                flexDirection:"row",
                                justifyContent:"space-between",
                                alignItems:"center"
                            }} >
                                <View>
                                    <Text weight="semi" >{v.item.item.name}</Text>
                                    <Text size={10} >Variant {v.item.variant.name}</Text>
                                </View>
                                <View>
                                    <Text weight="semi" style={{
                                        textAlign:"right"
                                    }} >Jumlah</Text>
                                    <Text size={10} style={{
                                        textAlign:"right"
                                    }}>{v.type} {v.amount} Item</Text>
                                </View>
                            </View>
                            <Divider
                                style={{
                                    marginVertical:10,
                                    height:2,
                                }}
                            />
                            <View style={{
                                flexDirection:"row",
                                justifyContent:"flex-end"
                            }} >
                                <Button
                                    label="Tolak"
                                    size="small"
                                    color="danger"
                                    loading={rejecting}
                                    bordered
                                    style={{
                                        marginRight:10,
                                    }}
                                    onPress={()=>{
                                        Alert.alert('Perhatian!','Yakin ingin menolak permintaan ini?',[
                                            {
                                                text:"Batalkan"
                                            },
                                            {
                                                text:"Ya, Lanjutkan",
                                                onPress:()=>{
                                                    rejectRequest(v,v.type)
                                                }
                                            }
                                        ])
                                    }}
                                />
                                <Button
                                    label="Terima"
                                    size="small"
                                    loading={accepting}
                                    onPress={()=>{
                                        Alert.alert('Perhatian!','Yakin ingin menerima permintaan ini?',[
                                            {
                                                text:"Batalkan"
                                            },
                                            {
                                                text:"Ya, Lanjutkan",
                                                onPress:()=>{
                                                    acceptRequest(v,v.type)
                                                }
                                            }
                                        ])
                                    }}
                                />
                            </View>
                        </View>
                    )
                })
            }
            <Button
                label="Muat Lainnya"
                style={{
                    marginTop:15,
                }}
                onPress={()=>{
                    getNextRequest()
                }}
            />
        </View>
    )
}