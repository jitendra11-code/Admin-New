import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField } from '@mui/material';
import { Formik } from 'formik';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { fetchError, fetchSuccess, showMessage } from 'redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

function BranchModal({ open, handleClose, dialogTitle, styling, handleSpocSubmit, spoc, errors, touched }) {
    const [roleList, setRoleList] = React.useState([]);
    const [userList, setUserList] = React.useState([]);
    const dispatch = useDispatch();

    const validationSchema = Yup.object({
        roleName: Yup.string().required('Select a role'),
        userName: Yup.string().required('Select a user'),
        // Add other validations for employeeCode, designation, fullName, emailId, and contactNumber if needed
    });

    // const getRole = async () => {
    //     await axios
    //         .get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementRoleList`)
    //         .then((response: any) => {
    //             setRoleList(response?.data || []);
    //         })
    //         .catch((e: any) => { });
    // };

    const getRole = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/User/UserManagementRoleList`)
            .then((response: any) => {
                const desiredRoleNames = ['Location Coordinator', 'Branch Admin', 'Branch Area Manager', 'Branch Cluster Manager', 'Branch Regional Manager', 'Central Facility Associate', 'Vertical Head'];
                const filteredRoles = response?.data.filter((role: any) => desiredRoleNames.includes(role.role_Name)) || [];
                setRoleList(filteredRoles);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        getRole();
    }, []);

    const getVerticalHead = async (selectedRoleName) => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/user/GetUserListByRole?rolename=${selectedRoleName}`)
            .then((response) => {
                console.log('999', response);
                setUserList(response?.data || []);
            })
            .catch((e) => {
                dispatch(fetchError('Error Occurred !!!'));
            });
    };

    const intialVal = {
        roleName: spoc[dialogTitle]?.roleName || '',
        employeeId: spoc[dialogTitle]?.employeeId || '',
        designation: spoc[dialogTitle]?.designation || '',
        contact: spoc[dialogTitle]?.contact || '',
        emailid: spoc[dialogTitle]?.emailid || '',
        employeeName: spoc[dialogTitle]?.employeeName || '',
        // spocType: spoc[dialogTitle]?.spocType || '',
        // locationCode: spoc[dialogTitle].locationCode || '',
        // id: spoc[dialogTitle].id || 0,
        userName: spoc[dialogTitle]?.username === undefined ? spoc[dialogTitle]?.userName || '' : spoc[dialogTitle]?.username || '',
    };
    console.log('spoc dialog', spoc[dialogTitle]);
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
            maxWidth="lg"
            PaperProps={{
                style: {
                    borderRadius: '20px',
                    position: 'absolute',
                    left: '67%',
                    top: 'calc(30% - 50px)', // Adjust top as needed
                },
            }}
        >
            <Formik
                initialValues={intialVal}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    handleSpocSubmit(values);
                }}
            >
                {({ values, handleChange, handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <DialogTitle id="alert-dialog-title" className="title-model">
                            {dialogTitle}
                        </DialogTitle>

                        {/* <DialogContent style={{ width: '450px', padding: '1px 24px' }}>
                            <h2 className="phaseLable required">Select Role</h2>
                            <Select
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                                size="small"
                                className="w-85"
                                name="roleName"
                                id="roleName"
                                value={values.roleName}
                                //onChange={handleChange}
                                onChange={(e) => {
                                    const selectedRoleName = e.target.value;
                                    handleChange({ target: { name: 'employeeId', value: '' } });
                                    handleChange({ target: { name: 'designation', value: '' } });
                                    handleChange({ target: { name: 'employeeName', value: '' } });
                                    handleChange({ target: { name: 'emailid', value: '' } });
                                    handleChange({ target: { name: 'contact', value: '' } });
                                    handleChange(e);
                                    getVerticalHead(selectedRoleName);
                                }}
                            >
                                <MenuItem value="" disabled>
                                    Select Role
                                </MenuItem>
                                {roleList.map((option) => (
                                    <MenuItem key={option.role_Name} value={option.role_Name}>
                                        {option.role_Name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {touched.role_Name && errors.role_Name && <p className="form-error">{errors.role_Name}</p>}
                        </DialogContent> */}

                        <DialogContent style={{ width: '450px', padding: '1px 24px' }}>
                            <h2 className="phaseLable required">Select Role</h2>
                            <Autocomplete
                                options={roleList.map((option) => option.role_Name)}
                                getOptionLabel={(option) => option}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        className="w-85"
                                        name="roleName"
                                        id="roleName"
                                        // label="Select Role"
                                    />
                                )}
                                value={values.roleName}
                                onChange={(event, newValue) => {
                                    console.log('@@@', values);
                                    const selectedRoleName = newValue;
                                    handleChange({ target: { name: 'employeeId', value: '' } });
                                    handleChange({ target: { name: 'userName', value: '' } });
                                    handleChange({ target: { name: 'designation', value: '' } });
                                    handleChange({ target: { name: 'employeeName', value: '' } });
                                    handleChange({ target: { name: 'emailid', value: '' } });
                                    handleChange({ target: { name: 'contact', value: '' } });
                                    handleChange({ target: { name: 'roleName', value: newValue } });
                                    getVerticalHead(selectedRoleName);
                                }}
                            />
                            {touched.role_Name && errors.role_Name && <p className="form-error">{errors.role_Name}</p>}
                        </DialogContent>

                        <DialogContent style={{ width: '450px', padding: '1px 24px' }}>
                            <h2 className="phaseLable required" style={styling}>
                                Select User
                            </h2>
                            <Autocomplete
                                disablePortal={false}
                                style={{ zIndex: 9999999 }}
                                id="combo-box-demo"
                                getOptionLabel={(option) => option?.userName?.toString() || ''}
                                disableClearable={true}
                                options={userList || []}
                                value={values || null}
                                onChange={(e, value) => {
                                    if (value) {
                                        console.log('user handlechange', value);
                                        handleChange({ target: { name: 'userName', value: value.userName || '' } });
                                        handleChange({ target: { name: 'employeeId', value: value.employeeCode || '' } });
                                        handleChange({ target: { name: 'designation', value: value.designation || '' } });
                                        handleChange({ target: { name: 'employeeName', value: value.userFullName || '' } });
                                        handleChange({ target: { name: 'emailid', value: value.email || '' } });
                                        handleChange({ target: { name: 'contact', value: value.mobileNumber || '' } });
                                    } else {
                                        // Clear the fields if no user is selected
                                        handleChange({ target: { name: 'userName', value: '' } });
                                        handleChange({ target: { name: 'employeeId', value: '' } });
                                        handleChange({ target: { name: 'designation', value: '' } });
                                        handleChange({ target: { name: 'employeeName', value: '' } });
                                        handleChange({ target: { name: 'emailid', value: '' } });
                                        handleChange({ target: { name: 'contact', value: '' } });
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        name="userListByRole"
                                        id="state"
                                        {...params}
                                        InputProps={{
                                            ...params.InputProps,
                                            style: { height: `35 !important` },
                                        }}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            />
                            {/* <Select
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                                size="small"
                                className="w-85"
                                name="userName"
                                id="userName"
                                value={values.userName || ''}
                                //onChange={handleChange}
                                onChange={(e) => {
                                    // console.log('@@@', values?.userName);
                                    const selectedUserName = e.target.value as string;
                                    const selectedUser = userList.find((user) => user.userName === selectedUserName);
                                    if (selectedUser) {
                                        handleChange({ target: { name: 'employeeId', value: selectedUser.employeeCode || '' } });
                                        handleChange({ target: { name: 'designation', value: selectedUser.designation || '' } });
                                        handleChange({ target: { name: 'employeeName', value: selectedUser.userFullName || '' } });
                                        handleChange({ target: { name: 'emailid', value: selectedUser.email || '' } });
                                        handleChange({ target: { name: 'contact', value: selectedUser.mobileNumber || '' } });
                                        handleChange({ target: { name: 'userName', value: selectedUser.userName || '' } });
                                    } else {
                                        // Clear the fields if no user is selected
                                        handleChange({ target: { name: 'employeeId', value: '' } });
                                        handleChange({ target: { name: 'designation', value: '' } });
                                        handleChange({ target: { name: 'employeeName', value: '' } });
                                        handleChange({ target: { name: 'emailid', value: '' } });
                                        handleChange({ target: { name: 'contact', value: '' } });
                                        handleChange({ target: { name: 'userName', value: '' } });
                                    }
                                }}
                            >
                                <MenuItem value="" disabled>
                                    Select User
                                </MenuItem>
                                {userList.map((option) => (
                                    <MenuItem key={option.userName} value={option.userName}>
                                        {option.userName}
                                    </MenuItem>
                                ))}
                            </Select> */}
                            {touched.userName && errors.userName && <p className="form-error">{errors.userName}</p>}
                        </DialogContent>

                        <DialogContent style={{ width: '450px', padding: '1px 24px' }}>
                            <h2 className="phaseLable">Employee Id</h2>
                            <TextField autoComplete="off" size="small" name="employeeId" onChange={handleChange} value={values.employeeId} disabled={true} />
                            {/* {error && <div className="form-error">{error}</div>} */}
                        </DialogContent>

                        <DialogContent style={{ width: '450px', padding: '1px 24px' }}>
                            <h2 className="phaseLable">Designation</h2>
                            <TextField defaultValue="" autoComplete="off" size="small" name="designation" id="designation" onChange={handleChange} value={values.designation} disabled={true} />
                            {/* {error && <div className="form-error">{error}</div>} */}
                        </DialogContent>

                        <DialogContent style={{ width: '450px', padding: '1px 24px' }}>
                            <h2 className="phaseLable">Full Name</h2>
                            <TextField defaultValue="" autoComplete="off" size="small" name="employeeName" id="employeeName" onChange={handleChange} value={values.employeeName} disabled={true} />
                            {/* {error && <div className="form-error">{error}</div>} */}
                        </DialogContent>

                        <DialogContent style={{ width: '450px', padding: '1px 24px' }}>
                            <h2 className="phaseLable">Email Id</h2>
                            <TextField defaultValue="" autoComplete="off" size="small" name="emailid" id="emailid" onChange={handleChange} value={values.emailid} disabled={true} />
                            {/* {error && <div className="form-error">{error}</div>} */}
                        </DialogContent>

                        <DialogContent style={{ width: '450px', padding: '1px 24px' }}>
                            <h2 className="phaseLable required">Contact Number</h2>
                            <TextField defaultValue="" autoComplete="off" size="small" name="contact" id="contact" onChange={handleChange} value={values.contact} disabled={true} />
                            {/* {error && <div className="form-error">{error}</div>} */}
                        </DialogContent>

                        <DialogActions className="button-wrap">
                            <Button className="yes-btn" type="submit">
                                Add
                            </Button>
                            <Button className="no-btn" onClick={handleClose}>
                                Cancel
                            </Button>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
}

export default BranchModal;
