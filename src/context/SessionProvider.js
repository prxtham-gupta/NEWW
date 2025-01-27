import { useEffect, useState } from "react";
import SessionContext from "./SessionContext";

const SessionProvider = (props) =>{
    const [allSessions,setAllSessions]=useState([]);
    const [selectedSessionId,setSelectedSessionId]=useState(null);
    const [user,setUser] = useState(null);
    useEffect(()=>{
        const loggedInUser = sessionStorage.getItem("user");
        if(loggedInUser){
          setUser(JSON.parse(loggedInUser));
        }
      },[])
    return (
        <SessionContext.Provider value={{selectedSessionId,setSelectedSessionId,allSessions,setAllSessions,setUser,user}}>
            {props.children}
        </SessionContext.Provider>
    )
}

export default SessionProvider;