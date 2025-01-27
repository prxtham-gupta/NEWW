import { useEffect, useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import './login.css';
import { useMsal,useAccount} from '@azure/msal-react';
import {welcomeHeader, welcomeTextOne, welcomeTextTwo, signInText} from './constants/loginConstants.js'
import impilosLogo from './assets/ImpilosLogo.svg'
import msLogo from './assets/msLogo.svg'


const Login = ({setIsLoggedIn}) => {
  const { instance, accounts,callMsGraph } = useMsal(); 
  const {userData,setUserData} = useState({id:"",username:""})
  const account = useAccount(accounts[0] || {});
  const [apiData,setApiData] =useState(null);

  const navigate = useNavigate()

  // const dispatch = useDispatch()
  // const userData = useSelector((state:{userData: any}) => {
  //   return state?.userData?.user
  //  }
  //  );

  useEffect(()=>{
    if(account){
      instance.acquireTokenSilent({
        scopes: ["User.Read"],
        account:account
      }).then((response)=>{
        console.log(response)
        // if(response){
        //   callMsGraph(response.accessToken).then((result)=>setApiData(result));
        // }
      });
    }

  },[account,instance]);

  //  useEffect(()=>{
  //   if(userData?.id){
  //     navigate("/dashboard")
  //   }
  //  }, [userData])
  

  useEffect(() => {
    if (accounts.length > 0) {
      navigate("/dashboard")
      // setUserData({id:accounts[0]?.username, username:accounts[0]?.name})
      console.log(accounts)
    }
}, [accounts]);

  return (
    <div id='loginWrapper'>
      <div id='welcomeSection'>
        <img src={impilosLogo} id='impilosLogo' alt="impilos logo" />
        <p id='welcomeHeader'>{welcomeHeader}</p>
        <p id='welcomeTextOne'>{welcomeTextOne}</p>
        <p id='welcomeTextTwo'>{welcomeTextTwo}</p>
        <button id='loginBtn' onClick={()=>{
          instance.loginRedirect()
        }} >
          <img src={msLogo} alt="" id='msLogo'/>
          <p id='signInText'>{signInText}</p>
        </button>
      </div>
    </div>
  )
}

export default Login