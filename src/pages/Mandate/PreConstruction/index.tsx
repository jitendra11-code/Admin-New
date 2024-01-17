import {
    Box,
    TextField,
    Tab,
} from "@mui/material";
import axios from "axios";
import MandateInfo from "pages/common-components/MandateInformation";
import React, { useEffect, useState } from "react";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "redux/store";
import { useParams } from "react-router-dom";
import { useUrlSearchParams } from "use-url-search-params";
import workflowFunctionAPICall from "pages/Mandate/workFlowActionFunction";
import dayjs, { Dayjs } from 'dayjs';
import { fetchError, showMessage } from "redux/actions";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AgGridReact } from "ag-grid-react";
import TextEditor from "./Components/Editor/TextFieldEditor"
import AmountEditor from "./Components/Editor/AmountEditor";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { Link } from "react-router-dom";
import TabPanel from "@mui/lab/TabPanel";
import RtgsDetails from "./Components/RtgsDetails";
import UtrDetailsGrid from "./Components/UtrDetailsGrid";


const PreConstruction = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const today = new Date();
    const [mandateCode, setMandateCode] = React.useState(null);
    const [remark, setRemark] = useState('')
    const [currentStatus, setCurrentStatus] = React.useState("")
    const [currentRemark, setCurrentRemark] = React.useState("");
    const location = useLocation();
    const apiType = location?.state?.apiType || ""
    const [mandateInfo, setMandateData] = React.useState(null);
    const [sendBack, setSendBack] = React.useState(false);
    const [approved, setApproved] = React.useState(false);
    const [userAction, setUserAction] = React.useState(null);
    const action = userAction?.action || "";
    const runtimeId = userAction?.runtimeId || 0;
    const { userActionList } = useSelector<AppState, AppState["userAction"]>(
        ({ userAction }) => userAction
    );
    let path = window.location.pathname?.split("/");
    let module: any = window.location.pathname?.split("/")[path.length - 1];
    const [params] = useUrlSearchParams({}, {});
    const { id } = useParams();
    const { user } = useAuthUser();
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [rtgsData, setRTGSData] = useState([])
    const [value, setValue] = React.useState("1");

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    React.useEffect(() => {
        if (id !== "noid" && id) {
            setMandateCode(id);
        }
    }, []);
    const components = {
        TextEditorCmp: TextEditor,
        AmountEditorCmp: AmountEditor,
    };
    let columnDefs = [
        {
            field: "srNo",
            headerName: "Sr. No",
            headerTooltip: "Serial Number",
            flex: 1,
            maxWidth: 80,
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },

        },
        {
            field: "landlord_full_name",
            headerName: "Land lord Name",
            headerTooltip: "Land lord Name",
            sortable: true,
            resizable: true,
            maxWidth: 200,
            cellStyle: { fontSize: "13px" },
        },
        {
            field: "paymentDate",
            headerName: "Date of Payment",
            headerTooltip: "Date of Payment",
            sortable: true,
            editable: true,
            resizable: true,
            maxWidth: 250,
            cellStyle: { fontSize: "13px", cursor: 'pointer' },
            cellRendererParams: {
                rtgsData: rtgsData,
                setRTGSData: setRTGSData
            },
            cellRenderer: (params: any) => (
                <>
                    {!params?.node?.rowPinned && (<div style={{ marginTop: 2 }} className="padd-right">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopDatePicker
                                inputFormat="DD/MM/YYYY"
                                maxDate={dayjs()}
                                value={params?.rtgsData[params?.rowIndex]?.paymentDate || null}
                                onChange={(value: Dayjs | null) => {
                                    var currentIndex = params?.rowIndex
                                    var data = [...params?.rtgsData];
                                    if (value !== null) {
                                        data[currentIndex].paymentDate = value?.toDate();
                                    }
                                    params?.setRTGSData(data)

                                }}
                                renderInput={(textparams) => <TextField
                                    error={params?.rtgsData[params?.rowIndex]?.paymentDate === null}
                                    {...textparams} sx={{
                                        '.MuiInputBase-input': { height: '0px !important', fontSize: '12px', paddingLeft: '8px' },
                                    }} />}
                            />
                        </LocalizationProvider>
                    </div>)}
                </>
            ),
        },
        {
            field: "amount",
            headerName: "Amount",
            headerTooltip: "Amount",
            editable: (params) => {
                if (params?.node?.rowPinned) {
                    return false
                }
                return true
            },
            cellClass: 'cell-padding editTextClass',

            cellClassRules: {
                'rag-red': params => {
                    if (params?.node?.rowPinned === undefined) {
                        if (params?.data?.amount === "") {
                            return true;
                        }
                        if (params?.data?.amount?.toString()?.length > 14) {
                            return true;
                        }
                        return false
                    }
                    return false
                }
            },
            sortable: true,
            resizable: true,
            maxWidth: 200,
            cellStyle: { fontSize: "13px", cursor: 'pointer' },
            cellEditor: 'AmountEditorCmp',
            cellEditorParams: {
                rtgsData: rtgsData,
                setRTGSData: setRTGSData,
                maxLength: 14,
                type: "number"
            },

        },
        {
            field: "utrNo",
            headerName: "UTR NO.",
            headerTooltip: "UTR NO.",
            sortable: true,
            editable: (params) => {
                if (params?.node?.rowPinned) {
                    return false
                }
                return true
            },
            cellClassRules: {
                'rag-red': params => {
                    if (params?.node?.rowPinned != "")
                        if (params?.data?.utrNo !== "") {

                            return false;
                        }
                    return true

                }
            },
            resizable: true,
            maxWidth: 220,
            cellStyle: { fontSize: "13px" },
            cellClass: "editTextClass",
            cellEditor: 'TextEditorCmp',
            cellEditorParams: {
                rtgsData: rtgsData,
                setRTGSData: setRTGSData,
                maxLength: 14,
                type: "text",
                name: "utr"
            },

        },
        {
            field: "remarks",
            headerName: "Remark",
            headerTooltip: "Remark",
            editable: (params) => {
                if (params?.node?.rowPinned) {
                    return false
                }
                return true
            },

            sortable: true,
            resizable: true,
            maxWidth: 220,
            cellClass: "editTextClass",
            cellStyle: { fontSize: "13px" },
            cellEditor: 'TextEditorCmp',
            cellEditorParams: {
                rtgsData: rtgsData,
                setRTGSData: setRTGSData,
                maxLength: 50,
                type: "text",
                name: "remark"

            },

        },
        {
            field: "seCurityDepositAmount",
            headerName: "Total SD Amount",
            headerTooltip: "Total SD Amount",
            sortable: true,
            resizable: true,
            maxWidth: 220,
            cellStyle: { fontSize: "13px" },

        }
    ];
    const calculatePinnedBottomData = (gridApi, target: any) => {
        let columnsWithAggregation = ['amount', 'seCurityDepositAmount']
        columnsWithAggregation.forEach(element => {
            gridApi.forEachNodeAfterFilter((rowNode) => {
                if (rowNode.data[element])
                    if (element === 'amount') {
                        target[element] += Number(rowNode.data[element]);
                    } else {
                        var rowIndex = rowNode?.rowIndex
                        if (rowIndex === 0)
                            target[element] = rowNode.data[element]
                    }

            });
            if (target[element])
                target[element] = `${target[element]}`;
        })
        return target;
    }
    const generatePinnedBottomData = (gridApi, gridColumnApi) => {
        let result = {};
        gridColumnApi.getAllGridColumns().forEach(item => {
            result[item.colId] = null;
        });
        return calculatePinnedBottomData(gridApi, result);
    }

    function onGridReady(params: { api: any; columnApi: any; }) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        var gridApi = params.api;
        var gridColumnApi = params.columnApi;
        gridRef.current!.api.sizeColumnsToFit();
        setTimeout(() => {
            let pinnedBottomData = generatePinnedBottomData(gridApi, gridColumnApi);
            gridApi.setPinnedBottomRowData([pinnedBottomData]);
        }, 500)
    }


    useEffect(() => {
        if (id && id !== 'noid') {
            setMandateCode(id);
        }
    }, [id]);

    const getRTGSDataByMandate = (id: any) => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/RTGSDetails/GetRTGSDetails?MandetId=${id}`)
            .then((response: any) => {
                if (response && response?.data && response?.data?.length > 0) {
                    setRTGSData(response?.data || [])
                    let arr = response?.data
                    let sumSalaryData = arr.reduce(function (tot: any, arr: { amount: any; }) {
                        return tot + arr.amount;
                    }, 0);
                    let arr2 = arr.map((obj: any) => ({ ...obj, totalAmount: sumSalaryData }))
                    setRTGSData(arr2 || [])
                  

                } else {
                    setRTGSData([])
                }
            })
            .catch((e: any) => { });
    }




    React.useEffect(() => {
        if (mandateCode && mandateCode?.id !== undefined && mandateCode?.id !== "noid") {
            getRTGSDataByMandate(mandateCode?.id)
        }
    }, [mandateCode]);

    React.useEffect(() => {
        if (mandateCode && mandateCode?.id !== undefined) {
            const userAction =
                userActionList &&
                userActionList?.find(
                    (item) =>
                        item?.mandateCode === parseInt(mandateCode?.id) &&
                        item?.module === module
                );
            if (apiType === "") {
                setUserAction(userAction);
            } else {
                let action = mandateCode;
                setUserAction(action);
            }
            if (params.source === "list") {
                navigate(`/mandate/${mandateCode?.id}/${module}?source=list`, { state: { apiType: apiType } })
            } else {
                navigate(`/mandate/${mandateCode?.id}/${module}`, { state: { apiType: apiType } })

            }
        }
    }, [mandateCode, setMandateCode]);

    const _getRuntimeId = (id) => {
        const userAction =
            userActionList &&
            userActionList?.find(
                (item) => item?.mandateCode === parseInt(id) && item?.module === module
            );
        return userAction?.runtimeId || 0;
    };

    const workFlowMandate = () => {
        const token = localStorage.getItem("token");
        const body = {
            runtimeId: _getRuntimeId(mandateCode.id) || 0,
            mandateCode: mandateCode?.id || 0, 
            tableId: mandateCode?.id || 0,
            remark: "Created",
            createdBy: user?.UserName,
            createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            action: "Created", 
        };
        axios({
            method: "post",
            url: `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId
                }&mandateCode=${body?.mandateCode}&tableId=${body?.mandateCode
                }&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action
                }&remark=${body?.remark || ""}`,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response: any) => {
                if (!response) return;
                if (response?.data === true) {
                    navigate("/list/task");
                }

            })
            .catch((e: any) => { });
    };

    const saveRTGSData = (e) => {
        var data = [...rtgsData];
        var _validationArr;
        var totalPaymentAmout = data.reduce(function (tot: any, arr: { amount: any; }) {
            return tot + parseInt(arr?.amount);
        }, 0);
        var totalSDAmount = data?.[0]?.seCurityDepositAmount;
        if (totalSDAmount === undefined || !Number.isInteger(totalSDAmount)) {
            dispatch(fetchError("Security deposit amount is invalid"))
            return
        }

        if (totalPaymentAmout > totalSDAmount) {
            dispatch(fetchError("Payment amount is greater than security deposit amount"))
            return
        }
        data = data && data?.length > 0 && data?.map((item => {
            return {
                id: item?.id || 0,
                uid: item?.uid || "",
                mandetId: mandateCode?.id || 0,
                vendor_name: item?.landlord_full_name || "",
                payment_date: item?.paymentDate && moment(item?.paymentDate).format("YYYY-MM-DDTHH:mm:ss.SSS") || null,
                amount: item?.amount && parseInt(item?.amount) || 0,
                utR_number: item?.utrNo || "",
                status: (item?.id === 0 ? "Created" : "Updated") || "",
                remarks: item?.remarks || "",
                createdBy: user?.UserName || "",
                createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
                modifiedBy: user?.UserName || "",
                modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            }
        }))
        _validationArr = data &&
            data?.filter((item) => item?.payment_date === null || item?.utR_number === "" || item?.amount === 0);
        if (data && data?.length === 0) {
            dispatch(fetchError("No records found"))
            return
        }
        if (_validationArr && _validationArr?.length > 0) {
            dispatch(fetchError("Please fill all mandatory fields !!!"));
            return;
        }
        axios
            .post(
                `${process.env.REACT_APP_BASEURL}/api/RTGSDetails/CreateRTGSDetails`,
                data
            )
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError("No records added"))
                }
                if (response?.data) {
                    dispatch(showMessage("Records is added successfully!"))
                    workflowFunctionAPICall(
                        runtimeId,
                        mandateCode?.id,
                        "Created",
                        "Created",
                        navigate,
                        user
                    );
                }
                else {
                    dispatch(fetchError("No records added"))
                }
            })
            .catch((e: any) => {
                dispatch(fetchError("Error Occurred !"));
            });
    }

    const getRowStyle = (params) => {
        return params?.node?.rowPinned ? { fontWeight: 'bold', fontStyle: 'normal', background: '#F5F5F5' } : { background: "white" }
    }
    return (
        <div>
            <Box
                component="h2"
                className="page-title-heading my-6"
            >
                Security Deposit RTGS/Cheque Details
            </Box>
            <div
                className="card-panal inside-scroll-228"
                style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
            >
                <MandateInfo
                    mandateCode={mandateCode}
                    source=""
                    pageType=""
                    setMandateCode={setMandateCode}
                    setMandateData={setMandateData}
                    redirectSource={`${params?.source}`}
                    setpincode={() => { }}
                    setCurrentStatus={setCurrentStatus}
                    setCurrentRemark={setCurrentRemark}
                />
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <TabList
                            onChange={handleChange}
                            aria-label="lab API tabs example"
                        >
                            <Tab
                                label="Landlord RTGS/Cheque Details"
                                value="1"
                                to={`/mandate/${id}/rtgs`}
                                component={Link}
                            />
                            <Tab
                                label="Vendor UTR Details"
                                value="2"
                                to={`/mandate/${id}/utr-details`}
                                component={Link}
                            />

                        </TabList>
                    </Box>

                    <TabPanel value="1">
                        <RtgsDetails
                            mandateId={mandateCode}
                            currentRemark={currentRemark}
                            currentStatus={currentStatus}
                        />
                    </TabPanel>
                    <TabPanel value="2">
                        <UtrDetailsGrid mandateId={mandateCode}
                            currentRemark={currentRemark}
                            currentStatus={currentStatus} />
                    </TabPanel>


                </TabContext>
              

            </div>
        </div >
    );
}

export default PreConstruction;
