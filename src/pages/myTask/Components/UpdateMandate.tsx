import { Button, TextField, Grid, createFilterOptions, Autocomplete, Typography, Tooltip } from '@mui/material';
import axios from 'axios';
import { secondaryButton } from 'shared/constants/CustomColor';
import { _validationMaxFileSizeUpload } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import DownloadIcon from '@mui/icons-material/Download';
import { useLocation, useParams } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/store';
import workflowFunctionAPICall from './workFlowActionFunction';
import AcceptRejectAction from 'pages/common-components/AcceptRejectAction';
import ApproveAndRejectAction from 'pages/common-components/ApproveRejectAction';
import moment from 'moment';
import { SHOW_MESSAGE } from 'types/actions/Common.action';
import { useDispatch } from 'react-redux';
import { useUrlSearchParams } from 'use-url-search-params';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import DataTable from '../../common-components/Table';
import MandateStatusHistory from 'pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp';
import MandateInfo from 'pages/common-components/MandateInformation';
import { fetchError, showMessage } from 'redux/actions';
import regExpressionTextField, { textFieldValidationOnPaste, regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';
import { downloadFile } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import FileNameDiaglogList from 'pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { AgGridReact } from 'ag-grid-react';
import groupByDocumentData from 'pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData';

const MAX_COUNT = 8;
const UpdateMandate = () => {
    const [mandateInfo, setMandateInfo] = React.useState<any>([]);
    const [docUploadHistory, setDocUploadHistory] = useState([]);
    const [fileLength, setFileLength] = useState(0);
    const gridRef = React.useRef<AgGridReact>(null);
    const [docType, setDocType] = useState('CancelMandate');
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const fileInput = React.useRef(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileLimit, setFileLimit] = useState(false);
    const [cancelRemark, setCancelRemark] = useState('');
    const [params] = useUrlSearchParams({}, {});
    const { user } = useAuthUser();
    const [mandateData, setMandateData] = useState(null);
    const dispatch = useDispatch();
    const [data, setData] = React.useState<any>({});
    const { id } = useParams();
    const location = useLocation();
    const apiType = location?.state?.apiType || '';
    const [holdRemark, setHoldRemark] = useState('');
    const [projectManager, setProjectManager] = React.useState([]);
    const [sourcingAssociateData, setSourcingAssociate] = React.useState([]);
    const [mandateList, setMandateList] = React.useState([]);
    const [currentStatus, setCurrentStatus] = React.useState('');
    const [currentRemark, setCurrentRemark] = React.useState('');
    const [sendBack, setSendBack] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const [remark, setRemark] = React.useState('');
    const [userAction, setUserAction] = React.useState(null);
    const [mandateId, setMandateId] = React.useState(null);
    const { userActionList } = useSelector<AppState, AppState['userAction']>(({ userAction }) => userAction);
    const [phaseList, setPhaseList] = React.useState([]);
    const [stateList, setStateList] = React.useState([]);
    const [districtList, setDistrictList] = React.useState([]);
    const [cityList, setCityList] = React.useState([]);
    const [tierList, setTierList] = React.useState([]);
    const [tierName, setTierName] = React.useState(null);
    const [state, setState] = React.useState(null);
    const [district, setDistrict] = React.useState(null);
    const [city, setCity] = React.useState(null);
    const [projectManagerID, setProjectManagerID] = React.useState();
    const [sourcingAssociateID, setSourcingAssociateID] = React.useState();
    const [branchAdminList, setBranchAdminList] = React.useState([]);
    const [count, setCount] = React.useState(0);
    const [info, setInfo] = useState([]);
    const [businessTypeList, setBusinessTypeList] = React.useState([]);
    const [businessAssociateList, setBusinessAssociateList] = React.useState([]);
    const [businessType, setBusinessType] = React.useState(null);
    const [businessAssociate, setBusinessAssociate] = React.useState(null);
    const [adminVerticalList, setAdminVerticalList] = React.useState(null);
    const [adminVertical, setAdminVertical] = React.useState([]);
    const [verticalHeadList, setVerticalHeadList] = React.useState(null);
    const [verticalHead, setVerticalHead] = React.useState([]);
    const [projectDeliveryManager, setProjectDeliveryManager] = React.useState(null);
    const [projectDeliveryManagerList, setProjectDeliveryManagerList] = React.useState([]);
    let path = window.location.pathname?.split('/');
    let module: any = window.location.pathname?.split('/')[path.length - 1];
    const [updateMandateDataError, setUpdateMandateDataError] = React.useState<any>({});
    const action = userAction?.action || '';
    const runtimeId = userAction?.runtimeId || 0;
    const [businessAssociateFlag, setBusinessAssociateFlag] = useState(false);

    useEffect(() => {
        if (action !== '') {
            if (action === 'Hold') {
                setDocType('HoldMandate');
            } else {
                setDocType('CancelMandate');
            }
        }
    }, [action]);

    let columnDefs = [
        {
            field: 'srno',
            headerName: 'Sr. No',
            headerTooltip: 'Serial Number',
            cellRenderer: (e: any) => {
                var index = e?.rowIndex;
                return index + 1;
            },

            sortable: true,
            resizable: true,
            width: 80,
            minWidth: 80,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'filename',
            headerName: 'File Name',
            headerTooltip: 'File Name',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                var data = e.data.filename;
                data = data?.split('.');
                data = data?.[0];
                return data || '';
            },
            width: 400,
            minWidth: 150,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdDate',
            headerName: 'Created Date',
            headerTooltip: 'Created Date',
            sortable: true,
            resizable: true,
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdDate).format('DD/MM/YYYY');
            },
            width: 150,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdDate',
            headerName: 'Created Time',
            headerTooltip: 'Created Time',
            cellRenderer: (e: any) => {
                return moment(e?.data?.createdDate).format('h:mm:ss A');
            },
            sortable: true,
            resizable: true,
            width: 150,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'createdBy',
            headerName: 'Created By',
            headerTooltip: 'Created By',
            sortable: true,
            resizable: true,
            width: 190,
            minWidth: 100,
            cellStyle: { fontSize: '13px' },
        },
        {
            field: 'Download',
            headerName: 'Download',
            headerTooltip: 'Download',
            resizable: true,
            width: 110,
            minWidth: 80,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <Tooltip title="Download" className="actionsIcons">
                            <DownloadIcon
                                style={{ fontSize: '15px' }}
                                onClick={() => {
                                    var mandate = { id: mandateId?.id };
                                    downloadFile(obj?.data, mandate, dispatch);
                                }}
                                className="actionsIcons"
                            />
                        </Tooltip>
                    </div>
                </>
            ),
        },
        {
            field: '',
            headerName: 'View',
            headerTooltip: 'View',
            resizable: true,
            width: 110,
            minWidth: 80,
            cellStyle: { fontSize: '13px', textAlign: 'center' },

            cellRenderer: (obj: any) => (
                <>
                    <div className="actions">
                        <FileNameDiaglogList props={obj} />
                    </div>
                </>
            ),
        },
    ];

    const getVersionHistoryData = () => {
        var id = mandateId?.id;
        if (id === undefined) {
            dispatch(fetchError('Please select mandate'));
            return;
        }
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/GetDocUploadHistory?mandateid=${id || 0}&documentType=${docType}`)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Error Occurred !'));
                    return;
                }
                if (response?.data && response?.data && response?.data?.length > 0) {
                    var data = groupByDocumentData(response?.data, 'versionNumber');
                    setDocUploadHistory(data || []);
                }
                if (response && response?.data?.length === 0) {
                    setDocUploadHistory([]);
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Error Occurred !'));
            });
    };

    React.useEffect(() => {
        if (id && id !== 'noid') {
            setMandateId(id);
        }
    }, [id]);

    useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            getVersionHistoryData();
        }
    }, [mandateId?.id, docType]);

    React.useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid') {
            const userAction = userActionList && userActionList?.find((item) => item?.mandateId === parseInt(mandateId?.id) && item?.module === module);

            if (apiType === '') {
                setUserAction(userAction);
            } else {
                let action = mandateId;
                setUserAction(action);
            }
            if (params.source === 'list') {
                navigate(`/mandate/${mandateId?.id}/${module}?source=list`, {
                    state: { apiType: apiType },
                });
            } else {
                navigate(`/mandate/${mandateId?.id}/${module}`, {
                    state: { apiType: apiType },
                });
            }
        }
    }, [mandateId]);

    const [branchType, setBranchType] = React.useState([]);
    const [glCategories, setGlCategories] = React.useState([]);
    const navigate = useNavigate();
    const setGlCategorId = (id) => {
        var obj = glCategories && glCategories?.length > 0 && glCategories?.find((item) => item?.id === id);
        return obj || null;
    };
    const setBranchTypeName = (id) => {
        var obj = branchType && branchType?.length > 0 && branchType?.find((item) => item?.id === id);
        return obj || null;
    };
    const setProjectManagerName = (id) => {
        var obj = projectManager && projectManager?.length > 0 && projectManager?.find((item) => item?.id === id);
        return obj || null;
    };
    const setSourcingAssociateName = (userId) => {
        var obj = sourcingAssociateData && sourcingAssociateData?.length > 0 && sourcingAssociateData?.find((item) => item?.userId == userId);

        return obj || null;
    };

    const setBranchAdminName = (userId) => {
        var obj = branchAdminList && branchAdminList?.length > 0 && branchAdminList?.find((item) => item?.id === userId);
        return obj || null;
    };

    function removeDuplicates(arr) {
        var unique = [];
        var temp = [];
        arr.forEach((element) => {
            if (!unique.includes(element?.glCategoryName)) {
                unique.push(element?.glCategoryName);
                temp.push(element);
            }
        });
        return temp;
    }

    const getGlCategory = (verticalId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/GetGLCategoryList?fk_vertical_id=${verticalId || 0}`)
            .then((response: any) => {
                // const unqData = removeDuplicates(response?.data);
                // setGlCategories([...unqData]);
                setGlCategories(response?.data);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        if (mandateInfo?.verticalId !== undefined && mandateInfo?.verticalId != 0) {
            getGlCategory(mandateInfo?.verticalId);
        }
    }, [mandateInfo?.verticalId]);

    useEffect(() => {
        if (mandateInfo?.glCategoryId !== undefined && mandateInfo?.glCategoryId != 0) {
            getBranchType(mandateInfo?.glCategoryId);
        }
    }, [mandateInfo?.glCategoryId]);

    const getBranchType = (glCategoryId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Verticals/GetBranchType?glcategoryId=${glCategoryId || 0}`)
            .then((response: any) => {
                setBranchType(response?.data || []);
            })
            .catch((e: any) => {});
    };
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetStateList`)
            .then((response: any) => {
                console.log('res-state', response);
                setStateList(response?.data || []);
            })
            .catch((e: any) => {});
    }, []);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/TierMaster/GetTierMasterList`)
            .then((response: any) => {
                console.log('res-state', response);
                setTierList(response?.data || []);
            })
            .catch((e: any) => {});
    }, []);

    useEffect(() => {
        if (state?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetDistrictList?stateid=${state?.id}`)
                .then((response: any) => {
                    console.log('res-dist', response);
                    setDistrictList(response?.data || []);
                })
                .catch((e: any) => {});
        }
    }, [state?.id]);

    useEffect(() => {
        if (district?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetCityList?stateid=${state?.id}&districtid=${district?.id}`)
                .then((response: any) => {
                    console.log('dis-city', response);
                    setCityList(response?.data || []);
                })
                .catch((e: any) => {});
        }
    }, [state?.id, district?.id]);


  useEffect(() => {
    setState(stateList.find((item)=> item?.stateName?.toLowerCase() === mandateInfo?.state?.toLowerCase()))
  }, [stateList,mandateInfo?.state])
  
  useEffect(() => {
    setDistrict(districtList.find((item)=> item?.districtName?.toLowerCase() === mandateInfo?.district?.toLowerCase()))
  }, [districtList,mandateInfo?.district])

  useEffect(() => {
    setCity(cityList.find((item)=> item?.cityName?.toLowerCase() === mandateInfo?.city?.toLowerCase()))
  }, [cityList,mandateInfo?.city])

    useEffect(() => {
        setTierName(tierList.find((item) => item.tierName === mandateInfo?.tierName));
    }, [tierList, mandateInfo?.tierName]);

    useEffect(() => {
        if (mandateInfo?.verticalId !== undefined && mandateInfo?.verticalId != 0) {
            // const glCategoryId = +values?.glCategory;
            getBusinessType(mandateInfo?.verticalId, mandateInfo?.glCategoryId);
        }
    }, [mandateInfo?.verticalId, mandateInfo?.glCategoryId]);

    const getBusinessType = (verticalId, glCategoryId) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/GetBusinessTypeList?fk_vertical_id=${verticalId || 0}&fk_gl_category=${glCategoryId || 0}`)
            .then((response: any) => {
                console.log('res-businesstype', response);
                setBusinessTypeList(response?.data || []);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        if (businessType?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminBusinessMaster/GetBusinessAssociateList?fk_business_type=${businessType?.id}`)
                .then((response: any) => {
                    console.log('res-businesstype', response);
                    setBusinessAssociateList(response?.data || []);
                })
                .catch((e: any) => {});
        }
    }, [businessType?.id]);

    useEffect(() => {
        setBusinessType(businessTypeList.find((item) => item.id === mandateInfo?.fk_business_type));
    }, [businessTypeList, mandateInfo?.fk_business_type]);

    useEffect(() => {
        if (businessAssociateFlag === false && businessAssociateList.length > 0) {
            setBusinessAssociate(businessAssociateList.find((item) => item.id === mandateInfo?.fk_business_associate));
            setBusinessAssociateFlag(true);
        }
    }, [businessAssociateList, mandateInfo?.fk_business_associate]);

    useEffect(() => {
        if (district?.id !== undefined && district?.id !== undefined && city?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetAdminVerticalList?stateid=${state?.id}&districtid=${district?.id}&cityid=${city?.id}`)
                .then((response: any) => {
                    console.log('dis-admin', response);

                    // const newAdminVertical = [...adminVertical, response?.data[0]?.verticalName]
                    const adminVerticalId = response?.data.find((item) => item.id);
                    setAdminVerticalList(adminVerticalId);
                    console.log('adminVerticalId', adminVerticalId);
                    setAdminVertical([response?.data[0]?.admin_Vertical_List_Name]);
                })
                .catch((e: any) => {});
        }
    }, [state?.id, district?.id, city?.id]);

    useEffect(() => {
        if (district?.id !== undefined && district?.id !== undefined && city?.id !== undefined && adminVerticalList?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetVerticalHeadList?stateid=${state?.id}&districtid=${district?.id}&cityid=${city?.id}&fk_admin_vertical_id=${adminVerticalList?.id}`)
                .then((response: any) => {
                    console.log('dis-vertical', response);
                    // setAdminVerticalList(response?.data || [])
                    // const newAdminVertical = [...adminVertical, response?.data[0]?.verticalName]
                    setVerticalHeadList(response?.data.find((item) => item.id));
                    setVerticalHead([response?.data[0]?.userName]);
                })
                .catch((e: any) => {});
        }
    }, [state?.id, district?.id, city?.id, adminVerticalList?.id]);

    useEffect(() => {
        if (state?.id !== undefined && district?.id !== undefined && city?.id !== undefined && adminVerticalList?.id !== undefined) {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/AdminVerticalMaster/GetPDMList?fk_state_id=${state?.id}&fk_district_id=${district?.id}&fk_city_id=${city?.id}&fk_admin_vertical_id=${adminVerticalList?.id}`)
                .then((response: any) => {
                    console.log('pdm', response);
                    setProjectDeliveryManagerList([response?.data[0]?.userName]);
                    setProjectDeliveryManager(response?.data.find((item) => item.id));
                })
                .catch((e: any) => {});
        }
    }, [state?.id, district?.id, city?.id, adminVerticalList?.id]);

    // useEffect(() => {
    //   setProjectDeliveryManager(projectDeliveryManagerList.find((item)=> item.id === mandateInfo?.fk_project_delivery_manager))
    // }, [projectDeliveryManagerList,mandateInfo?.fk_project_delivery_manager]);

    useEffect(() => {
        if (branchType && branchType?.length > 0 && glCategories?.length > 0 && mandateInfo?.branchId !== undefined && mandateInfo?.glCategoryId !== undefined) {
            setData((state) => ({
                ...state,
                ['glCategoryId']: mandateInfo?.glCategoryId && setGlCategorId(mandateInfo?.glCategoryId),
                ['branchType']: mandateInfo?.branchId && setBranchTypeName(mandateInfo?.branchId),
            }));
        }
    }, [branchType, glCategories, mandateInfo]);

    const getById = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesById?id=${id}`)
            .then((response: any) => {
                var obj = response?.data;
                setMandateInfo(response?.data);
                var _isMandateHold = response?.data?.hold_Remarks;
                var _isMandateCancel = response?.data?.cancel_Remarks;
                if (_isMandateCancel !== '') {
                    setDocType('CancelMandate');
                }
                if (_isMandateHold !== '') {
                    setDocType('HoldMandate');
                }
                setData({
                    ...response?.data,
                    ['id']: obj?.id,
                    ['mandateCode']: obj?.mandateCode,
                    ['phaseCode']: obj?.phaseCode,
                    ['pincode']: obj?.pincode,
                    // ["state"]: obj?.state,
                    ['region']: obj?.region,
                    // ["district"]: obj?.district,
                    // ["city"]: obj?.city,
                    ['location']: obj?.location,
                    // ["tierName"]: obj?.tierName,
                    ['remark']: obj?.remark,
                   ["projectManagerId"]: {userName : obj?.projectManagerName, id : obj?.projectManagerId},
            // {userName : obj?.projectManagerId},
            // &&
            // setProjectManagerName(obj?.projectManagerId),
                    ['projectManagerRemarks']: obj?.pM_Remarks,
                    ['branchCode']: obj?.branchCode,
                    ['sourcingAssociate']: {
                       userName : obj?.sourcingAssociate, id: obj?.sourcingAssociateId
                    },
                    // && setSourcingAssociateName(obj?.sourcingAssociate),
                    ['branchAdmin']: {
                        userName: obj?.branchAdminName,
                        id: obj?.branchAdminId,
                    },
                });
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        if (projectManager?.length > 0 && id) {
            getById();
        }
    }, [projectManager]);

    useEffect(() => {
        var reporting_id = mandateInfo?.fk_project_delivery_manager || 0;
        if (data?.verticalName !== '') {
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/User/GetAllWithConditions?Designation=Project Manager&reporting_id=${reporting_id}`)
                .then((response: any) => {
                    if (!response) return;
                    setProjectManager(response?.data || []);
                })
                .catch((e: any) => {});
            axios
                .get(`${process.env.REACT_APP_BASEURL}/api/User/GetAllWithConditions?Designation=Sourcing Associate&VerticalType=${encodeURIComponent(mandateInfo?.admin_vertical) || ''}&reporting_id=0`)
                .then((response: any) => {
                    if (!response) return;
                    setSourcingAssociate(response?.data || []);
                })
                .catch((e: any) => {});
        }
    }, [mandateInfo?.admin_vertical, mandateInfo?.fk_project_delivery_manager]);

    const submitCancelMandateAction = (e: any) => {
        var id = mandateId?.id;
        if (id === undefined) {
            dispatch(fetchError('Please select mandate'));
            return;
        }
        if (docUploadHistory && docUploadHistory?.length === 0) {
            dispatch(fetchError('Please upload file'));
            return;
        }
        if (cancelRemark === '') {
            dispatch(fetchError('Please enter remark'));
            return;
        }
        e.preventDefault();
        const body = {
            id: data?.id,
            uid: '',

            phaseId: data?.phaseId || '',
            mandateCode: data?.mandateCode || '',
            glCategoryId: data?.glCategoryId?.id,
            branchId: data?.branchType?.id,
            branchCode: data?.branchCode || '',
            pincode: data?.pincode || '',
            state: data?.state?.stateName || '',
            region: data?.region || '',
            district: data?.district?.districtName || '',
            city: data?.city?.cityName || '',
            location: data?.location || '',
            tierName: data?.tierName?.tierName || '',
            fk_business_type: data?.fk_business_type?.id,
            fk_business_associate: data?.fk_business_associate?.id,
            fk_admin_vertical: adminVerticalList?.id,
            fk_vertical_head: verticalHeadList?.id,
            fk_project_delivery_manager: projectDeliveryManager?.id,
            remark: data?.remark || '',
            sourcingAssociate: data?.sourcingAssociate?.id || 0,
            fk_branch_admin: data?.branchAdmin?.id || 0,
            branchAdminName: data?.branchAdmin?.userName,
            projectManagerId: data?.projectManagerId?.id || 0,
            pM_Remarks: data?.pM_Remarks || '',
            completionPer: data?.completionPer || 0,
            createdBy: user?.UserName || '',
            createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            modifiedBy: user?.UserName || '',
            modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            cancel_Remarks: cancelRemark || '',
            hold_Remarks: '',
            accept_Reject_Status: 'Cancel Request',
            accept_Reject_Remark: 'Cancel Request',
            status: 'Cancel Request',
        };
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/Mandates/UpdateMandates?id=${mandateId?.id || 0}`, body)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Mandate Cancellation failed !!!'));
                    return;
                }
                if (response?.data === true) {
                    dispatch(showMessage('Mandate Cancellation is completed successfully!'));
                    workflow('Cancel');
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Mandate Cancellation failed !!!'));
                return;
            });
    };

    const resetMandate = () => {
        setData({
            ['id']: data?.id,
            ['mandateCode']: data?.mandateCode,
            ['phaseCode']: data?.phaseCode,
            ['phaseId']: data?.phaseId,
            ['glCategoryId']: 0,
            ['branchType']: 0,
            ['pincode']: '',
            ['projectManagerId']: 0,
            ['createdDate']: data?.createdDate,
            ['modifiedDate']: data?.modifiedDate,
            ['accept_Reject_Status']: data?.accept_Reject_Status || '',
            ['accept_Reject_Remark']: data?.accept_Reject_Remark || '',
            ['projectManagerRemarks']: data?.projectManagerRemarks,
            ['branchCode']: data?.branchCode,
            ['sourcingAssociate']: data?.sourcingAssociate,
            ['branchAdmin']: data?.branchAdmin,
        });
    };

    const workflow = (action = 'Update Mandate') => {
        const body = {
            runtimeId: runtimeId || 0,
            mandateId: id || 0,
            tableId: id || 0,
            remark: data?.remark || 'Updated',
            createdBy: user?.UserName,
            createdOn: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            action: action || '',
        };
        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ''}`)
            .then((response: any) => {
                if (!response) return;

                if (response?.data === true) {
                    if (params?.source === 'list') {
                        navigate('/list/task');
                    } else {
                        navigate('/mandate');
                    }
                } else {
                    dispatch(fetchError('Error Occured !!'));
                }
            })
            .catch((e: any) => {});
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });

        if (value === null) {
            delete updateMandateDataError[name];
            setUpdateMandateDataError({ ...updateMandateDataError });
        } else {
            setUpdateMandateDataError({
                ...updateMandateDataError,
                [name]: '',
            });
        }
    };
    const _validationUpdateMandate = () => {
        let temp = {};
        let no = 0;
        let regExp = new RegExp('^[1-9]{1}[0-9]{2}s{0,1}[0-9]{3}$');

        if (action == '' || action === null) {
            if (data?.glCategoryId == 0 || data?.glCategoryId === null) {
                no++;
                temp = { ['glCategoryId']: 'Please enter GL Category' };
            }

            if (data?.branchType == 0 || data?.branchType === null) {
                no++;
                temp = { ...temp, ['branchType']: 'Please enter Branch Type' };
            }

            if (data?.pincode == '' || data?.pincode === null) {
                no++;
                temp = { ...temp, ['pincode']: 'Please enter Pin Code' };
            } else if (data?.pincode[0] == '0') {
                no++;
                temp = { ...temp, ['pincode']: 'Pin Code should not start with 0' };
            } else if (data?.pincode?.length < 6) {
                no++;
                temp = { ...temp, ['pincode']: 'Pin Code must be 6 digit' };
            } else if (data?.pincode && !regExp.test(data?.pincode)) {
                no++;
                temp = { ...temp, ['pincode']: 'Please enter correct Pin Code' };
            }
        }

        if (action === 'Initiate') {
            if (data?.pincode == '' || data?.pincode === null) {
                no++;
                temp = { ...temp, ['pincode']: 'Please enter Pin Code' };
            } else if (data?.pincode[0] == '0') {
                no++;
                temp = { ...temp, ['pincode']: 'Pin Code should not start with 0' };
            } else if (data?.pincode?.length < 6) {
                no++;
                temp = { ...temp, ['pincode']: 'Pin Code must be 6 digit' };
            } else if (data?.pincode && !regExp.test(data?.pincode)) {
                no++;
                temp = { ...temp, ['pincode']: 'Please enter correct Pin Code' };
            }
            if (data?.region === '' || data?.region === null) {
                no++;
                temp = { ...temp, ['region']: 'Please enter Region' };
            }
            if (data?.district === '' || data?.district === null) {
                no++;
                temp = { ...temp, ['district']: 'Please enter District' };
            }
            if (data?.city === '' || data?.city === null) {
                no++;
                temp = { ...temp, ['city']: 'Please enter City' };
            }
            if (data?.state === '' || data?.state === null) {
                no++;
                temp = { ...temp, ['state']: 'Please enter State' };
            }
            if (data?.location === '' || data?.location === null) {
                no++;
                temp = { ...temp, ['location']: 'Please enter Location Name' };
            }

            if (data?.tierName === '' || data?.tierName === null) {
                no++;
                temp = { ...temp, ['tierName']: 'Please enter Tier Name' };
            }
            if (data?.remark === '' || data?.remark === null) {
                no++;
                temp = { ...temp, ['remark']: 'Please enter Remark' };
            }
            if (businessAssociate === '' || businessAssociate === null) {
                no++;
                temp = { ...temp, ['fk_business_associate']: 'Please select Business Associate' };
            }
        }
        if (action && (action === 'Update Sourcing Associate and Branch Admin and Branch Admin' || action === 'Update Sourcing Associate and Branch Admin')) {
            if (data?.sourcingAssociate?.userName === '' || data?.sourcingAssociate?.userName === null) {
                temp = { ['sourcingAssociate']: 'Please select Sourcing Associate' };
            }
            if (data?.branchAdmin?.id === 0) {
                temp = { ...temp, ['branchAdmin']: 'Please select Branch Admin' };
            }
            console.log('temp', temp, data);
        }
        if (action && action === 'Update Branch Code') {
            if (data?.branchCode === '' || data?.branchCode === null) {
                temp = { ['branchCode']: 'Please enter Branch Code' };
            }
        }
        if (action && action === 'Assign Project Manager') {
            if (data?.projectManagerId == 0 || data?.projectManagerId === null) {
                temp = { ['projectManagerId']: 'Please select Project Manager' };
            }
        }
        setCount(no);
        setUpdateMandateDataError({ ...updateMandateDataError, ...temp });
        return { ...updateMandateDataError, ...temp };
    };

    useEffect(() => {
        if (data?.length > 0) {
            _validationUpdateMandate();
        }
    }, [data]);
    const handleUploadFiles = async (e, files) => {
        const uploaded = [...uploadedFiles];
        let limitExceeded = false;
        files &&
            files?.some((file) => {
                if (uploaded && uploaded?.findIndex((f) => f.name === file.name) === -1) {
                    uploaded.push(file);
                    if (uploaded?.length === MAX_COUNT) setFileLimit(true);
                    if (uploaded?.length > MAX_COUNT) {
                        dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));
                        setFileLimit(false);
                        limitExceeded = true;
                        e.target.value = null;
                        return;
                    }
                }
            });
        if (limitExceeded) {
            dispatch(fetchError(`You can only add a maximum of ${MAX_COUNT} files` || ''));
            e.target.value = null;
            return;
        }

        if (!limitExceeded) setUploadedFiles(uploaded);

        setFileLength((uploaded && uploaded?.length) || 0);
        const formData: any = new FormData();
        var id = mandateId?.id;

        formData.append('mandate_id', id);
        formData.append('documenttype', docType);
        formData.append('CreatedBy', user?.UserName || '');
        formData.append('ModifiedBy', user?.UserName || '');
        formData.append('entityname', docType);
        formData.append('RecordId', id);
        formData.append('remarks', cancelRemark || '');

        uploaded &&
            uploaded?.map((file) => {
                formData.append('file', file);
            });
        if (uploaded?.length === 0) {
            setUploadedFiles([]);
            setFileLimit(false);
            dispatch(fetchError('Error Occurred !'));
            e.target.value = null;
            return;
        }

        if (id !== undefined) {
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUpload`, formData)
                .then((response: any) => {
                    e.target.value = null;
                    if (!response) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(fetchError('Error Occurred !'));
                        return;
                    }
                    if (response?.data?.data == null) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(fetchError('Documents are not uploaded!'));
                        getVersionHistoryData();
                        return;
                    } else if (response?.status === 200) {
                        setUploadedFiles([]);
                        setFileLimit(false);
                        dispatch(showMessage('Documents are uploaded successfully!'));
                        getVersionHistoryData();
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError('Error Occurred !'));
                });
        }
    };

    const getHeightForTable = useCallback(() => {
        var height = 0;
        var dataLength = (docUploadHistory && docUploadHistory?.length) || 0;
        if (dataLength === 0) return '0px';
        height = 45 * dataLength + 57;

        if (height > 0 && dataLength <= 4) return `${height}px`;
        return '200px';
    }, [docUploadHistory, docType]);

    const handleFileEvent = (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files);
        if (_validationMaxFileSizeUpload(e, dispatch)) {
            handleUploadFiles(e, chosenFiles);
        }
    };

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        gridRef.current!.api.sizeColumnsToFit();
    }

    console.log('glcat', data?.location, data?.tierName, tierName?.tierName, data?.remark);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const curruntDataError = _validationUpdateMandate();
        var noOfErrors = 0;
        let newStatus = '';
        for (const key in curruntDataError) {
            if (`${curruntDataError[key]}` !== '') {
                noOfErrors = noOfErrors + 1;
            }
        }

        if (data?.locationName !== '' && tierName?.tierName !== '' && data?.remark !== '') {
            newStatus = 'Initiated';
        } else {
            newStatus = 'Created';
        }

        if (noOfErrors === 0) {
            const body = {
                id: data?.id,
                uid: '',
                status: newStatus,
                phaseId: data?.phaseId || '',
                mandateCode: data?.mandateCode || '',
                glCategoryId: data?.glCategoryId?.id,
                branchId: data?.branchType?.id,
                branchCode: data?.branchCode || '',
                pincode: data?.pincode || '',
                state: state?.stateName || '',
                region: data?.region || '',
                district: district?.districtName || '',
                city: city?.cityName || '',
                location: data?.location || '',
                tierName: tierName?.tierName || '',
                fk_business_type: businessType?.id,
                fk_business_associate: businessAssociate?.id,
                fk_admin_vertical: adminVerticalList?.id,
                fk_vertical_head: verticalHeadList?.id,
                fk_project_delivery_manager: projectDeliveryManager?.id,
                remark: data?.remark || '',
                sourcingAssociate: data?.sourcingAssociate?.id || 0,
                fk_branch_admin: data?.branchAdmin?.id || 0,
                branchAdminName: data?.branchAdmin?.userName,
                projectManagerId: data?.projectManagerId?.id || 0,
                pM_Remarks: data?.pM_Remarks || '',
                completionPer: data?.completionPer || 0,
                accept_Reject_Status: data?.accept_Reject_Status || '',
                accept_Reject_Remark: data?.accept_Reject_Remark || '',
                createdBy: data?.createdBy || '',
                createdDate: data?.createdDate || '',
                modifiedBy: data?.modifiedBy || '',
                modifiedDate: data?.modifiedDate || '',
            };
            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/Mandates/UpdateMandates?id=${data?.id}`, body)
                .then((response: any) => {
                    if (!response) return;
                    dispatch({
                        type: SHOW_MESSAGE,
                        message: 'Record updated successfully!',
                    });
                    workflow();
                })
                .catch((e: any) => {});
        }
    };

    const _getMandateList = () => {
        axios({
            method: 'get',
            url: `${process.env.REACT_APP_BASEURL}/api/Mandates/DropDownMandet`,
        }).then((res) => {
            if (res && res.data && res.data.length > 0) {
                setMandateList(res?.data);
            }
        });
    };
    useEffect(() => {
        _getMandateList();
        _getPhaseCodeList();
    }, []);

    const _getPhaseCodeList = () => {
        axios({
            method: 'get',
            url: `${process.env.REACT_APP_BASEURL}/api/Mandates/DropDownPhase`,
        }).then((res) => {
            if (res && res.data && res.data.length > 0) {
                setPhaseList(res?.data);
            }
        });
    };

    const getProjectManagerRoleID = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/GetRoleId?Role_Name=Project Manager`)
            .then((response: any) => {
                setProjectManagerID(response?.data);
            })
            .catch((e: any) => {});
    };

    const getSourcingAssociateRoleID = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/Mandates/GetRoleId?Role_Name=Sourcing Associate`)
            .then((response: any) => {
                setSourcingAssociateID(response?.data || []);
            })
            .catch((e: any) => {});
    };

    const getBranchAdminRole = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/User/GetBranchAdminWithConditions?VerticalType=${encodeURIComponent(mandateInfo?.admin_vertical) || ''}`)
            .then((response: any) => {
                setBranchAdminList(response?.data || []);
            })
            .catch((e: any) => {});
    };

    useEffect(() => {
        getProjectManagerRoleID();
        getSourcingAssociateRoleID();
    }, []);

    useEffect(() => {
        if (mandateInfo?.admin_vertical) getBranchAdminRole();
    }, [mandateInfo?.admin_vertical]);
    useEffect(() => {
        if (!projectManagerID) return;
        if (!sourcingAssociateID) return;
    }, [projectManagerID, sourcingAssociateID]);

    const submitHoldMandateAction = (e: any) => {
        var mandateCode = mandateId?.id || 0;
        if (mandateCode === undefined) {
            dispatch(fetchError('Please select mandate'));
            return;
        }
        if (docUploadHistory && docUploadHistory?.length === 0) {
            dispatch(fetchError('Please upload file'));
            return;
        }
        if (holdRemark === '') {
            dispatch(fetchError('Please enter remark'));
            return;
        }

        e.preventDefault();
        const body = {
            ...mandateInfo,
            fk_branch_admin: data?.branchAdmin?.id || 0,
            branchAdminName: data?.branchAdmin?.userName,
            createdBy: user?.UserName || '',
            createdDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            modifiedBy: user?.UserName || '',
            modifiedDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            cancel_Remarks: '',
            hold_Remarks: holdRemark || '',
            accept_Reject_Status: 'Hold Request',
            status: 'Hold Request',
        };

        axios
            .post(`${process.env.REACT_APP_BASEURL}/api/Mandates/UpdateMandates?id=${mandateId}`, body)
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError('Mandate Operation failed !!!'));
                    return;
                }

                if (response?.data === true) {
                    dispatch(showMessage('Mandate Operation is completed successfully!'));
                    workflow('Hold');
                }
            })
            .catch((e: any) => {
                dispatch(fetchError('Mandate Operation failed !!!'));
                return;
            });
    };

    return (
        <div>
            <div className="card-panal inside-scroll-250">
                <MandateInfo mandateCode={mandateId} source="" pageType="phase" setMandateData={setMandateData} redirectSource={`${params?.source}`} setMandateCode={setMandateId} setpincode={() => {}} setCurrentStatus={setCurrentStatus} setCurrentRemark={setCurrentRemark} />

                <form onSubmit={handleSubmit}>
                    <>
                        <div className="phase-outer">
                            <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable">Phase Code</h2>
                                        <TextField name="phaseId" id="phaseId" variant="outlined" size="small" className="w-85" disabled value={data?.phaseCode} onChange={handleChange} />
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable">Mandate Code</h2>
                                        <TextField name="mandateCode" id="mandateCode" variant="outlined" size="small" className="w-85" value={data?.mandateCode} onChange={handleChange} disabled />
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">GL Category</h2>
                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                (action === 'Approve' || action === 'Accept' || action === 'Update Sourcing Associate and Branch Admin and Branch Admin' || action === 'Initiate' || action === 'Update Branch Code' || data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '10px',
                                                }
                                            }
                                            disabled={
                                                info?.length !== 0 ||
                                                action === 'Approve' ||
                                                action === 'Accept' ||
                                                action === 'Update Sourcing Associate and Branch Admin and Branch Admin' ||
                                                action === 'Initiate' ||
                                                action === 'Assign Project Manager' ||
                                                action === 'Update Branch Code' ||
                                                data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.glCategoryName?.toString() || ''}
                                            disableClearable={true}
                                            options={glCategories || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.glCategoryName,
                                            })}
                                            value={data?.glCategoryId || ''}
                                            defaultValue={data?.glCategoryId || ''}
                                            onChange={(e, value) => {
                                                setData({
                                                    ...data,
                                                    glCategoryId: value,
                                                    branchType: null,
                                                });
                                                getBranchType(value?.id || 0);
                                                if (value === null) {
                                                    delete updateMandateDataError['glCategoryId'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['glCategoryId']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={
                                                        (info?.length !== 0 ||
                                                            action === 'Approve' ||
                                                            action === 'Accept' ||
                                                            action === 'Update Sourcing Associate and Branch Admin' ||
                                                            action === 'Initiate' ||
                                                            action === 'Assign Project Manager' ||
                                                            action === 'Update Branch Code' ||
                                                            data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                            backgroundColor: '#f3f3f3',
                                                            borderRadius: '10px',
                                                        }
                                                    }
                                                    size="small"
                                                />
                                            )}
                                        />
                                        {updateMandateDataError?.glCategoryId && updateMandateDataError?.glCategoryId ? <p className="form-error">{updateMandateDataError?.glCategoryId}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Branch Type</h2>
                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                (action === 'Approve' || action === 'Accept' || action === 'Update Sourcing Associate and Branch Admin' || action === 'Initiate' || action === 'Update Branch Code' || data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '6px',
                                                }
                                            }
                                            disabled={
                                                info?.length !== 0 ||
                                                action === 'Approve' ||
                                                action === 'Accept' ||
                                                action === 'Update Sourcing Associate and Branch Admin' ||
                                                action === 'Initiate' ||
                                                action === 'Assign Project Manager' ||
                                                action === 'Update Branch Code' ||
                                                data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.branchTypeName?.toString() || ''}
                                            disableClearable={true}
                                            options={branchType || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.branchTypeName,
                                            })}
                                            value={data?.branchType || ''}
                                            defaultValue={data?.branchType || ''}
                                            onChange={(e, value) => {
                                                setData({ ...data, branchType: value });
                                                if (value === null) {
                                                    delete updateMandateDataError['branchType'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['branchType']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={
                                                        (info?.length !== 0 ||
                                                            action === 'Approve' ||
                                                            action === 'Accept' ||
                                                            action === 'Update Sourcing Associate and Branch Admin' ||
                                                            action === 'Initiate' ||
                                                            action === 'Assign Project Manager' ||
                                                            action === 'Update Branch Code' ||
                                                            data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                            backgroundColor: '#f3f3f3',
                                                            borderRadius: '10px',
                                                        }
                                                    }
                                                    size="small"
                                                />
                                            )}
                                        />
                                        {updateMandateDataError?.branchType && updateMandateDataError?.branchType ? <p className="form-error">{updateMandateDataError?.branchType}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Pin Code</h2>
                                        <TextField
                                            autoComplete="off"
                                            name="pincode"
                                            id="pincode"
                                            type="text"
                                            variant="outlined"
                                            disabled={
                                                info?.length !== 0 ||
                                                action === 'Approve' ||
                                                action === 'Accept' ||
                                                action === 'Update Sourcing Associate and Branch Admin' ||
                                                action === 'Assign Project Manager' ||
                                                action === 'Update Branch Code' ||
                                                data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            size="small"
                                            className="w-85"
                                            value={data?.pincode}
                                            InputProps={{ inputProps: { min: 0, maxLength: 6 } }}
                                            onChange={handleChange}
                                            onBlur={() => _validationUpdateMandate()}
                                            onKeyPress={(event) => {
                                                if (!/[0-9]/.test(event.key)) {
                                                    event.preventDefault();
                                                }
                                            }}
                                        />
                                        {updateMandateDataError?.pincode && updateMandateDataError?.pincode ? <p className="form-error">{updateMandateDataError?.pincode}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Initiate' ? <h2 className="phaseLable required">State</h2> : <h2 className="phaseLable">State</h2>}

                                        {/* <TextField
                      name="state"
                      id="state"
                      variant="outlined"
                      size="small"
                      className="w-85"
                      disabled={
                        info?.length !== 0 ||
                        action === "Approve" ||
                        action === "Accept" ||
                        action ===
                        "Update Sourcing Associate and Branch Admin" ||
                        action === "Assign Project Manager" ||
                        action === "Update Branch Code"
                      }
                      value={data?.state}
                      onChange={handleChange}                      
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyPress={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }
                        regExpressionTextField(e);
                        if (/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    /> */}
                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                (action === 'Approve' ||
                                                    action === 'Accept' ||
                                                    action === 'Update Sourcing Associate and Branch Admin and Branch Admin' ||
                                                    action === 'Initiate' ||
                                                    action === 'Assign Project Manager' ||
                                                    action === 'Update Branch Code' ||
                                                    data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '10px',
                                                }
                                            }
                                            disabled={
                                                info?.length !== 0 ||
                                                action === 'Approve' ||
                                                action === 'Accept' ||
                                                action === 'Update Sourcing Associate and Branch Admin and Branch Admin' ||
                                                action === 'Initiate' ||
                                                action === 'Assign Project Manager' ||
                                                action === 'Update Branch Code' ||
                                                data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.stateName?.toString() || ''}
                                            disableClearable={true}
                                            options={stateList || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.stateName,
                                            })}
                                            value={state || ''}
                                            defaultValue={data?.state || ''}
                                            onChange={(e, value) => {
                                                setData({
                                                    ...data,
                                                    state: value,
                                                });
                                                setState(value);
                                                if (value === null) {
                                                    delete updateMandateDataError['state'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['state']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={
                                                        (info?.length !== 0 ||
                                                            action === 'Approve' ||
                                                            action === 'Accept' ||
                                                            action === 'Update Sourcing Associate and Branch Admin and Branch Admin' ||
                                                            action === 'Initiate' ||
                                                            action === 'Assign Project Manager' ||
                                                            action === 'Update Branch Code' ||
                                                            data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                            backgroundColor: '#f3f3f3',
                                                            borderRadius: '10px',
                                                        }
                                                    }
                                                    size="small"
                                                />
                                            )}
                                        />
                                        {updateMandateDataError?.state && updateMandateDataError?.state ? <p className="form-error">{updateMandateDataError?.state}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Initiate' ? <h2 className="phaseLable required">Region</h2> : <h2 className="phaseLable">Region</h2>}

                                        <TextField
                                            name="region"
                                            id="region"
                                            variant="outlined"
                                            size="small"
                                            className="w-85"
                                            value={data?.region}
                                            disabled={
                                                info?.length !== 0 ||
                                                action === 'Approve' ||
                                                action === 'Accept' ||
                                                action === 'Update Sourcing Associate and Branch Admin' ||
                                                action === 'Assign Project Manager' ||
                                                action === 'Update Branch Code' ||
                                                data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            onChange={handleChange}
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
                                                if (/[0-9]/.test(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                        {updateMandateDataError?.region && updateMandateDataError?.region ? <p className="form-error">{updateMandateDataError?.region}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Initiate' ? <h2 className="phaseLable required">District</h2> : <h2 className="phaseLable">District</h2>}

                                        {/* <TextField
                      name="district"
                      id="district"
                      variant="outlined"
                      size="small"
                      className="w-85"
                      value={data?.district}
                      disabled={
                        info?.length !== 0 ||
                        action === "Approve" ||
                        action === "Accept" ||
                        action === "Assign Project Manager" ||
                        action ===
                        "Update Sourcing Associate and Branch Admin" ||
                        action === "Update Branch Code"
                      }
                      onChange={handleChange}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyDown={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }                        
                        regExpressionTextField(e);
                        if (/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    /> */}
                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                (action === 'Approve' ||
                                                    action === 'Accept' ||
                                                    action === 'Update Sourcing Associate and Branch Admin and Branch Admin' ||
                                                    action === 'Initiate' ||
                                                    action === 'Assign Project Manager' ||
                                                    action === 'Update Branch Code' ||
                                                    data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '10px',
                                                }
                                            }
                                            disabled={
                                                info?.length !== 0 ||
                                                action === 'Approve' ||
                                                action === 'Accept' ||
                                                action === 'Update Sourcing Associate and Branch Admin and Branch Admin' ||
                                                action === 'Initiate' ||
                                                action === 'Assign Project Manager' ||
                                                action === 'Update Branch Code' ||
                                                data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.districtName?.toString() || ''}
                                            disableClearable={true}
                                            options={districtList || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.districtName,
                                            })}
                                            value={district || ''}
                                            defaultValue={data?.district || ''}
                                            onChange={(e, value) => {
                                                setData({
                                                    ...data,
                                                    district: value,
                                                });
                                                setDistrict(value);
                                                if (value === null) {
                                                    delete updateMandateDataError['district'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['district']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={
                                                        (info?.length !== 0 ||
                                                            action === 'Approve' ||
                                                            action === 'Accept' ||
                                                            action === 'Update Sourcing Associate and Branch Admin and Branch Admin' ||
                                                            action === 'Initiate' ||
                                                            action === 'Assign Project Manager' ||
                                                            action === 'Update Branch Code' ||
                                                            data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                            backgroundColor: '#f3f3f3',
                                                            borderRadius: '10px',
                                                        }
                                                    }
                                                    size="small"
                                                />
                                            )}
                                        />
                                        {updateMandateDataError?.district && updateMandateDataError?.district ? <p className="form-error">{updateMandateDataError?.district}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Initiate' ? <h2 className="phaseLable required">City</h2> : <h2 className="phaseLable">City</h2>}

                                        {/* <TextField
                      name="city"
                      id="city"
                      variant="outlined"
                      size="small"
                      className="w-85"
                      value={data?.city}
                      disabled={
                        info?.length !== 0 ||
                        action === "Assign Project Manager" ||
                        action === "Approve" ||
                        action === "Accept" ||
                        action ===
                        "Update Sourcing Associate and Branch Admin" ||
                        action === "Update Branch Code"
                      }
                      onChange={handleChange}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyDown={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }                        
                        regExpressionTextField(e);
                        if (/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    /> */}
                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                (action === 'Approve' ||
                                                    action === 'Accept' ||
                                                    action === 'Update Sourcing Associate and Branch Admin and Branch Admin' ||
                                                    action === 'Initiate' ||
                                                    action === 'Assign Project Manager' ||
                                                    action === 'Update Branch Code' ||
                                                    data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '10px',
                                                }
                                            }
                                            disabled={
                                                info?.length !== 0 ||
                                                action === 'Approve' ||
                                                action === 'Accept' ||
                                                action === 'Update Sourcing Associate and Branch Admin and Branch Admin' ||
                                                action === 'Initiate' ||
                                                action === 'Assign Project Manager' ||
                                                action === 'Update Branch Code' ||
                                                data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.cityName?.toString() || ''}
                                            disableClearable={true}
                                            options={cityList || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.cityName,
                                            })}
                                            value={city || ''}
                                            defaultValue={data?.city || ''}
                                            onChange={(e, value) => {
                                                setData({
                                                    ...data,
                                                    city: value,
                                                });
                                                setCity(value);
                                                if (value === null) {
                                                    delete updateMandateDataError['city'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['city']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={
                                                        (info?.length !== 0 ||
                                                            action === 'Approve' ||
                                                            action === 'Accept' ||
                                                            action === 'Update Sourcing Associate and Branch Admin and Branch Admin' ||
                                                            action === 'Initiate' ||
                                                            action === 'Assign Project Manager' ||
                                                            action === 'Update Branch Code' ||
                                                            data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                            backgroundColor: '#f3f3f3',
                                                            borderRadius: '10px',
                                                        }
                                                    }
                                                    size="small"
                                                />
                                            )}
                                        />
                                        {updateMandateDataError?.city && updateMandateDataError?.city ? <p className="form-error">{updateMandateDataError?.city}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Initiate' ? <h2 className="phaseLable required">Location Name</h2> : <h2 className="phaseLable ">Location Name</h2>}
                                        <TextField
                                            autoComplete="off"
                                            name="location"
                                            id="location"
                                            variant="outlined"
                                            size="small"
                                            className="w-85"
                                            value={data?.location}
                                            disabled={
                                                data?.accept_Reject_Status === 'Mandate Sent Back'
                                                    ? false
                                                    : info?.length !== 0 ||
                                                      action === 'Approve' ||
                                                      action === 'Accept' ||
                                                      action === 'Update Sourcing Associate and Branch Admin' ||
                                                      action === 'Update Branch Code' ||
                                                      action === 'Assign Project Manager' ||
                                                      data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            onChange={handleChange}
                                            // error={action === "Initiate"}
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
                                        />
                                        {updateMandateDataError?.location && updateMandateDataError?.location ? <p className="form-error">{updateMandateDataError?.location}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Initiate' ? <h2 className="phaseLable required">Tier Name</h2> : <h2 className="phaseLable">Tier Name</h2>}
                                        {/* <TextField
                      autoComplete="off"
                      name="tierName"
                      id="tierName"
                      variant="outlined"
                      size="small"
                      className="w-85"
                      value={data?.tierName}
                      disabled={
                        data?.accept_Reject_Status === "Mandate Sent Back"
                          ? false
                          : info?.length !== 0 ||
                          action === "Approve" ||
                          action === "Accept" ||
                          action ===
                          "Update Sourcing Associate and Branch Admin" ||
                          action === "Update Branch Code" ||
                          action === "Assign Project Manager"
                      }
                      onChange={handleChange}
                      error={action === "Initiate"}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onKeyDown={(e: any) => {
                        if (
                          e.target.selectionStart === 0 &&
                          e.code === "Space"
                        ) {
                          e.preventDefault();
                        }                        
                        regExpressionTextField(e);
                      }}
                    /> */}
                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                (data?.accept_Reject_Status === 'Mandate Sent Back'
                                                    ? false
                                                    : info?.length !== 0 ||
                                                      action === 'Approve' ||
                                                      action === 'Accept' ||
                                                      action === 'Update Sourcing Associate and Branch Admin' ||
                                                      action === 'Update Branch Code' ||
                                                      action === 'Assign Project Manager' ||
                                                      data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '10px',
                                                }
                                            }
                                            disabled={
                                                data?.accept_Reject_Status === 'Mandate Sent Back'
                                                    ? false
                                                    : info?.length !== 0 ||
                                                      action === 'Approve' ||
                                                      action === 'Accept' ||
                                                      action === 'Update Sourcing Associate and Branch Admin' ||
                                                      action === 'Update Branch Code' ||
                                                      action === 'Assign Project Manager' ||
                                                      data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.tierName?.toString() || ''}
                                            disableClearable={true}
                                            options={tierList || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.tierName,
                                            })}
                                            value={tierName || ''}
                                            defaultValue={data?.tierName || ''}
                                            onChange={(e, value) => {
                                                setData({
                                                    ...data,
                                                    tierName: value,
                                                });
                                                setTierName(value);
                                                if (value === null) {
                                                    delete updateMandateDataError['tierName'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['tierName']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={
                                                        (data?.accept_Reject_Status === 'Mandate Sent Back'
                                                            ? false
                                                            : info?.length !== 0 ||
                                                              action === 'Approve' ||
                                                              action === 'Accept' ||
                                                              action === 'Update Sourcing Associate and Branch Admin' ||
                                                              action === 'Update Branch Code' ||
                                                              action === 'Assign Project Manager' ||
                                                              data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                            backgroundColor: '#f3f3f3',
                                                            borderRadius: '10px',
                                                        }
                                                    }
                                                    size="small"
                                                />
                                            )}
                                        />
                                        {updateMandateDataError?.tierName && updateMandateDataError?.tierName ? <p className="form-error">{updateMandateDataError?.tierName}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Business Type</h2>

                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                (data?.accept_Reject_Status === 'Mandate Sent Back'
                                                    ? false
                                                    : info?.length !== 0 ||
                                                      action === 'Approve' ||
                                                      action === 'Accept' ||
                                                      action === 'Update Sourcing Associate and Branch Admin' ||
                                                      action === 'Update Branch Code' ||
                                                      action === 'Assign Project Manager' ||
                                                      data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '10px',
                                                }
                                            }
                                            disabled={
                                                data?.accept_Reject_Status === 'Mandate Sent Back'
                                                    ? false
                                                    : info?.length !== 0 ||
                                                      action === 'Approve' ||
                                                      action === 'Accept' ||
                                                      action === 'Update Sourcing Associate and Branch Admin' ||
                                                      action === 'Update Branch Code' ||
                                                      action === 'Assign Project Manager' ||
                                                      data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.business_type?.toString() || ''}
                                            disableClearable={true}
                                            options={businessTypeList || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.business_type,
                                            })}
                                            value={businessType || ''}
                                            defaultValue={data?.fk_business_type || ''}
                                            onChange={(e, value) => {
                                                setData({
                                                    ...data,
                                                    fk_business_type: value,
                                                });
                                                setBusinessType(value);
                                                setBusinessAssociate(null);
                                                if (value === null) {
                                                    delete updateMandateDataError['fk_business_type'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['fk_business_type']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={
                                                        (data?.accept_Reject_Status === 'Mandate Sent Back'
                                                            ? false
                                                            : info?.length !== 0 ||
                                                              action === 'Approve' ||
                                                              action === 'Accept' ||
                                                              action === 'Update Sourcing Associate and Branch Admin' ||
                                                              action === 'Update Branch Code' ||
                                                              action === 'Assign Project Manager' ||
                                                              data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                            backgroundColor: '#f3f3f3',
                                                            borderRadius: '10px',
                                                        }
                                                    }
                                                    size="small"
                                                />
                                            )}
                                        />
                                        {/* {updateMandateDataError?.tierName &&
                      updateMandateDataError?.tierName ? (
                      <p className="form-error">
                        {updateMandateDataError?.tierName}
                      </p>
                    ) : null} */}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable required">Business Associate</h2>

                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                (data?.accept_Reject_Status === 'Mandate Sent Back'
                                                    ? false
                                                    : info?.length !== 0 ||
                                                      action === 'Approve' ||
                                                      action === 'Accept' ||
                                                      action === 'Update Sourcing Associate and Branch Admin' ||
                                                      action === 'Update Branch Code' ||
                                                      action === 'Assign Project Manager' ||
                                                      data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '10px',
                                                }
                                            }
                                            disabled={
                                                data?.accept_Reject_Status === 'Mandate Sent Back'
                                                    ? false
                                                    : info?.length !== 0 ||
                                                      action === 'Approve' ||
                                                      action === 'Accept' ||
                                                      action === 'Update Sourcing Associate and Branch Admin' ||
                                                      action === 'Update Branch Code' ||
                                                      action === 'Assign Project Manager' ||
                                                      data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.userName?.toString() || ''}
                                            disableClearable={true}
                                            options={businessAssociateList || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.tierName,
                                            })}
                                            value={businessAssociate || ''}
                                            defaultValue={data?.fk_business_associate || ''}
                                            onChange={(e, value) => {
                                                setData({
                                                    ...data,
                                                    fk_business_associate: value,
                                                });
                                                setBusinessAssociate(value);
                                                if (value === null) {
                                                    delete updateMandateDataError['fk_business_associate'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['fk_business_associate']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={
                                                        (data?.accept_Reject_Status === 'Mandate Sent Back'
                                                            ? false
                                                            : info?.length !== 0 ||
                                                              action === 'Approve' ||
                                                              action === 'Accept' ||
                                                              action === 'Update Sourcing Associate and Branch Admin' ||
                                                              action === 'Update Branch Code' ||
                                                              action === 'Assign Project Manager' ||
                                                              data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                            backgroundColor: '#f3f3f3',
                                                            borderRadius: '10px',
                                                        }
                                                    }
                                                    size="small"
                                                />
                                            )}
                                        />
                                        {updateMandateDataError?.fk_business_associate && updateMandateDataError?.fk_business_associate ? <p className="form-error">{updateMandateDataError?.fk_business_associate}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable">Admin Vertical</h2>

                                        <Autocomplete
                                            disablePortal
                                            disabled
                                            id="combo-box-demo"
                                            // getOptionLabel={(option) =>
                                            //   option?.tierName?.toString() || ""
                                            // }
                                            disableClearable={true}
                                            options={[]}
                                            // filterOptions={createFilterOptions({
                                            //   stringify: (option) => option?.tierName,
                                            // // })}
                                            value={adminVertical}
                                            defaultValue={adminVertical}
                                            onChange={(e, value) => {}}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={{
                                                        backgroundColor: '#f3f3f3',
                                                        borderRadius: '10px',
                                                    }}
                                                    size="small"
                                                />
                                            )}
                                        />
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable">Vertical Head</h2>

                                        <Autocomplete
                                            disablePortal
                                            sx={{
                                                backgroundColor: '#f3f3f3',
                                                borderRadius: '10px',
                                            }}
                                            disabled
                                            id="combo-box-demo"
                                            // getOptionLabel={(option) =>
                                            //   option?.tierName?.toString() || ""
                                            // }
                                            disableClearable={true}
                                            options={[]}
                                            // filterOptions={createFilterOptions({
                                            //   stringify: (option) => option?.tierName,
                                            // })}
                                            value={verticalHead || []}
                                            defaultValue={verticalHead || []}
                                            onChange={(e, value) => {}}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={{
                                                        backgroundColor: '#f3f3f3',
                                                        borderRadius: '10px',
                                                    }}
                                                    size="small"
                                                />
                                            )}
                                        />
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable">Project Delivery Manager</h2>

                                        <Autocomplete
                                            disablePortal
                                            sx={{
                                                backgroundColor: '#f3f3f3',
                                                borderRadius: '10px',
                                            }}
                                            disabled
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.userName?.toString() || ''}
                                            disableClearable={true}
                                            options={projectDeliveryManagerList || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.userName,
                                            })}
                                            value={projectDeliveryManager}
                                            defaultValue={data?.fk_project_delivery_manager || ''}
                                            onChange={(e, value) => {
                                                setData({
                                                    ...data,
                                                    fk_project_delivery_manager: value,
                                                });
                                                setProjectDeliveryManager(value);
                                                if (value === null) {
                                                    delete updateMandateDataError['fk_project_delivery_manager'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['fk_project_delivery_manager']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    sx={
                                                        (data?.accept_Reject_Status === 'Mandate Sent Back'
                                                            ? false
                                                            : info?.length !== 0 || action === 'Approve' || action === 'Accept' || action === 'Update Sourcing Associate and Branch Admin' || action === 'Update Branch Code' || action === 'Assign Project Manager') && {
                                                            backgroundColor: '#f3f3f3',
                                                            borderRadius: '10px',
                                                        }
                                                    }
                                                    size="small"
                                                />
                                            )}
                                        />
                                        {/* {updateMandateDataError?.tierName &&
                      updateMandateDataError?.tierName ? (
                      <p className="form-error">
                        {updateMandateDataError?.tierName}
                      </p>
                    ) : null} */}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Initiate' ? <h2 className="phaseLable required">Remark</h2> : <h2 className="phaseLable">Remark</h2>}
                                        <TextField
                                            autoComplete="off"
                                            name="remark"
                                            id="remark"
                                            variant="outlined"
                                            size="small"
                                            className="w-85"
                                            value={data?.remark}
                                            disabled={
                                                data?.accept_Reject_Status === 'Mandate Sent Back'
                                                    ? false
                                                    : info?.length !== 0 ||
                                                      action === 'Approve' ||
                                                      action === 'Accept' ||
                                                      action === 'Update Sourcing Associate and Branch Admin' ||
                                                      action === 'Update Branch Code' ||
                                                      action === 'Assign Project Manager' ||
                                                      data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            onChange={handleChange}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            // error={action === "Initiate"}
                                            onKeyDown={(e: any) => {
                                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                    e.preventDefault();
                                                }
                                                regExpressionRemark(e);
                                            }}
                                        />
                                        {updateMandateDataError?.remark && updateMandateDataError?.remark ? <p className="form-error">{updateMandateDataError?.remark}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Assign Project Manager' ? (
                                            <h2 className="phaseLable" style={{ color: 'red' }}>
                                                Project Manager
                                            </h2>
                                        ) : (
                                            <h2 className="phaseLable ">Project Manager</h2>
                                        )}
                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                (action === 'Approve' ||
                                                    action === 'Accept' ||
                                                    action === 'Update Sourcing Associate and Branch Admin' ||
                                                    action === 'Initiate' ||
                                                    action !== 'Assign Project Manager' ||
                                                    action === 'Update Branch Code' ||
                                                    data?.accept_Reject_Status === 'Phase Approval Note Created') && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '6px',
                                                }
                                            }
                                            disabled={
                                                action === 'Approve' ||
                                                action === 'Accept' ||
                                                action === 'Update Sourcing Associate and Branch Admin' ||
                                                action === 'Initiate' ||
                                                action !== 'Assign Project Manager' ||
                                                action === 'Update Branch Code' ||
                                                data?.accept_Reject_Status === 'Phase Approval Note Created'
                                            }
                                            id="combo-box-demo"
                                            getOptionLabel={(option) => option?.userName?.toString() || ''}
                                            disableClearable={true}
                                            options={projectManager || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.userName,
                                            })}
                                            value={data?.projectManagerId || ''}
                                            defaultValue={data?.projectManagerId || ''}
                                            onChange={(e, value) => {
                                                setData({ ...data, projectManagerId: value });
                                                if (value === null) {
                                                    delete updateMandateDataError['projectManagerId'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['projectManagerId']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="phaseId"
                                                    id="state"
                                                    error={action === 'Assign Project Manager'}
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
                                        {updateMandateDataError?.projectManagerId && updateMandateDataError?.projectManagerId ? <p className="form-error">{updateMandateDataError?.projectManagerId}</p> : null}
                                    </div>
                                </Grid>

                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        <h2 className="phaseLable">Project Manager Remarks</h2>
                                        <TextField
                                            name="projectManagerRemarks"
                                            id="projectManagerRemarks"
                                            variant="outlined"
                                            size="small"
                                            disabled
                                            className="w-85"
                                            value={data?.projectManagerRemarks}
                                            onChange={handleChange}
                                            onKeyDown={(e: any) => {
                                                regExpressionRemark(e);
                                            }}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                        />
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Update Branch Code' ? (
                                            <h2 className="phaseLable" style={{ color: 'red' }}>
                                                Branch Code
                                            </h2>
                                        ) : (
                                            <h2 className="phaseLable">Branch Code</h2>
                                        )}
                                        <TextField
                                            name="branchCode"
                                            id="branchCode"
                                            disabled={action !== 'Update Branch Code'}
                                            variant="outlined"
                                            size="small"
                                            className="w-85"
                                            value={data?.branchCode}
                                            onChange={handleChange}
                                            error={action === 'Update Branch Code'}
                                            InputProps={{ inputProps: { maxLength: 50 } }}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            onKeyDown={(e: any) => {
                                                regExpressionTextField(e);
                                                if (e.which === 32 && !e.target.value.length) e.preventDefault();
                                            }}
                                        />
                                        {updateMandateDataError?.branchCode && updateMandateDataError?.branchCode ? <p className="form-error">{updateMandateDataError?.branchCode}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Update Sourcing Associate and Branch Admin' ? (
                                            <h2 className="phaseLable" style={{ color: 'red' }}>
                                                Sourcing Associate
                                            </h2>
                                        ) : (
                                            <h2 className="phaseLable">Sourcing Associate</h2>
                                        )}
                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                action !== 'Update Sourcing Associate and Branch Admin' && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '6px',
                                                }
                                            }
                                            id="combo-box-demo"
                                            disabled={action !== 'Update Sourcing Associate and Branch Admin'}
                                            getOptionLabel={(option) => option?.userName?.toString() || ''}
                                            disableClearable={true}
                                            options={sourcingAssociateData || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.userName,
                                            })}
                                            value={data?.sourcingAssociate || ''}
                                            defaultValue={data?.sourcingAssociate || ''}
                                            onChange={(e: any, value) => {
                                                setData({ ...data, sourcingAssociate: value });
                                                if (value === null) {
                                                    delete updateMandateDataError['sourcingAssociate'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['sourcingAssociate']: '',
                                                    });
                                                }
                                            }}
                                            onPaste={(e: any) => {
                                                if (!textFieldValidationOnPaste(e)) {
                                                    dispatch(fetchError('You can not paste Spacial characters'));
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="sourcingAssociate"
                                                    id="sourcingAssociate"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    size="small"
                                                    error={action === 'Update Sourcing Associate and Branch Admin'}
                                                />
                                            )}
                                        />
                                        {updateMandateDataError?.sourcingAssociate && updateMandateDataError?.sourcingAssociate ? <p className="form-error">{updateMandateDataError?.sourcingAssociate}</p> : null}
                                    </div>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                                    <div className="input-form">
                                        {action === 'Update Sourcing Associate and Branch Admin' ? (
                                            <h2 className="phaseLable" style={{ color: 'red' }}>
                                                Branch Admin
                                            </h2>
                                        ) : (
                                            <h2 className="phaseLable">Branch Admin</h2>
                                        )}
                                        <Autocomplete
                                            disablePortal
                                            sx={
                                                action !== 'Update Sourcing Associate and Branch Admin' && {
                                                    backgroundColor: '#f3f3f3',
                                                    borderRadius: '6px',
                                                }
                                            }
                                            id="combo-box-demo"
                                            disabled={action !== 'Update Sourcing Associate and Branch Admin'}
                                            getOptionLabel={(option) => option?.userName?.toString() || ''}
                                            disableClearable={true}
                                            options={branchAdminList || []}
                                            filterOptions={createFilterOptions({
                                                stringify: (option) => option?.userName,
                                            })}
                                            value={data?.branchAdmin || ''}
                                            defaultValue={data?.branchAdmin || ''}
                                            onChange={(e: any, value) => {
                                                setData({
                                                    ...data,
                                                    branchAdmin: value,
                                                    branchAdminId: value?.id,
                                                });
                                                if (value === null) {
                                                    delete updateMandateDataError['branchAdmin'];
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                    });
                                                } else {
                                                    setUpdateMandateDataError({
                                                        ...updateMandateDataError,
                                                        ['branchAdmin']: '',
                                                    });
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    name="branchAdmin"
                                                    id="branchAdmin"
                                                    {...params}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        style: { height: `35 !important` },
                                                    }}
                                                    variant="outlined"
                                                    size="small"
                                                    error={action === 'Update Sourcing Associate and Branch Admin'}
                                                />
                                            )}
                                        />
                                        {updateMandateDataError?.branchAdmin && updateMandateDataError?.branchAdmin ? <p className="form-error">{updateMandateDataError?.branchAdmin}</p> : null}
                                    </div>
                                </Grid>
                                {mandateInfo && mandateInfo?.cancel_Remarks !== null && (
                                    <Grid item xs={6} md={4} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Cancel Remarks</h2>
                                            <TextField
                                                name="branchCode"
                                                id="branchCode"
                                                disabled={true}
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={mandateInfo?.cancel_Remarks}
                                                onChange={handleChange}
                                                InputProps={{ inputProps: { maxLength: 50 } }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                        regExpressionRemark(e);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Grid>
                                )}
                                {mandateInfo && mandateInfo?.hold_Remarks !== null && (
                                    <Grid item xs={6} md={4} sx={{ position: 'relative' }}>
                                        <div className="input-form">
                                            <h2 className="phaseLable">Hold Remarks</h2>
                                            <TextField
                                                name="branchCode"
                                                id="branchCode"
                                                disabled={true}
                                                variant="outlined"
                                                size="small"
                                                className="w-85"
                                                value={mandateInfo?.hold_Remarks}
                                                onChange={handleChange}
                                                InputProps={{ inputProps: { maxLength: 50 } }}
                                                onPaste={(e: any) => {
                                                    if (!textFieldValidationOnPaste(e)) {
                                                        dispatch(fetchError('You can not paste Spacial characters'));
                                                    }
                                                }}
                                                onKeyDown={(e: any) => {
                                                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                                                        e.preventDefault();
                                                        regExpressionRemark(e);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Grid>
                                )}
                            </Grid>
                        </div>
                        {docUploadHistory && docUploadHistory?.length > 0 && (mandateInfo?.hold_Remarks !== '' || mandateInfo?.cancel_Remarks !== '') && (
                            <div style={{ height: getHeightForTable(), marginBottom: '20px' }}>
                                <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={docUploadHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={10} />
                            </div>
                        )}
                        {action === 'Hold' && (
                            <>
                                <Grid marginTop="0px" container item spacing={5} display="flex" justifyContent="space-between" alignSelf="center">
                                    <Grid item xs={6} md={6}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignContent: 'center',
                                            }}
                                        >
                                            <div className="input-form">
                                                <h2 className="phaseLable required">Hold Mandate Remark</h2>
                                                <TextField
                                                    name="holdRemark"
                                                    id="holdRemark"
                                                    variant="outlined"
                                                    size="small"
                                                    className="w-85"
                                                    type="text"
                                                    value={holdRemark}
                                                    onChange={(e) => {
                                                        setHoldRemark(e?.target?.value);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={6} style={{ paddingTop: '35px' }}>
                                        <div style={{ marginRight: '40px', marginTop: 20 }}>
                                            <Button
                                                onClick={() => {
                                                    if (id === undefined) {
                                                        dispatch(fetchError('Please select Mandate !!!'));
                                                        return;
                                                    }
                                                    if (holdRemark === '') {
                                                        dispatch(fetchError('Please enter remark !!!'));
                                                        return;
                                                    }
                                                    fileInput.current.click();
                                                }}
                                                variant="outlined"
                                                size="medium"
                                                style={secondaryButton}
                                            >
                                                Upload
                                            </Button>
                                            <input
                                                ref={fileInput}
                                                multiple
                                                onChange={handleFileEvent}
                                                disabled={fileLimit}
                                                accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
text/plain, application/pdf, image/*"
                                                type="file"
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </Grid>
                                </Grid>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography>Version History</Typography>{' '}
                                </div>
                                <div style={{ height: getHeightForTable(), marginBottom: '20px' }}>
                                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={docUploadHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={10} />
                                </div>
                            </>
                        )}

                        {action === 'Cancel' && (
                            <>
                                <Grid marginTop="0px" container item spacing={5} display="flex" justifyContent="space-between" alignSelf="center">
                                    <Grid item xs={6} md={6}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignContent: 'center',
                                            }}
                                        >
                                            <div className="input-form">
                                                <h2 className="phaseLable required">Cancel Mandate Remark</h2>
                                                <TextField
                                                    name="cancelRemark"
                                                    id="cancelRemark"
                                                    variant="outlined"
                                                    size="small"
                                                    className="w-85"
                                                    type="text"
                                                    value={cancelRemark}
                                                    onChange={(e) => {
                                                        setCancelRemark(e?.target?.value);
                                                    }}
                                                    onKeyDown={(e: any) => {
                                                        regExpressionRemark(e);
                                                    }}
                                                    onPaste={(e: any) => {
                                                        if (!textFieldValidationOnPaste(e)) {
                                                            dispatch(fetchError('You can not paste Spacial characters'));
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} md={6} style={{ paddingTop: '35px' }}>
                                        <div style={{ marginRight: '40px', marginTop: 20 }}>
                                            <Button
                                                onClick={() => {
                                                    if (id === undefined) {
                                                        dispatch(fetchError('Please select Mandate !!!'));
                                                        return;
                                                    }
                                                    if (holdRemark === '') {
                                                        dispatch(fetchError('Please enter remark !!!'));
                                                        return;
                                                    }
                                                    fileInput.current.click();
                                                }}
                                                variant="outlined"
                                                size="medium"
                                                style={secondaryButton}
                                            >
                                                Upload
                                            </Button>
                                            <input
                                                ref={fileInput}
                                                multiple
                                                onChange={handleFileEvent}
                                                disabled={fileLimit}
                                                accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
text/plain, application/pdf, image/*"
                                                type="file"
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </Grid>
                                </Grid>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography>Version History</Typography>{' '}
                                </div>
                                <div style={{ height: getHeightForTable(), marginBottom: '20px' }}>
                                    <CommonGrid defaultColDef={{ flex: 1 }} columnDefs={columnDefs} rowData={docUploadHistory || []} onGridReady={onGridReady} gridRef={gridRef} pagination={false} paginationPageSize={10} />
                                </div>
                            </>
                        )}

                        {mandateId && mandateId?.id !== undefined && <DataTable mandateId={mandateId?.id} pathName={module} setInfo={setInfo} />}
                        <div className="bottom-fix-history">{mandateId && mandateId?.id !== undefined && mandateId?.id !== 'noid' && <MandateStatusHistory mandateCode={mandateId?.id} accept_Reject_Status={currentStatus} accept_Reject_Remark={currentRemark} />}</div>

                        {userAction?.module === module && (
                            <>
                                {action && action === 'Approve' && (
                                    <>
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
                                                        workflowFunctionAPICall(runtimeId, id, id, remark, 'Approved', navigate, user, params, dispatch);
                                                    }}
                                                    sentBackEvent={() => {
                                                        workflowFunctionAPICall(runtimeId, id, id, remark, 'Sent Back', navigate, user, params, dispatch);
                                                    }}
                                                />
                                                <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {action && action === 'Accept' && (
                                    <>
                                        <div className="bottom-fix-btn">
                                            <div className="remark-field">
                                                <AcceptRejectAction
                                                    approved={approved}
                                                    sendBack={sendBack}
                                                    setSendBack={setSendBack}
                                                    setApproved={setApproved}
                                                    remark={remark}
                                                    setRemark={setRemark}
                                                    approveEvent={() => {
                                                        workflowFunctionAPICall(runtimeId, id, id, remark, 'Approved', navigate, user, params, dispatch);
                                                    }}
                                                    sentBackEvent={() => {
                                                        workflowFunctionAPICall(runtimeId, id, id, remark, 'Sent Back', navigate, user, params, dispatch);
                                                    }}
                                                />
                                                <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {action && (action === 'Created' || action === 'Create') && (
                                    <div className="bottom-fix-btn">
                                        <div className="remark-field">
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                type="submit"
                                                style={{
                                                    marginLeft: 10,
                                                    padding: '2px 20px',
                                                    borderRadius: 6,
                                                    color: '#fff',
                                                    borderColor: '#00316a',
                                                    backgroundColor: '#00316a',
                                                }}
                                            >
                                                SUBMIT
                                            </Button>
                                            <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                        </div>
                                    </div>
                                )}
                                {action === 'Cancel' && (
                                    <div className="bottom-fix-btn">
                                        <div className="remark-field">
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                onClick={(e) => submitCancelMandateAction(e)}
                                                style={{
                                                    marginLeft: 10,
                                                    padding: '2px 20px',
                                                    borderRadius: 6,
                                                    color: '#fff',
                                                    borderColor: '#00316a',
                                                    backgroundColor: '#00316a',
                                                }}
                                            >
                                                Cancel Mandate
                                            </Button>
                                            <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                        </div>
                                    </div>
                                )}

                                {action === 'Hold' && (
                                    <div className="bottom-fix-btn">
                                        <div className="remark-field">
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                onClick={(e) => submitHoldMandateAction(e)}
                                                style={{
                                                    marginLeft: 10,
                                                    padding: '2px 20px',
                                                    borderRadius: 6,
                                                    color: '#fff',
                                                    borderColor: '#00316a',
                                                    backgroundColor: '#00316a',
                                                }}
                                            >
                                                Hold Mandate
                                            </Button>
                                            <span className="message-right-bottom">{userAction?.stdmsg || ''}</span>
                                        </div>
                                    </div>
                                )}
                                {action && action === 'Initiate' && (
                                    <div className="bottom-fix-btn">
                                        <div className="remark-field" style={{ marginRight: '0px' }}>
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                type="submit"
                                                style={{
                                                    marginLeft: 10,
                                                    padding: '2px 20px',
                                                    borderRadius: 6,
                                                    color: '#fff',
                                                    borderColor: '#00316a',
                                                    backgroundColor: '#00316a',
                                                }}
                                            >
                                                Initiate
                                            </Button>
                                            <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                        </div>
                                    </div>
                                )}
                                {action && action === 'Update Branch Code' && (
                                    <div className="bottom-fix-btn">
                                        <div className="remark-field" style={{ marginRight: '0px' }}>
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                type="submit"
                                                style={{
                                                    marginLeft: 10,
                                                    padding: '2px 20px',
                                                    borderRadius: 6,
                                                    color: '#fff',
                                                    borderColor: '#00316a',
                                                    backgroundColor: '#00316a',
                                                }}
                                            >
                                                Update Branch Code
                                            </Button>
                                            <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                        </div>
                                    </div>
                                )}
                                {action && action === 'Assign Project Manager' && (
                                    <div className="bottom-fix-btn">
                                        <div className="remark-field">
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                type="submit"
                                                style={{
                                                    marginLeft: 10,
                                                    padding: '2px 20px',
                                                    borderRadius: 6,
                                                    color: '#fff',
                                                    borderColor: '#00316a',
                                                    backgroundColor: '#00316a',
                                                }}
                                            >
                                                Assign Project Manager
                                            </Button>
                                            <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                        </div>
                                    </div>
                                )}
                                {action && action === 'Update Sourcing Associate and Branch Admin' && (
                                    <div className="bottom-fix-btn">
                                        <div className="remark-field">
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                type="submit"
                                                style={{
                                                    marginLeft: 10,
                                                    padding: '2px 20px',
                                                    borderRadius: 6,
                                                    color: '#fff',
                                                    borderColor: '#00316a',
                                                    backgroundColor: '#00316a',
                                                }}
                                            >
                                                Assign Sourcing Associate and Branch Admin
                                            </Button>
                                            <span className="message-right-bottom">{userAction?.stdmsg}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                </form>
            </div>
        </div>
    );
};

export default UpdateMandate;
