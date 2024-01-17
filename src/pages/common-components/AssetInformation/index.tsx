import React from 'react';
import { Grid, Autocomplete, TextField } from '@mui/material';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';
import './style.css';
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

const AssetInfo = ({ assetCode, disabledStatus = false, source = '', pageType = '', setAssetCode, redirectSource, setpincode, setCurrentStatus, setMandateData, setCurrentRemark, setassetRequestNo=null }) => {
    let path = window.location.pathname?.split('/');
    let modulePath: any = window.location.pathname?.split('/')[path.length - 1];
    let { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [assetList, setAssetList] = React.useState([]);
    const [assetRequestInfo, setAssetRequestInfo] = React.useState<any>();
    const [requestNoData, setRequestNoData] = React.useState(null);
    const [requestList, setRequestList] = React.useState({
        requesterName: '',
        requesterEmployeeID: '',
        shiftingType: '',
        dateofCommissioning: '',
    });
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const _getMandateList = (type) => {
        axios({
            method: 'get',
            url: `${process.env.REACT_APP_BASEURL}/api/Asset/GetAllAssetRequest?rollName=""`,
        })
            .then((res) => {
                console.log('response', res);
                if (res?.status === 200 && res?.data && res?.data?.length > 0) {
                    setAssetList(res?.data);
                }
            })
            .catch((err) => {});
    };
    React.useEffect(() => {
        _getMandateList(apiType);
    }, [apiType]);

    const getById = (id) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestById?id=${id}`)
            .then((response: any) => {
                if (response && response?.data) {
                    setAssetRequestInfo(response?.data);
                    setRequestNoData(response?.data.find((e) => e.requestNo));
                    console.log(
                        'OOO',
                        response?.data,
                        response?.data.find((e) => e.requestNo),
                    );
                    setassetRequestNo(response?.data.find((e) => e.requestNo));
                    setpincode(response?.data?.pincode);
                    setCurrentStatus(response?.data?.accept_Reject_Status || '');
                    setCurrentRemark(response?.data?.accept_Reject_Remark || '');
                }
            })
            .catch((e: any) => {});
    };
    console.log('assetCode', assetCode, assetRequestInfo);
    // console.log('setAssetCode',setAssetCode)
    console.log('requestNoData', requestNoData);
    React.useEffect(() => {
        if (assetCode) {
            getById(assetCode);
        } else {
            setAssetRequestInfo(null);
        }
    }, [assetCode]);
    React.useEffect(() => {
        if (assetCode !== '' && assetList && assetList.length > 0) {
            const obj = assetList && assetList?.find((item) => item?.id === parseInt(assetCode));
            console.log('obj', obj);
            if (obj !== undefined) {
                setRequestList(obj || null);
                // setAssetCode(obj || null);
            }
        }
    }, [assetCode, setAssetCode, assetList]);

    return (
        <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table" className="mandate-table">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <h2 className="mandateInfoLable">Request No.</h2>
                        </TableCell>
                        <TableCell align="center">
                            <h2 className="mandateInfoLable">Asset Request Information</h2>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell align="left" style={{ width: '25%' }}>
                            <Grid container item spacing={1} justifyContent="start" alignItems="center">
                                <Grid item xs={6} md={12}>
                                    <Autocomplete
                                        disablePortal
                                        sx={
                                            redirectSource &&
                                            redirectSource === 'list' && {
                                                backgroundColor: '#f3f3f3',
                                                borderRadius: '6px',
                                            }
                                        }
                                        id="combo-box-demo"
                                        disabled={redirectSource && redirectSource === 'list' ? true : false}
                                        getOptionLabel={(option) => {
                                            return option?.requestNo?.toString() || '';
                                        }}
                                        disableClearable={true}
                                        options={assetList || []}
                                        onKeyDown={(e: any) => {
                                            regExpressionTextField(e);
                                        }}
                                        onPaste={(e: any) => {
                                            if (!textFieldValidationOnPaste(e)) {
                                                dispatch(fetchError('You can not paste Spacial characters'));
                                            }
                                        }}
                                        onChange={(e, value: any) => {
                                            setAssetCode(value?.id);
                                            setRequestNoData(value);
                                            setassetRequestNo(value);
                                            if (!disabledStatus) {
                                                navigate(`/${value?.id}/${modulePath || ''}`, { state: { apiType: apiType } });
                                            }
                                        }}
                                        placeholder="Mandate Code"
                                        // defaultValue={assetCode || null}
                                        value={requestNoData || null}
                                        renderInput={(params) => (
                                            <TextField
                                                name="state"
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
                                </Grid>
                            </Grid>
                        </TableCell>
                        <TableCell align="left" className="mandat-details">
                            <Grid item xs={6} md={12}>
                                <ul>
                                    <li>
                                        <span className="label-text">Requested By:</span>
                                        <span>{requestList?.requesterName}</span>
                                    </li>
                                    <li>
                                        <span className="label-text">Requester Emp Id:</span>
                                        <span>{requestList?.requesterEmployeeID}</span>
                                    </li>
                                    <li>
                                        <span className="label-text">Shift Type:</span>
                                        <span>{requestList?.shiftingType}</span>
                                    </li>
                                    <li>
                                        <span className="label-text">Request Dt:</span>
                                        <span>{moment(requestList?.dateofCommissioning).format('DD/MM/YYYY')}</span>
                                    </li>
                                </ul>
                            </Grid>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};
export default AssetInfo;
