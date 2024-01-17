import React, { useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText';
import { SAVE_CURRENT_ROLE } from 'types/actions/userInfoAction';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/store';
import axios from 'axios';
import { makeStyles } from '@mui/styles';
import { useAuthMethod } from '@uikit/utility/AuthHooks';

const useStyles = makeStyles(() => ({
    formControl: {
        margin: 10,
        minWidth: 120,
        maxWidth: 300,
    },
    select: {
        '&:before': {
            display: 'none',
        },
        '&:after': {
            display: 'none',
        },
    },

}));
function UserRoleSelection() {
    const { userRole, userInfo } = useSelector<AppState, AppState["user"]>(
        ({ user }) => user
    );
    const dispatch = useDispatch();
    const { ChangeUserRoleProcess } = useAuthMethod();
    const classes = useStyles();
    const [userRoleList, setUserRoleList] = useState([]);
    const [role, setRole] = useState([]);
    const [selectedRole,setSelectedRole] = useState([]);
    const getRole = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementRoleList`)
            .then((response: any) => {
                setRole(response?.data || []);
            })
            .catch((e: any) => { });
    };
    const handleChange = (event) => {
        ChangeUserRoleProcess(event.target.value, userInfo)
        dispatch({ type: SAVE_CURRENT_ROLE, payload: event.target.value })
    };

    useEffect(() => {
        getRole()
    }, [])

    useEffect(() => {
        if (role && role.length > 0 && userInfo?.UserId !== undefined) {
            getUserRoleListByid(userInfo?.UserId || 0)
        }

    }, [role, userInfo?.UserId])

    const getUserRoleListByid = (userId) => {
        axios
            .get(
                `${process.env.REACT_APP_BASEURL}/api/User/UserRoleListByUserId?userId=${userId || 0}`
            )
            .then((response: any) => {
                if (!response) {
                    setUserRoleList([]);
                }
                if (response && response?.data?.length > 0) {
                    const userRoleList = role && role?.map((r) => {
                        const iid = response?.data?.find((k) => k?.RoleId == r?.id);
                        if (iid) {
                            return { ...r, roleType: iid.RoleType };
                        }
                    });
                    setUserRoleList(userRoleList && userRoleList?.filter((item) => item !== undefined) || []);
                    if (userRole === undefined || userRole === null) {
                        dispatch({ type: SAVE_CURRENT_ROLE, payload: userRoleList && userRoleList?.find((item) => item?.roleType === "Primary") })
                    }
                } else {
                    setUserRoleList([]);
                }
            })
            .catch((e: any) => { });

    }
    useEffect(()=>{
        if(userRoleList?.length > 0){
            setSelectedRole(userRoleList?.find(item => item?.id === userRole?.id))
        }
    },[userRoleList]);
    return (
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <Select
                labelId="roles-label"
                id="roles"
                //disabled={userRoleList && userRoleList?.length === 1 ? true : false}
                IconComponent={null}
                classes={{ select: classes.select }}
                disableUnderline
                autoWidth
                sx={{
                    boxShadow: "none",
                    ".MuiOutlinedInput-notchedOutline": { border: 0 },
                    "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    {
                        border: 0,
                    },
                    "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                        border: 0,
                    },
                }}
                style={{
                    height: 30,
                    borderColor: '#fff',
                    color: 'white',
                    border: 0, width: "100%",
                    marginLeft: 10,

                }}
                value={selectedRole ||userRoleList[0] || null}
                onChange={handleChange}
            >
                {userRoleList && userRoleList.map((role) => (
                    <MenuItem
                        key={role?.RoleId}
                        value={role}>
                        <ListItemText
                            primaryTypographyProps={{ fontWeight: 400, fontSize: '12px' }}
                            color='#fff' primary={role?.role_Name || ""} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>)
}
export default UserRoleSelection;