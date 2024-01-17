import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Button, Grid, TextField } from '@mui/material';
import { submit } from 'shared/constants/CustomColor';
import axios from 'axios';
import { fetchError } from 'redux/actions';
import { useDispatch } from 'react-redux';
import { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';

export default function FormDialog({ getPenaltyDetails, mandateId, edit, setEdit, index, penaltyData, role }) {
    const [open, setOpen] = React.useState(false);
    const [remarkChanged, setRemarkChanged] = React.useState(false);
    const [formData, setFormData] = React.useState({
        Id: 0,
        Uid: 'uid',
        Mandates_Id: null,
        Total_TAT: null,
        Total_Delays: null,
        Penalty_Matrix: null,
        Penalty_Amount: null,
        Remarks: '',
    });
    const dispatch = useDispatch();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEdit(false);
        setFormData({
            Id: 0,
            Uid: 'uid',
            Mandates_Id: null,
            Total_TAT: null,
            Total_Delays: null,
            Penalty_Matrix: null,
            Penalty_Amount: null,
            Remarks: null,
        });
    };
    const handleSubmit = () => {
        formData['Mandates_Id'] = mandateId?.id;
        if (edit === false) {
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/SavePenaltyDetails`, formData)
                .then((response: any) => {
                    if (!response) {
                    } else {
                        handleClose();
                        getPenaltyDetails();
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        } else {
            const data = [...penaltyData];
            const payload = {
                Id: penaltyData[index]?.id,
                Uid: 'uid',
                Mandates_Id: mandateId?.id,
                Total_TAT: formData?.Total_TAT === null ? penaltyData[index]?.total_TAT : formData?.Total_TAT,
                Total_Delays: formData?.Total_Delays === null ? penaltyData[index]?.total_Delays : formData?.Total_Delays,
                Penalty_Matrix: formData?.Penalty_Matrix === null ? penaltyData[index]?.penalty_Matrix : formData?.Penalty_Matrix,
                Penalty_Amount: formData?.Penalty_Amount === null ? penaltyData[index]?.penalty_Amount : formData?.Penalty_Amount,
                Remarks: formData?.Remarks === '' ? penaltyData[index]?.remarks : formData?.Remarks,
            };

            data[index] = payload;
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/PenaltyDetails/UpdateExcelData`, data)
                .then((response: any) => {
                    if (!response) {
                        handleClose();
                    } else {
                        handleClose();
                        getPenaltyDetails();
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    };
    const handleChange = (e) => {
        const { name, value } = e?.target;
        console.log('AAA', name, value, e?.target);
        if (name !== 'Remarks') {
            setFormData({ ...formData, [name]: parseFloat(value) });
        } else {
            setRemarkChanged(true);
            setFormData({ ...formData, [name]: value });
        }
    };
    return (
        <div>
            {role !== 'Vendor' && (
                <Button variant="outlined" style={submit} onClick={handleClickOpen}>
                    Add Penalty
                </Button>
            )}
            <Dialog open={open || edit} onClose={handleClose}>
                <DialogContent>
                    <Grid container item display="flex" flexDirection="row" spacing={2} justifyContent="start" alignSelf="center">
                        <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable">Total TAT</h2>
                                <TextField name="Total_TAT" id="Total_TAT" type="number" variant="outlined" size="small" className="w-85" value={edit === true && formData?.Total_TAT === null ? penaltyData[index]?.total_TAT : formData?.Total_TAT || ''} onChange={(value) => handleChange(value)} />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable"> Total Number of delays</h2>
                                <TextField
                                    name="Total_Delays"
                                    id="Total_Delays"
                                    variant="outlined"
                                    type="number"
                                    size="small"
                                    className="w-85"
                                    value={edit === true && formData?.Total_Delays === null ? penaltyData[index]?.total_Delays : formData?.Total_Delays || ''}
                                    onChange={(value) => handleChange(value)}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable"> Penalty Matrix</h2>
                                <TextField
                                    name="Penalty_Matrix"
                                    id="Penalty_Matrix"
                                    variant="outlined"
                                    type="number"
                                    size="small"
                                    className="w-85"
                                    value={edit === true && formData?.Penalty_Matrix === null ? penaltyData[index]?.penalty_Matrix : formData?.Penalty_Matrix || ''}
                                    onChange={(value) => handleChange(value)}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable"> Penalty Amount</h2>
                                <TextField
                                    name="Penalty_Amount"
                                    id="Penalty_Amount"
                                    type="number"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={edit === true && formData?.Penalty_Amount === null ? penaltyData[index]?.penalty_Amount : formData?.Penalty_Amount || ''}
                                    onChange={(value) => handleChange(value)}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                            <div className="input-form">
                                <h2 className="phaseLable"> Remarks</h2>
                                <TextField
                                    name="Remarks"
                                    id="Remarks"
                                    variant="outlined"
                                    size="small"
                                    className="w-85"
                                    value={edit === true && !remarkChanged ? penaltyData[index]?.remarks : formData?.Remarks || ''}
                                    onKeyDown={(e: any) => {
                                        regExpressionRemark(e);
                                    }}
                                    onPaste={(e: any) => {
                                        if (!textFieldValidationOnPaste(e)) {
                                            dispatch(fetchError('You can not paste Spacial characters'));
                                        }
                                    }}
                                    onChange={(value) => handleChange(value)}
                                />
                            </div>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        size="small"
                        style={submit}
                        sx={{
                            padding: '6px 20px !important',
                            marginLeft: '0 !important',
                        }}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        size="small"
                        style={submit}
                        sx={{
                            padding: '6px 20px !important',
                            marginLeft: '5 !important',
                        }}
                        onClick={handleSubmit}
                    >
                        {edit ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
