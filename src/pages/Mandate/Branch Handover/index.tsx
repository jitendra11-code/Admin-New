import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import MandatoryItemListCmp from './MandatoryItemList';
import KeyHandoverTemplate from './KeyHandoverTemplate';
import { useUrlSearchParams } from 'use-url-search-params';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import MandateInfo from 'pages/common-components/MandateInformation';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { AppState } from 'redux/store';
import { fetchError, showMessage } from 'redux/actions';
import { Button } from '@mui/material';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import workflowFunctionAPICall from '../workFlowActionFunction';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import ParticalComplete from './KeyHandoverTemplate/Compoents/Actions/PartialComplete';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: (props: TabPanelProps) => any = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {children}
        </div>
    );
};

const TabsComponent = () => {
    const fileInput = React.useRef();
    const { user } = useAuthUser();
    const dispatch = useDispatch();
    const [mandateCode, setMandateCode] = useState<any>('');
    const [mandateData, setMandateData] = React.useState({});
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [params] = useUrlSearchParams({}, {});
    const [actionWF, setActionWF] = useState('');
    const [documentTypeList, setDocumentTypeList] = useState([]);
    const [remark, setRemark] = useState('');
    const [fileUploadRemark, setFileUploadRemark] = useState('');
    const [sendBack, setSendBack] = React.useState(false);
    const [rejected, setRejected] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const navigate = useNavigate();
    const [value, setValue] = useState(1);
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const [userAction, setUserAction] = React.useState(null);
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const gridRef = React.useRef<AgGridReact>(null);
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const { id } = useParams();

    const [isMandatoryItemChecked, setIsMandatoryItemChecked] = useState(false);
    const [isKeyHandoverChecked, setIsKeyHandoverChecked] = useState(false);

    React.useEffect(() => {
        if (id !== 'noid' && id) {
            setMandateCode(id);
        }
    }, [id]);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    React.useEffect(() => {
        if (mandateCode && mandateCode?.id !== undefined) {
            const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(mandateCode?.id) && item?.module === module);
            if (apiType === '') {
                setUserAction(userAction);
            } else {
                let action = mandateCode;
                setUserAction({ ...action, runtimeId: action.runtime });
            }
            if (params.source === 'list') {
                navigate(`/mandate/${mandateCode?.id}/${module}?source=list`, {
                    state: { apiType: apiType },
                });
            } else {
                navigate(`/mandate/${mandateCode?.id}/${module}`, {
                    state: { apiType: apiType },
                });
            }
        }
    }, [mandateCode]);

    const _getRuntimeId = (id) => {
        const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(id) && item?.module === module);
        return userAction?.runtimeId || 0;
    };
    const workFlowMandate = () => {
        const token = localStorage.getItem('token');
        const body = {
            runtimeId: _getRuntimeId(mandateCode.id) || 0,
            mandateId: mandateCode?.id || 0,
            tableId: mandateCode?.id || 0,
            remark: 'Created',
            createdBy: user?.UserName,
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: 'Created',
        };

        axios({
            method: 'post',
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occured !!'));
                    return;
                }
                if (response?.data === true) {
                    dispatch(showMessage('Task submitted Successfully!'));
                    if (params?.source === 'list') {
                        navigate('/list/task');
                    } else {
                        navigate('/mandate');
                    }
                } else {
                    dispatch(fetchError('Error Occured !!'));
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    return (
        <>
            <div className="branchhandover">
                <Box component="h2" className="page-title-heading my-6">
                    Branch Handover
                </Box>

                <div
                    className="card-panel inside-scroll-215-branch-handover"
                    style={{
                        backgroundColor: '#fff',
                        padding: '0px',
                        border: '1px solid #0000001f',
                        borderRadius: '5px',
                    }}
                >
                    <MandateInfo mandateCode={mandateCode} setMandateData={setMandateData} source="" pageType="" redirectSource={`${params?.source}`} setMandateCode={setMandateCode} setCurrentStatus={setCurrentStatus} setCurrentRemark={setCurrentRemark} setpincode={() => {}} />

                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={value} onChange={handleChange} aria-label="lab API tabs example">
                            <Tab value={1} label="Mandatory Item List and Pictures" />
                            <Tab value={2} label="Key Handover Template" />
                        </Tabs>
                    </Box>
                    <TabPanel value={value} index={1} key="1">
                        <MandatoryItemListCmp setIsMandatoryItemChecked={setIsMandatoryItemChecked} currentStatus={currentStatus} currentRemark={currentRemark} mandateId={mandateCode} action={action} documentType={'Mandatory Item List and Pictures'} />
                    </TabPanel>
                    <TabPanel value={value} index={2} key="2">
                        {' '}
                        <KeyHandoverTemplate setIsKeyHandoverChecked={setIsKeyHandoverChecked} currentStatus={currentStatus} currentRemark={currentRemark} mandateId={mandateCode} action={action} documentType={'Key Handover Template'} />
                    </TabPanel>
                </div>
                <div className="bottom-fix-history">
                    <MandateStatusHistory mandateCode={mandateCode?.id} accept_Reject_Remark={currentRemark} accept_Reject_Status={currentStatus} />
                </div>
                {userAction?.module === module && (
                    <>
                        {action && (action === 'Create' || action === 'Upload') && isMandatoryItemChecked && isKeyHandoverChecked && (
                            <div className="bottom-fix-btn">
                                <div className="remark-field" style={{ marginRight: '0px' }}>
                                    <Button
                                        variant="outlined"
                                        size="medium"
                                        type="submit"
                                        name="submit"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (mandateCode?.id === undefined) {
                                                dispatch(fetchError('Please select Mandate !!!'));
                                                return;
                                            }

                                            workFlowMandate();
                                        }}
                                        style={{
                                            marginLeft: 10,
                                            padding: '2px 20px',
                                            borderRadius: 6,
                                            color: '#fff',
                                            borderColor: '#00316a',
                                            backgroundColor: '#00316a',
                                        }}
                                    >
                                        Send For Approval
                                    </Button>
                                    {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                </div>
                            </div>
                        )}

                        {action && action === 'Handover Branch To Business' && (
                            <div className="bottom-fix-btn">
                                <div className="remark-field" style={{ marginRight: '0px' }}>
                                    <Button
                                        variant="outlined"
                                        size="medium"
                                        type="submit"
                                        name="submit"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (mandateCode?.id === undefined) {
                                                dispatch(fetchError('Please select Mandate !!!'));
                                                return;
                                            }

                                            workFlowMandate();
                                        }}
                                        style={{
                                            marginLeft: 10,
                                            padding: '2px 20px',
                                            borderRadius: 6,
                                            color: '#fff',
                                            borderColor: '#00316a',
                                            backgroundColor: '#00316a',
                                        }}
                                    >
                                        Handover Branch To Business
                                    </Button>
                                    {userAction?.stdmsg !== undefined && <span className="message-right-bottom">{userAction?.stdmsg}</span>}
                                </div>
                            </div>
                        )}

                        {action && action === 'Approve' && (
                            <div className="bottom-fix-btn">
                                <div className="remark-field">
                                    <ApproveAndRejectAction
                                        approved={approved}
                                        sendBack={sendBack}
                                        setSendBack={setSendBack}
                                        setApproved={setApproved}
                                        remark={remark}
                                        setRemark={setRemark}
                                        approveEvent={() => {
                                            workflowFunctionAPICall(
                                                runtimeId,
                                                mandateCode?.id,

                                                remark,
                                                'Approved',
                                                navigate,
                                                user,
                                            );
                                        }}
                                        sentBackEvent={() => {
                                            workflowFunctionAPICall(
                                                runtimeId,
                                                mandateCode?.id,

                                                remark,
                                                'Sent Back',
                                                navigate,
                                                user,
                                            );
                                        }}
                                    />
                                    <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                </div>
                            </div>
                        )}
                        {action && action?.trim() === 'Approve or Reject' && user?.role === 'GEO Associate' && (
                            <div className="bottom-fix-btn">
                                <div className="remark-field">
                                    <ParticalComplete
                                        approved={approved}
                                        sendBack={sendBack}
                                        setSendBack={setSendBack}
                                        setApproved={setApproved}
                                        rejected={rejected}
                                        setRejected={setRejected}
                                        remark={remark}
                                        setRemark={setRemark}
                                        approveEvent={() => {
                                            workflowFunctionAPICall(runtimeId, mandateCode?.id, remark, 'Approved', navigate, user);
                                        }}
                                        sentBackEvent={() => {
                                            workflowFunctionAPICall(runtimeId, mandateCode?.id, remark, 'Approved_Partial', navigate, user);
                                        }}
                                        rejectEvent={() => {
                                            workflowFunctionAPICall(runtimeId, mandateCode?.id, remark, 'Rejected', navigate, user);
                                        }}
                                    />
                                    <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                </div>
                            </div>
                        )}
                        {action && action?.trim() === 'Approve or Reject' && user?.role !== 'GEO Associate' && (
                            <div className="bottom-fix-btn">
                                <div className="remark-field">
                                    <ApproveAndRejectAction
                                        approved={approved}
                                        sendBack={sendBack}
                                        setSendBack={setSendBack}
                                        setApproved={setApproved}
                                        remark={remark}
                                        setRemark={setRemark}
                                        approveEvent={() => {
                                            workflowFunctionAPICall(runtimeId, mandateCode?.id, remark, 'Approved', navigate, user);
                                        }}
                                        sentBackEvent={() => {
                                            workflowFunctionAPICall(
                                                runtimeId,
                                                mandateCode?.id,

                                                remark,
                                                'Sent Back',
                                                navigate,
                                                user,
                                            );
                                        }}
                                    />
                                    <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default TabsComponent;
