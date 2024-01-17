import { GET_USER_COMPLIENCE_ACTION_LIST } from "types/actions/UserComplienceActionList";

const INIT_STATE = {
    userComplienceActionList:[]
};

const UserComplienceActionReducer = (
  state = INIT_STATE,
  action
) => {
  switch (action.type) {
  
   
    case GET_USER_COMPLIENCE_ACTION_LIST:{
      return{
        ...state,
        userComplienceActionList:action?.payload

      }
    }
   
    default:
      return state;
  }
};
export default UserComplienceActionReducer;
