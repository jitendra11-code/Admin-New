import Settings from './Setting';
import Common from './Common';
import UserActionReducer from './UserActionReducer';
import userComplienceAction from './UseComplienceActionReducer';
import MenuActionReducer from './MenuReducer';
import AppLoader from './AppLoaderReducer';
import userReducer from './userInfoReducer';
import branchMasterAction from './BranchMasterReducer';
import { applyMiddleware, combineReducers, compose } from 'redux';
export default combineReducers({
    settings: Settings,
    common: Common,
    appLoader: AppLoader,
    userAction: UserActionReducer,
    menu: MenuActionReducer,
    user: userReducer,
    userComplienceAction: userComplienceAction,
    branchMasterAction: branchMasterAction,
});
