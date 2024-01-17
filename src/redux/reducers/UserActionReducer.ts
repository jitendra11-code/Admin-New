import { GET_USER_ACTION_LIST } from "types/actions/UserActionList";

const INIT_STATE = {
  userActionList:[]
};

const UserActionReducer = (
  state = INIT_STATE,
  action
) => {
  switch (action.type) {
  
   
    case GET_USER_ACTION_LIST:{
      return{
        ...state,
        userActionList:action?.payload

      }
    }
   
    default:
      return state;
  }
};
export default UserActionReducer;
