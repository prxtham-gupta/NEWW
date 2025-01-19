import { useEffect, useState } from "react";
import SessionContext from "./SessionContext";

const SessionProvider = (props) =>{
    const [allSessions,setAllSessions]=useState([]);
    const [selectedSummary,setSelectedSummary] =  useState(null);
    const [seledctedTranscript,setSelectedTranscript]=useState(null);
    const [user,setUser] = useState(null);
    useEffect(()=>{
        const loggedInUser = sessionStorage.getItem("user");
        if(loggedInUser){
          setUser(JSON.parse(loggedInUser));
        }
      },[])

    return (
        <SessionContext.Provider value={{allSessions,setAllSessions,setSelectedSummary,selectedSummary,setSelectedTranscript,seledctedTranscript,setUser,user}}>
            {props.children}
        </SessionContext.Provider>
    )
}

export default SessionProvider;