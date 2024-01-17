import React from 'react';
import Button from '@mui/material/Button';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Autocomplete, DialogActions, DialogContent, Grid, TextField } from '@mui/material';
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import blockInvalidChar from 'pages/Mandate/Location/Components/blockInvalidChar ';
import { useDispatch, useSelector } from 'react-redux';
import { fetchError, showMessage } from 'redux/actions';

const StaffInformationByForm = ({ saveStaffData, setStaffInformation, staffInformation, generateStaffCategory, staffCategoryOptions, generateStaffStatus, staffStatusOptions, open, handleClose, setErrorMessage, errorMessage }) => {
    var index = 0;
    if (staffInformation?.length === 1 && staffInformation?.[staffInformation?.length - 1]?.id == 0) {
        index = 0;
    } else {
        index = staffInformation?.length - 1;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (value === null) {
            delete errorMessage[name];
            setErrorMessage({ ...errorMessage });
        } else {
            setErrorMessage({
                ...errorMessage,
                [name]: '',
            });
        }
        var data = [...staffInformation];
        data[index][name] = value;
        setStaffInformation(data);
    };

    const dispatch = useDispatch();
    function isValidContactNo(value) {
        let regExp = new RegExp('^[9,8,7,6][0-9]*$');
        return regExp.test(value);
    }
    const onKeyDown = (e) => {
        e.preventDefault();
    };
    return (
        <Dialog fullWidth maxWidth="xl" open={open} onClose={handleClose}>
            <DialogTitle style={{ paddingRight: 20, fontSize: 16, color: '#000' }}>Staff Information</DialogTitle>
            <DialogContent>
                <form>
                    <div className="phase-outer" style={{ paddingLeft: '10px' }}>
                        <Grid container item display="flex" flexDirection="row" spacing={5} marginTop="0px" justifyContent="start" alignSelf="center">
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Staff Classification</h2>
                                    <TextField
                                        autoComplete="off"
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        name="staff_Classification"
                                        id="staff_Classification"
                                        type="text"
                                        size="small"
                                        value={staffInformation?.[index]?.staff_Classification || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p className="form-error">{errorMessage?.staff_Classification}</p>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Staff Category</h2>
                                    <Autocomplete
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => option?.categoryName?.toString() || ''}
                                        disableClearable={true}
                                        options={staffCategoryOptions || []}
                                        onChange={(e, value: any) => {
                                            var data = [...staffInformation];
                                            data[index].staff_Category = value;
                                            data[index].staff_cat_value = value?.categoryName;
                                            setStaffInformation(data);

                                            if (value === null) {
                                                delete errorMessage['staff_cat_value'];
                                                setErrorMessage({ ...errorMessage });
                                            } else {
                                                setErrorMessage({
                                                    ...errorMessage,
                                                    ['staff_cat_value']: '',
                                                });
                                            }
                                        }}
                                        placeholder="Staff Category"
                                        value={staffInformation?.[index]?.staff_Category || null}
                                        renderInput={(textParams) => (
                                            <TextField
                                                name="state"
                                                id="state"
                                                {...textParams}
                                                InputProps={{
                                                    ...textParams.InputProps,
                                                }}
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                    />
                                </div>
                                <p className="form-error">{errorMessage?.staff_cat_value}</p>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Staff Count</h2>
                                    <TextField
                                        autoComplete="off"
                                        name="staff_Count"
                                        id="staffCount"
                                        type="number"
                                        size="small"
                                        value={staffInformation?.[index]?.staff_Count || ''}
                                        onChange={handleChange}
                                        onKeyDown={(e: any) => {
                                            blockInvalidChar(e);
                                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                                                console.log('KEY', e.key);
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                    />
                                </div>
                                <p className="form-error">{errorMessage?.staff_Count}</p>
                            </Grid>

                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Staff Name</h2>
                                    <TextField
                                        autoComplete="off"
                                        onKeyDown={(e: any) => {
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                            regExpressionTextField(e);
                                            if (/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        name="staff_Name"
                                        id="staff_Name"
                                        type="text"
                                        size="small"
                                        value={staffInformation?.[index]?.staff_Name || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p className="form-error">{errorMessage?.staff_Name}</p>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className={staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? 'phaseLable' : 'phaseLable required'}>PAN Number</h2>
                                    <TextField
                                        autoComplete="off"
                                        onKeyDown={(e: any) => {
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                            regExpressionTextField(e);
                                            if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        disabled={(staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent') || false}
                                        InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                                        name="panNumber"
                                        id="panNumber"
                                        type="text"
                                        size="small"
                                        value={staffInformation?.[index]?.panNumber?.toUpperCase() || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                {staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? '' : <p className="form-error">{errorMessage?.panNumber}</p>}
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Mobile Number</h2>
                                    <TextField
                                        autoComplete="off"
                                        name="mobileNo"
                                        id="mobileNo"
                                        type="text"
                                        size="small"
                                        InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                                        value={staffInformation?.[index]?.mobileNo || ''}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        onChange={handleChange}
                                        onKeyDown={(e: any) => {
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </div>
                                <p className="form-error">{errorMessage?.mobileNo}</p>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Joining Date</h2>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DesktopDatePicker
                                            inputFormat="DD/MM/YYYY"
                                            value={staffInformation?.[index]?.join_Date || new Date() || null}
                                            onChange={(value: Dayjs | null, name) => {
                                                if (value !== null && dayjs(value).isValid()) var data = [...staffInformation];
                                                data[index]['join_Date'] = value?.toDate();
                                                setStaffInformation(data);
                                                if (value === null) {
                                                    delete errorMessage['join_Date'];
                                                    setErrorMessage({ ...errorMessage });
                                                } else {
                                                    setErrorMessage({
                                                        ...errorMessage,
                                                        ['join_Date']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(paramsText) => <TextField {...paramsText} size="small" name="Proposed Start Date" onKeyDown={(e) => e.key !== 'Tab' && e.preventDefault()} />}
                                        />
                                    </LocalizationProvider>
                                </div>
                                <p className="form-error">{errorMessage?.join_Date}</p>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Aadhaar Card Number</h2>
                                    <TextField
                                        autoComplete="off"
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        InputProps={{ inputProps: { min: 0, maxLength: 12 } }}
                                        name="aadharNumber"
                                        id="aadharNumber"
                                        type="text"
                                        size="small"
                                        value={staffInformation?.[index]?.aadharNumber || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p className="form-error">{errorMessage?.aadharNumber}</p>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Address</h2>
                                    <TextField
                                        autoComplete="off"
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        name="address"
                                        id="address"
                                        type="text"
                                        size="small"
                                        value={staffInformation?.[index]?.address || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p className="form-error">{errorMessage?.address}</p>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className="phaseLable required">Staff Status</h2>
                                    <Autocomplete
                                        id="combo-box-demo"
                                        getOptionLabel={(option) => option?.categoryName?.toString()}
                                        disableClearable={true}
                                        options={staffStatusOptions || []}
                                        onChange={(e, value: any) => {
                                            var data = [...staffInformation];
                                            data[index].staff_Status = value;
                                            data[index].staff_status_value = value?.categoryName;
                                            setStaffInformation(data);

                                            if (value === null) {
                                                delete errorMessage['staff_Status'];
                                                setErrorMessage({ ...errorMessage });
                                            } else {
                                                setErrorMessage({
                                                    ...errorMessage,
                                                    ['staff_Status']: '',
                                                });
                                            }
                                        }}
                                        placeholder="Staff Status"
                                        value={staffInformation?.[index]?.staff_Status || null}
                                        renderInput={(textParams) => (
                                            <TextField
                                                name="staff_status"
                                                id="staff"
                                                {...textParams}
                                                InputProps={{
                                                    ...textParams.InputProps,
                                                }}
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                    />
                                </div>
                                <p className="form-error">{errorMessage?.staff_Status}</p>
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className={staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? 'phaseLable' : 'phaseLable required'}>Agency Name</h2>
                                    <TextField
                                        autoComplete="off"
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        disabled={(staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent') || false}
                                        name="agencyName"
                                        id="agencyName"
                                        type="text"
                                        size="small"
                                        value={staffInformation?.[index]?.staff_Category?.categoryName === 'Permanent' ? staffInformation?.[index]?.agencyName : '' || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                {staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? '' : <p className="form-error">{errorMessage?.agencyName}</p>}
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className={staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? 'phaseLable' : 'phaseLable required'}>Agency Employee ID</h2>
                                    <TextField
                                        autoComplete="off"
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        onKeyDown={(e: any) => {
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                            regExpressionTextField(e);
                                        }}
                                        disabled={(staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent') || false}
                                        name="agencyEmployeeID"
                                        id="agencyEmployeeID"
                                        type="text"
                                        size="small"
                                        value={staffInformation?.[index]?.staff_Category?.categoryName === 'Permanent' ? staffInformation?.[index]?.agencyEmployeeID : '' || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                {staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? '' : <p className="form-error">{errorMessage?.agencyEmployeeID}</p>}
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className={staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? 'phaseLable' : 'phaseLable required'}>Bank Name</h2>
                                    <TextField
                                        autoComplete="off"
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        onKeyDown={(e: any) => {
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                            regExpressionTextField(e);
                                        }}
                                        name="bankName"
                                        id="bankName"
                                        type="text"
                                        disabled={(staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent') || false}
                                        size="small"
                                        value={staffInformation?.[index]?.staff_Category?.categoryName === 'Permanent' ? staffInformation?.[index]?.bankName : '' || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                {staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? '' : <p className="form-error">{errorMessage?.bankName}</p>}
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className={staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? 'phaseLable' : 'phaseLable required'}>Branch Name</h2>
                                    <TextField
                                        autoComplete="off"
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                            if (/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        name="branchName"
                                        id="branchName"
                                        disabled={(staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent') || false}
                                        type="text"
                                        size="small"
                                        value={staffInformation?.[index]?.staff_Category?.categoryName === 'Permanent' ? staffInformation?.[index]?.branchName : '' || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                {staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? '' : <p className="form-error">{errorMessage?.branchName}</p>}
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className={staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? 'phaseLable' : 'phaseLable required'}>Account Number</h2>
                                    <TextField
                                        autoComplete="off"
                                        onKeyDown={(e: any) => {
                                            blockInvalidChar(e);
                                            if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        disabled={(staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent') || false}
                                        name="accountNumber"
                                        id="accountNumber"
                                        type="text"
                                        InputProps={{ inputProps: { min: 0, maxLength: 18 } }}
                                        size="small"
                                        value={staffInformation?.[index]?.staff_Category?.categoryName === 'Permanent' ? staffInformation?.[index]?.accountNumber : '' || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                {staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? '' : <p className="form-error">{errorMessage?.accountNumber}</p>}
                            </Grid>
                            <Grid item xs={6} md={3} sx={{ position: 'relative' }} style={{ paddingLeft: '10px' }}>
                                <div className="input-form">
                                    <h2 className={staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? 'phaseLable' : 'phaseLable required'}>IFSC Code</h2>
                                    <TextField
                                        autoComplete="off"
                                        disabled={(staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent') || false}
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                            if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        name="ifsc"
                                        id="ifsc"
                                        type="text"
                                        size="small"
                                        value={staffInformation?.[index]?.staff_Category?.categoryName === 'Permanent' ? staffInformation?.[index]?.ifsc : '' || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                {staffInformation?.[index]?.staff_Category.hasOwnProperty('categoryName') && staffInformation?.[index]?.staff_Category?.categoryName !== 'Permanent' ? '' : <p className="form-error">{errorMessage?.ifsc}</p>}
                            </Grid>
                        </Grid>
                    </div>
                </form>
            </DialogContent>

            <DialogActions className="button-wrapp">
                <Button className="yes-btn" onClick={(e) => saveStaffData(e)}>
                    Save
                </Button>
                <Button className="yes-btn" onClick={handleClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StaffInformationByForm;
