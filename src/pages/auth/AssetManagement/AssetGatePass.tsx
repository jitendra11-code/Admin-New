import {
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, SwipeableDrawer, Tooltip
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useFormik } from "formik";
import dayjs, { Dayjs } from "dayjs";
import AssetInfo from "pages/common-components/AssetInformation";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch } from "react-redux";
import { reset } from "shared/constants/CustomColor";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import * as Yup from "yup";
import AssetCodeDrawer from "./AssetCodeDrawer";
import { textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";
import MandateStatusHistory from "pages/common-components/MandateInformation/MandateStatusRemarkHistoryComp";
import { useUrlSearchParams } from "use-url-search-params";

const AssetGatePass = () => {
  const date = new Date();
  const [dateError, setDateError] = useState<any>("");
  const [value, setValue] = React.useState(moment(date).format());
  const { id } = useParams();
  const { user } = useAuthUser();
  const [apiCalled, setApiCalled] = useState(false);
  const [assetCode, setAssetCode] = useState<any>("");
  const [getPassId, setGetPassId] = useState("");
  const [getForeignKey, setGetForeignKey] = useState("");
  const [getPassTypeDropdown, setGetPassTypeDropdown] = useState([]);
  const [getAssetTypeDropdown, setGetAssetTypeDropdown] = useState([]);
  const [getPurposeTypeDropdown, setGetPurposeTypeDropdown] = useState([]);
  const dispatch = useDispatch();
  const [params]: any = useUrlSearchParams({}, {});
  const navigate = useNavigate();
  const [assetDataById, setAssetDataById] = useState([]);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const gridRef = React.useRef<AgGridReact>(null);
  const [assetData, setAssetData] = React.useState<any>([]);
  const [fromBranchDetails, setFromBranchDetails] = useState([]);
  const [toBranchDetails, setToBranchDetails] = useState([]);
  const [assetDrawerData, setAssetDrawerData]= React.useState(null);
  const [openDrawerAssetCode, setOpenDrawerAssetCode] = useState(false);
  const [movementBy, setMovementBy]= React.useState(null);
  const [assetRequestNo, setassetRequestNo] = useState('');
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [editFlag, setEditFlag] = React.useState(false);
  useEffect(() => {
    if (id && id !== "noid") {
      setEditFlag(true);
    }
  }, [id]);
  useEffect(() => {
    if (id && id != "noid") {
      setAssetCode(getForeignKey);
    }
    // else{
    //   setAssetCode("0")
    // }
  }, [getForeignKey]);
 
  console.log("params",params)
  const getAssetById = (id) => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestById?id=${assetCode}`
      )
      .then((response: any) => {
        if (response && response?.data) {
          setAssetDataById(response?.data);
        }
      })
      .catch((e: any) => { });
  };

  const getGatePassType = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=GatePassType`
      )
      .then((response: any) => {
        const getPassType = response?.data;
        setGetPassTypeDropdown(getPassType);
        
      });
  };

  const getGatePassId = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/AssetGatePass/GetAssetGatePassRequestId`
      )
      .then((response: any) => {
        // const getPassId = response?.data;
        // setGetPassTypeDropdown(getPassType);
        setGetPassId(response?.data);
        
      });
  };

  const getGateAssetType = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Asset Type`
      )
      .then((response: any) => {
        const getAssetType = response?.data;
        setGetAssetTypeDropdown(getAssetType);
        
      });
  };

  const getGatePurposeType = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Purpose of Movement`
      )
      .then((response: any) => {
        const getPurposeType = response?.data;
        setGetPurposeTypeDropdown(getPurposeType);
        
      });
  };

  const getAssetRequestMovementDetailsData = async (assetCode) => {
    await axios 
    .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestMovementDetailsByAssetId?assetId=${assetCode}`)
    .then((response : any)=>{
      setAssetData(response?.data || []);
        
    })
    .catch((e:any) => {});
};

useEffect(() =>{
  if (assetCode && assetCode!="id") {
    getAssetRequestMovementDetailsData(assetCode);
  }

},[assetCode]);

  useEffect(() => {
    getGatePassType();
    getGateAssetType();
    getGatePurposeType();
    getGatePassId();
  }, []);

  useEffect(() => {
    if (assetCode) {
      getAssetById(assetCode);
    }
    
  }, [assetCode]);

  const handleBackClick = () => {
    navigate("/AssetGatePassList");
  };

  useEffect(() => {
    // if (id !== "noid" && id) {
    if (!apiCalled && id !== "noid" && id) {
      axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/AssetGatePass/GetAssetGatePassDetails?id=${id}`
        )
        .then((response: any) => {
          const responseData = response?.data.find((item) => item.id == id);
          
          setGetForeignKey(responseData?.fk_request_id);
          setFieldValue(
            "requestNo",
            responseData?.assetRequests?.[0]?.requestNo
          );
          if (responseData?.gate_pass_no.length > 0) {
            setFieldValue("gate_pass_no", responseData?.gate_pass_no);
          } else {
            setFieldValue("gate_pass_no", getPassId);
          }
          // setFieldValue("gate_pass_date", responseData?.gate_pass_date);
          setFieldValue("gate_pass_date", moment(new Date()).format());
          setFieldValue("gate_pass_type", responseData?.gate_pass_type);
          setFieldValue("asset_type", responseData?.asset_type);
          setFieldValue("retun_date", responseData?.retun_date);
          setFieldValue("purpose", responseData?.purpose);
          setFieldValue("carrier_name", responseData?.carrier_name);
          setFieldValue("carrier_movement_by",responseData?.carrier_movement_by);
          setFieldValue("courier_Person_ContactNumber", responseData?.courier_Person_ContactNumber || "");
          setFieldValue("courier_Person_Name", responseData?.courier_Person_Name);
          setFieldValue("courier_Person_PhoneNumber", responseData?.courier_Person_PhoneNumber);
          setFieldValue("individual_Vendor_Name", responseData?.individual_Vendor_Name);
          setMovementBy(responseData?.carrier_movement_by);
          // setFieldValue("fk_request_id", responseData?.fk_request_id);
        });
    } else {
      setFieldValue("gate_pass_no", getPassId);
      setFieldValue("gate_pass_date", moment(new Date()).format());
    }
  }, [id, apiCalled]);

  const handleGetPassDate = (newValue) => {
    if (newValue !== null && dayjs(newValue).isValid()) {
      setDateError("");
      setValue(moment(new Date(newValue)).format());
      setFieldValue("gate_pass_date", moment(new Date(newValue)).format());
    } else {
      setDateError("please enter valid date");
    }
  };
  
  // useEffect(() => {
  //   if (id && id !="id") {
  //     setAssetCode(id)
  //   }
    
  // }, [id]);

  const getFromBranchDetails = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterDetails?Id=${assetDataById[0]?.fk_from_branch_id}`
      )
      .then((response: any) => {
        
        setFromBranchDetails(response?.data || []);
        
      })
      .catch((e: any) => { });
  };
  
  useEffect (() => {
    if (assetDataById[0]?.fk_from_branch_id !== undefined || assetDataById[0]?.fk_from_branch_id || id ){
        getFromBranchDetails();
    }
  }, [assetDataById[0]?.fk_from_branch_id,id]);
  
  const getToBranchDetails = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/BranchMaster/GetBranchMasterDetails?Id=${assetDataById[0]?.fk_to_branch_id}`
      )
      .then((response: any) => {
        console.log('res',response)
        setToBranchDetails(response?.data || []);
        
      })
      .catch((e: any) => { });
  };
  
  useEffect (() => {
    if (assetDataById[0]?.fk_to_branch_id !== undefined || assetDataById[0]?.fk_to_branch_id || id  ){
      getToBranchDetails();
    }
  }, [assetDataById[0]?.fk_to_branch_id,id])

  const handleReturnDate = (newValue) => {
    if (newValue !== null && dayjs(newValue).isValid()) {
      setDateError("");
      setValue(moment(new Date(newValue)).format());
      setFieldValue("retun_date", moment(new Date(newValue)).format());
    } else {
      setDateError("please enter valid date");
    }
  };
 

  const validateSchema = Yup.object({
    gate_pass_no: Yup.string().required("Please enter Gate pass Number"),
    gate_pass_type: Yup.string().required("Please enter Gate pass Type"),
    gate_pass_date: Yup.string().required("Please enter Gate pass Date"),
    retun_date: Yup.string().required("Please enter Return Date"),
    asset_type: Yup.string().required("Please enter Asset Type"),
    purpose: Yup.string().required("Please enter Purpose of movement"),

  });
  function isValidContactNo(contactno) {
    let regExp = new RegExp('^[9,8,7,6][0-9]*$');
    let regExp2 = new RegExp('\\d{10}');
    return regExp.test(contactno);
  }
  const {
    values,
    handleBlur,
    handleChange,
    setFieldValue,
    handleSubmit,
    setFieldError,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: {
      gate_pass_no: "",
      gate_pass_type: "",
      retun_date: "",
      asset_type: "",
      gate_pass_date: "",
      requestNo: "",
      purpose: "",
      carrier_movement_by: "",
      carrier_name: "",
      courier_Person_ContactNumber : "",
      courier_Person_Name: "",
      courier_Person_PhoneNumber: "",
      individual_Vendor_Name: ""
      // fk_request_id: ""
    },
    // validationSchema: validateSchema, 
    validationSchema: Yup.object({
      // gate_pass_no: Yup.string().required("Please enter Gate pass Number"),
      gate_pass_type: Yup.string().required("Please enter Gate pass Type"),
      gate_pass_date: Yup.string().required("Please enter Gate pass Date"),
      // retun_date: Yup.string().when('gate_pass_type', {
      //   is: (gate_pass_type) => gate_pass_type === "Returnable",
      //   then: Yup.string()
      //     .required("Please enter Return Date")
      //     .test('is-greater', 'Return Date must be equal or after Gate Pass Date', function (value) {
      //       const gatePassDate = this.parent.gate_pass_date; // Accessing gate_pass_date from form values
      //       console.log("retun_date",value,gatePassDate);

      //       return new Date(value) >= new Date(gatePassDate);
      //     }),
      //   otherwise: Yup.string().notRequired(),
      // }),
     
      retun_date: Yup.string().when('gate_pass_type', {
        is: (gate_pass_type) => gate_pass_type === "Returnable",
        then: Yup.string()
          .required("Please enter Return Date")
          .test('is-greater-or-equal', 'Date Of Return should be greater than or equals to Gate Pass Date', function (value) {
            const gatePassDate = this.parent.gate_pass_date;
            const returnDate = new Date(value);
            const gatePassDateObj = new Date(gatePassDate);
            return returnDate.setHours(0, 0, 0, 0) >= gatePassDateObj.setHours(0, 0, 0, 0);
          }),
        otherwise: Yup.string().notRequired(),
      }),

      
      
      
      




      
      asset_type: Yup.string().required("Please enter Asset Type"),
      purpose: Yup.string().required("Please enter Purpose Of Movement"),
      carrier_movement_by: editFlag && Yup.string().required("Please enter Movement By"),
      courier_Person_Name: editFlag && Yup.string()
        .matches(/^[A-Za-z\s]+$/, 'Only characters are allowed')
        .nullable(true).required("Please enter Courier Person Name"),
    carrier_name: editFlag && Yup.string()
   .matches(/^[A-Za-z\s]+$/, 'Only characters are allowed')
   .nullable(true).required("Please enter Name"),

   individual_Vendor_Name: editFlag && Yup.string()
   .matches(/^[A-Za-z\s]+$/, 'Only characters are allowed')
   .nullable(true).required("Please enter Individual/ Vendor Name"),

   courier_Person_ContactNumber: editFlag && Yup.string()
   .test({
     name: 'isValidNumber',
     test: (value) => {
      if (value?.length >= 1 && value?.length < 10) {
        throw new Yup.ValidationError('Contact Number must be 10 digits long', null, 'courier_Person_ContactNumber');
      }
      if (value?.length>=1 && !/^[6-9]/.test(value)) {
        throw new Yup.ValidationError('Contact Number must start with 6, 7, 8, or 9', null, 'courier_Person_ContactNumber');
      }
       
       return true;
     },
   }).required("Please enter Courier/Person Contact Number"),

   courier_Person_PhoneNumber: editFlag && Yup.string()
   .test({
     name: 'isValidNumber',
     test: (value) => {
      if (value?.length >= 1 && value?.length < 10) {
        throw new Yup.ValidationError('Phone Number must be 10 digits long', null, 'courier_Person_PhoneNumber');
      }
      if (value?.length>=1 && !/^[6-9]/.test(value)) {
        throw new Yup.ValidationError('Phone Number must start with 6, 7, 8, or 9', null, 'courier_Person_PhoneNumber');
      }
       
       return true;
     },
   }).required("Please enter Courier/Person Phone Number"),
 
  

    // courier_Person_PhoneNumber: Yup.string()
    // //.required("Please enter Courier/Person PhoneNumber")
    // .matches(/^[6-9]\d{9}$/, 'Invalid phone Number')
    // .test({
    //   name: 'startsWithValidDigit',
    //   message: 'Contact Number must start with 9, 8, 7, or 6',
    //   test: (value) => {
    //     return /^[6-9]/.test(value);
    //   },
    // }),
    

    }),

    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: (values, action) => {
      
      const body = {
        id: id === "noid" ? 0 : parseInt(id),
        uid: "",
        asset_type: values?.asset_type,
        gate_pass_type: values?.gate_pass_type,
        gate_pass_no: id === "noid" ? getPassId.toString() : values?.gate_pass_no,
        purpose: values?.purpose,
        gate_pass_date: values?.gate_pass_date,
        retun_date: values?.retun_date,
        // fk_request_id:  id === "noid" ? getForeignKey : id,
        // fk_request_id: id === "noid" ? 0 : parseInt(id),
        fk_request_id: id === "noid" ? parseInt(assetCode) : getForeignKey,
        status: "Active",
        authorized_by: "",
        authorized_emp_id: "",
        authorized_remarks: "",
        authorized_on: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        authorization_status: "",
        validated_by: "",
        validated_emp_id: "",
        validated_remarks: "",
        validated_status: "",
        carrier_movement_by: movementBy || values?.carrier_movement_by || "",
        carrier_name: values?.carrier_name || "",
        courier_Person_ContactNumber : values?.courier_Person_ContactNumber || "",
        courier_Person_Name: values?.courier_Person_Name || "",
        courier_Person_PhoneNumber: values?.courier_Person_PhoneNumber || "",
        individual_Vendor_Name: values?.individual_Vendor_Name || "",
        inward_ackn_by: "",
        inward_ackn_emp_id: "",
        inward_ackn_remarks: "",
        createdBy: user?.UserName || "Admin",
        createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        modifiedBy: user?.userName || "Admin",
        modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        assetRequest: assetDataById && assetDataById.map((item)=> {
          return {
            id: item?.id || 0,
            uid: "",
            type: item?.assetRequestType,
            classDescription: item?.classDescription,
            description: item?.description,
            category: item?.category,
            requiredQuantity: item?.requiredQuantity,
            dateofCommissioning: item?.dateofCommissioning,
            remarks : item?.remarks,
            requiredFor: item?.requiredFor,
            isSkip: item?.isSkip,
            requestStatus: item?.requestStatus,
            requestRemarks: item?.requestRemarks,
            requestNo: item?.requestNo,
            requesterName: item?.requesterName,
            requesterEmployeeID: item?.requesterEmployeeID,
            shiftingType: item?.shiftingType,
            branchName: item?.branchName,
            branchCode: item?.branchCode,
            branchAddress: item?.branchAddress,
            pinCode: item?.pinCode,
            city: item?.city,
            state: item?.state,
            fk_from_branch_id: item?.fk_from_branch_id,
            fk_to_branch_id: item?.fk_to_branch_id,
            status: item?.status,
            createdBy: item?.createdBy,
            createdDate: item?.createdDate,
            modifiedBy: item?.modifiedBy,
            modifiedDate: item?.modifiedDate
          }
        })
      };
     
      if (id && id != "noid") {

      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/AssetGatePass/InsertUpdateAssetGatePass`,
          body
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Gate Pass details not updated"));
            // setOpen(false);
            return;
          }
          if (
            response &&
            response?.data?.code === 200 &&
            response?.data?.status === true
          ) {
            const updatedAssetDetaildView = assetData.map(obj => ({ ...obj, fk_gate_pass_id: response?.data?.data?.id,fk_mov_req_id: obj?.id ,id: 0 }));
              axios
              .post(
               `${process.env.REACT_APP_BASEURL}/api/AssetGatePass/InsertOrUpdateAssetGatePassAssetDetailsList`,
               updatedAssetDetaildView
             ).then ((response: any) => {
               
             }).catch((e) => {
               
             });
            dispatch(showMessage("Gate Pass Updated successfully"));
            navigate("/AssetGatePassList");
            // setOpen(false);
            // showRightData(body);
            return;
          } else {
            dispatch(fetchError("Gate Pass details already exists"));
            // setOpen(false);
            return;
          }
        })
        .catch((e: any) => {
          // setOpen(false);
          dispatch(fetchError("Error Occurred !"));
        });
      } else {
        
        axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/AssetGatePass/InsertUpdateAssetGatePass`,
          body
        )
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Gate Pass details not updated"));
            // setOpen(false);
            return;
          }
          if (
            response &&
            response?.data?.code === 200 &&
            response?.data?.status === true
          ) {
            const updatedAssetDetaildView = assetData.map(obj => ({ ...obj, fk_gate_pass_id: response?.data?.data?.id,fk_mov_req_id: obj?.id ,id: 0 }));
              axios
              .post(
               `${process.env.REACT_APP_BASEURL}/api/AssetGatePass/InsertOrUpdateAssetGatePassAssetDetailsList`,
               updatedAssetDetaildView
             ).then ((response: any) => {
               
             }).catch((e) => {
               
             });
            dispatch(showMessage("Gate Pass added successfully"));
            navigate("/AssetGatePassList");
            // setOpen(false);
            // showRightData(body);
            return;
          } else {
            dispatch(fetchError("Gate Pass details already exists"));
            // setOpen(false);
            return;
          }
        })
        .catch((e: any) => {
          // setOpen(false);
          dispatch(fetchError("Error Occurred !"));
        });

      }
    },
  });
  console.log("values",values);
  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
    setGridApi(params.api);
  }
    

 



  const onFilterTextChange = async (e) => {
    gridApi?.setQuickFilter(e.target.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"));
    }
  };

  let columnDefs  = [
   
    {
      field: "assetCode",
      headerName: "Asset Code",
      headerTooltip: "Asset Code",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
      cellRenderer: (params) => {
        
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        return  <a  href= "#" style={{ color: 'blue' }} onClick={() => {setAssetDrawerData(params?.data);setOpenDrawerAssetCode(!openDrawerAssetCode)}} >
          {params?.data?.assetCode}
          </a>
      }
    },
    {
      field: "assetType",
      headerName: "Asset Type",
      headerTooltip: "Asset Type",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "assetCategorisation",
      headerName: "Asset Categorisation",
      headerTooltip: "Asset Categorisation",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "assetClassDescription",
      headerName: "Asset Class Description",
      headerTooltip: "Asset Class Description",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "asset_description",
      headerName: "Asset Description",
      headerTooltip: "Asset Description",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "paV_Location",
      headerName: "PAV Location",
      headerTooltip: "PAV Location",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "book_val",
      headerName: "Book Value",
      headerTooltip: "Book Value",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "balance_Useful_life_as_per_Finance",
      headerName: "Balance Useful (Finance)",
      headerTooltip: "Balance Useful Life as per Finance",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 210,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "balance_Useful_life_as_per_Admin",
      headerName: "Balance Useful (Admin)",
      headerTooltip: "Balance Useful Life as per Admin",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 200,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "used_Unused",
      headerName: "Used / Unused",
      headerTooltip: "Used / Unused",
      sortable: true,
      resizable: true,
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
  
   
  ];
  const getHeightForTable = useCallback(() => {
    const dataLength = assetData ? assetData.length : 0;

    if (dataLength === 0) {
        return '30px';
    } else if (dataLength === 1) {
        return '85px';
    } else if (dataLength === 2) {
        return '127px';
    } else if (dataLength === 3) {
        return '169px';
    } else {
        return '169px';
    }
}, [assetData]);
  return (
    <>
      <div>
        <Box component="h2" className="page-title-heading my-6">
          Asset Gate Pass
        </Box>

        <div
          className="card-panal"
          style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
        >
          <AssetInfo
            setassetRequestNo={setassetRequestNo}
            assetCode={assetCode}
            source=""
            disabledStatus={true}
            pageType="propertyAdd"
            redirectSource={id !== 'noid' ? 'list' : ``}
            setAssetCode={setAssetCode}
            setMandateData={() => { }}
            setpincode={() => { }}
            setCurrentStatus={() => { }}
            setCurrentRemark={() => { }}
          />
         
          <div
            // className="card-panal inside-scroll-create-280"
            className={id === "noid" ? "card-panal inside-scroll-asset-225" : "card-panal inside-scroll-asset-226"}
            style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
          >
            <form onSubmit={handleSubmit}>
              <Typography
                className="section-headingTop"
                style={{ marginTop: "0px" }}
              >
                Gate Pass
              </Typography>
              <div className="phase-outer">
                <Grid
                  marginBottom="7px"
                  container
                  item
                  spacing={5}
                  justifyContent="start"
                  alignSelf="center"
                >
                  
                  <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                    <div className="input-form">
                      <h2 className="phaseLable">Gate Pass Number</h2>
                      <TextField
                        // disabled
                        name="gate_pass_no"
                        id="gate_pass_no"
                        variant="outlined"
                        size="small"
                        className="w-85"
                        onChange={(e: any) =>
                          e.target.value?.length > 14
                            ? e.preventDefault()
                            : handleChange(e)
                        }
                        value={id === "noid" ? getPassId : values?.gate_pass_no}
                      
                      />
                    </div>
                    {/* {touched.gate_pass_no && errors.gate_pass_no ? (
                      <p className="form-error">{errors.gate_pass_no}</p>
                    ) : null} */}
                  </Grid>





                 
                  <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                    <div>
                      <h2 className="phaseLable required">Gate Pass Date</h2>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DesktopDatePicker
                          className="w-85"
                          inputFormat="DD/MM/YYYY"
                          value={values.gate_pass_date || "" || null}
                          // minDate={values.inspection_date}
                          onChange={
                            // handleChangeClosureDate
                            handleGetPassDate
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              name="gate_pass_date"
                              size="small"
                              onKeyDown={(e: any) => e.preventDefault()}
                            />
                          )}
                        />
                      </LocalizationProvider>
                      {touched.gate_pass_date && errors.gate_pass_date ? (
                        <p className="form-error">{errors.gate_pass_date}</p>
                      ) : null}
                    </div>
                  </Grid>
                  <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                    <div className="input-form">
                      <h2 className="phaseLable required">Gate Pass Type</h2>
                      <Select
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        size="small"
                        className="w-85"
                        name="gate_pass_type"
                        id="gate_pass_type"
                        value={values.gate_pass_type || ""}
                        onChange={(e, v) => {
                          handleChange(e);
                          
                        }}
                        onBlur={handleBlur}
                      
                      >
                        <MenuItem value="" style={{ display: "none" }}>
                          <em>Select Gate Pass Type</em>
                        </MenuItem>
                        {getPassTypeDropdown?.map((v: any) => (
                          <MenuItem value={v?.formName}>{v?.formName}</MenuItem>
                        ))}
                      </Select>
                      {touched.gate_pass_type && errors.gate_pass_type ? (
                        <p className="form-error">{errors.gate_pass_type}</p>
                      ) : null}
                     
                    </div>
                  </Grid>
                  <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                    <div>
                      <h2 className="phaseLable required">Date Of Return</h2>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DesktopDatePicker
                          disabled={values?.gate_pass_type == "" || values?.gate_pass_type == "Non Returnable"}
                          className="w-85"
                          inputFormat="DD/MM/YYYY"
                          value={values.retun_date || "" || null}
                          // minDate={values.inspection_date}
                          onChange={
                            // handleChangeClosureDate
                            handleReturnDate
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              name="retun_date"
                              size="small"
                              onKeyDown={(e: any) => e.preventDefault()}
                            />
                          )}
                          minDate={values.gate_pass_date ? new Date(values.gate_pass_date) : null} 
                        />
                      </LocalizationProvider>
                      {touched.retun_date && errors.retun_date ? (
                        <p className="form-error">{errors.retun_date}</p>
                      ) : null}
                    </div>
                  </Grid>
                  <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                    <div className="input-form">
                      <h2 className="phaseLable required">Asset Type</h2>
                      <Select
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        size="small"
                        className="w-85"
                        name="asset_type"
                        id="asset_type"
                        value={values.asset_type || ""}
                        onChange={(e, v) => {
                          handleChange(e);
                          // setParentSelected(e)
                          
                        }}
                        onBlur={handleBlur}
                      
                      >
                        <MenuItem value="" style={{ display: "none" }}>
                          <em>Select Asset Type</em>
                        </MenuItem>
                        {getAssetTypeDropdown?.map((v: any) => (
                          <MenuItem value={v?.formName}>{v?.formName}</MenuItem>
                        ))}
                      </Select>
                      {touched.asset_type && errors.asset_type ? (
                        <p className="form-error">{errors.asset_type}</p>
                      ) : null}
                      {/* <TextField
                        // disabled
                        name="asset_type"
                        id="asset_type"
                        variant="outlined"
                        size="small"
                        className="w-85"
                        onChange={(e: any) =>
                          e.target.value?.length > 14
                            ? e.preventDefault()
                            : handleChange(e)
                        }
                        value={values?.asset_type}
                        // value={
                        //   id === "noid"
                        //     ? requestNumber.toUpperCase()
                        //     : values?.request_no.toUpperCase()
                        // }
                      /> */}
                    </div>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    md={3}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    sx={{ position: "relative" }}
                  >
                    <div className="input-form">
                      <h2 className="phaseLable required">
                        Purpose Of Movement
                      </h2>
                      <Select
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        size="small"
                        className="w-85"
                        name="purpose"
                        id="purpose"
                        value={values.purpose || ""}
                        onChange={(e, v) => {
                          handleChange(e);
                          // setParentSelected(e)
                          
                        }}
                        onBlur={handleBlur}
                      // disabled={editFlag}
                      // sx={
                      //   editFlag && {
                      //     backgroundColor: "#f3f3f3",
                      //     borderRadius: "6px",
                      //   }
                      // }
                      >
                        <MenuItem value="" style={{ display: "none" }}>
                          <em>Select Purpose</em>
                        </MenuItem>
                        {getPurposeTypeDropdown?.map((v: any) => (
                          <MenuItem value={v?.formName}>{v?.formName}</MenuItem>
                        ))}
                      </Select>

                      {touched.purpose && errors.purpose ? (
                        <p className="form-error" >{errors.purpose}</p>
                      ) : null}
                    </div>
                  </Grid>
                </Grid>
              </div>



              <Grid
                marginBottom="0px"
                marginTop="0px"
                container
                item
                spacing={3}
                justifyContent="start"
                alignSelf="center"
              >
                <Grid item xs={6} md={6} sx={{ position: "relative" }}>
                  <div className="approval-table pl-0">
                    <Table
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: "1px solid rgba(0, 0, 0, 0.12)",
                        },
                        mt: 0,
                        mb: 0,
                      }}
                      aria-label="spanning table"
                    >
                      <TableHead>
                        <TableRow sx={{ lineHeight: "0.5rem" }}>
                          <TableCell align="center" colSpan={2}>
                            To Branch Details
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            style={{ width: '185px' }}
                          >
                            Field
                          </TableCell>
                          <TableCell
                            align="center"
                            className="w-75"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                          >
                            Values
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                      <TableRow>
                          <TableCell className="font_bold">Branch Name & Code</TableCell>
                          <TableCell className="w-71" >{toBranchDetails[0]?.branch_Name !== undefined 
                           ? `${toBranchDetails[0]?.branch_Name}-${toBranchDetails[0]?.branch_Code}` : ""}</TableCell>
                        </TableRow>                       
                        <TableRow>
                          <TableCell className="font_bold w-35">Branch Address & PIN Code</TableCell>
                          <TableCell className="w-71" >{toBranchDetails[0]?.address !== undefined
                          ? `${toBranchDetails[0]?.address}-${toBranchDetails[0]?.pincode}` : ""}</TableCell>
                        </TableRow>                        
                        <TableRow>
                          <TableCell className="font_bold">State & City</TableCell>
                          <TableCell className="w-71" >{toBranchDetails[0]?.state !== undefined
                          ? `${toBranchDetails[0]?.state}-${toBranchDetails[0]?.city}` : ""}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font_bold">Contact Person Name</TableCell>
                          <TableCell className="w-71" >{toBranchDetails[0]?.branch_SPOC !== undefined ? 
                          toBranchDetails[0]?.branch_SPOC : ""}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font_bold width_30">Contact Person Number</TableCell>
                          <TableCell className="w-71" >{toBranchDetails[0]?.branch_SPOC_Phone ?
                          toBranchDetails[0]?.branch_SPOC_Phone : ""}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </Grid>
                <Grid item xs={6} md={6} sx={{ position: "relative" }}>
                  <div className="approval-table pl-0">
                    <Table
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: "1px solid rgba(0, 0, 0, 0.12)",
                        },
                        mt: 0,
                        mb: 0,
                      }}
                      aria-label="spanning table"
                    >
                      <TableHead>
                        <TableRow sx={{ lineHeight: "0.5rem" }}>
                          <TableCell align="center" colSpan={2}>
                            From Branch Details
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            align="center"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                            style={{ width: '185px' }}
                          >
                            Field
                          </TableCell>
                          <TableCell
                            align="center"
                            className="w-75"
                            sx={{ backgroundColor: "#f3f3f3 !important" }}
                          >
                            Values
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font_bold">Branch Name & Code</TableCell>
                          <TableCell className="w-71" >{fromBranchDetails[0]?.branch_Name !== undefined ? 
                          `${fromBranchDetails[0]?.branch_Name}-${fromBranchDetails[0]?.branch_Code}` : ""}</TableCell>
                        </TableRow>                       
                        <TableRow>
                          <TableCell className="font_bold w-35">Branch Address & PIN Code</TableCell>
                          <TableCell className="w-71" >{fromBranchDetails[0]?.address !== undefined ?
                          `${fromBranchDetails[0]?.address}-${fromBranchDetails[0]?.pincode}` : ""}</TableCell>
                        </TableRow>                     
                        <TableRow>
                          <TableCell className="font_bold">State & City</TableCell>
                          <TableCell className="w-71" >{fromBranchDetails[0]?.state !== undefined ? 
                          `${fromBranchDetails[0]?.state}-${fromBranchDetails[0]?.city}` : ""}</TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell className="font_bold">Contact Person Name</TableCell>
                          <TableCell className="w-71" >{fromBranchDetails[0]?.branch_SPOC !== undefined ? 
                          fromBranchDetails[0]?.branch_SPOC : ""}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font_bold width_30">Contact Person Number</TableCell>
                          <TableCell className="w-71" >{fromBranchDetails[0]?.branch_SPOC_Phone !== undefined ?
                          fromBranchDetails[0]?.branch_SPOC_Phone : ""}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </Grid>
              </Grid>
              <Typography
                className="section-headingTop"
                style={{ marginTop: 10 }}
                >
                  Asset Details
              </Typography>
                <div style={{ height: getHeightForTable()}}>
                  <CommonGrid
                    defaultColDef={{ flex: 1 }}
                    columnDefs={columnDefs}
                    rowData={assetData}
                    onGridReady={onGridReady}
                    gridRef={gridRef}
                    pagination={false}
                    paginationPageSize={10}
                  />
                </div>
              <div>
            {id && id != "noid"  &&
              <><div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "-5px",
                      marginBottom: "20px"
                    }}
                  >
                    <Typography className="section-headingTop" style={{ marginRight: "20px" }}>
                      Courier Details
                    </Typography>

                  </div><Grid
                    // marginBottom="7px"
                    container
                    item
                    spacing={5}
                    justifyContent="start"
                    alignSelf="center"
                   
                  >
                      <Grid
                        item
                        xs={6}
                        md={3}
                        sx={{ position: "relative" }}
                      >
                        <div className="input-form"  style={{marginTop:"-15px"}}>
                          <h2 className="phaseLable " >Movement By</h2>
                          <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            getOptionLabel={(option) => {
                              return option?.toString() || "";
                            } }
                            disableClearable={true}
                            // disabled
                            options={['Individual', 'Vendor', 'Employee']}
                            onChange={(e, value) => {
                            
                              setMovementBy(value);
                              //handleChange(e);
                              setFieldValue("carrier_movement_by",value);
                            } }
                            // onChange={handleChange}
                            // placeholder="City"
                            value={movementBy || ""}
                            renderInput={(params) => (
                              <TextField
                                name="carrier_movement_by"
                                id="carrier_movement_by"
                                {...params}
                                InputProps={{
                                  ...params.InputProps,
                                  style: { height: `35 !important` },
                                }}
                                variant="outlined"
                                size="small" />
                            )} />
                             {touched.carrier_movement_by && errors.carrier_movement_by && (
  <div className="form-error" style={{ color: 'red', fontSize: '12px' }}>
    {errors.carrier_movement_by}
  </div>
)}
                        </div>
                      </Grid>
                      <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                        <div className="input-form"  style={{marginTop:"-15px"}}>
                          <h2 className="phaseLable ">Name</h2>
                          <TextField
                            autoComplete="off"
                            name="carrier_name"
                            id="carrier_name"
                            variant="outlined"
                            size="small"
                            className="w-85"
                            value={values?.carrier_name}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              // Allow only alphabets (both uppercase and lowercase)
                              const filteredValue = inputValue.replace(/[^A-Za-z]/g, '');
                              handleChange({
                                target: {
                                  name: 'carrier_name',
                                  value: filteredValue,
                                },
                              });
                            }}
                            // disabled
                            onBlur={handleBlur} />
                            {touched.carrier_name && errors.carrier_name && (
  <div className="form-error" style={{ color: 'red', fontSize: '12px' }}>
    {errors.carrier_name}
  </div>
)}

                        </div>
                      </Grid>
                      <Grid item xs={6} md={3} sx={{ position: "relative"}}>
                        <div className="input-form"  style={{marginTop:"-15px"}}>
                          <h2 className="phaseLable ">Courier/Person Contact Number</h2>
                          <TextField
                            autoComplete="off"
                            name="courier_Person_ContactNumber"
                            id="courier_Person_ContactNumber"
                            variant="outlined"
                            size="small"
                            className="w-85"
                            value={values?.courier_Person_ContactNumber || ""}
                            onChange={handleChange}
                            
                            type="text"
                            InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                            onPaste={(e: any) => {
                                if (!textFieldValidationOnPaste(e)) {
                                    dispatch(fetchError('You can not paste Spacial characters'));
                                }
                            }}
                            onKeyDown={(e: any) => {
                             
                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                    e.preventDefault();
                                }
                                if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                    e.preventDefault();
                                }
                            }}
                            onBlur={handleBlur} />
                             {touched.courier_Person_ContactNumber && errors.courier_Person_ContactNumber && (
                              <div className="form-error" style={{ color: 'red', fontSize: '12px' }}>
                                {errors.courier_Person_ContactNumber}
                              </div>
                            )}
                           
                        </div>
                      </Grid>



                      <Grid item xs={6} md={3} sx={{ position: "relative" }}>
  <div className="input-form" style={{ marginTop: "-15px" }}>
    <h2 className="phaseLable">Individual/ Vendor Name</h2>
    <TextField
      autoComplete="off"
      name="individual_Vendor_Name"
      id="individual_Vendor_Name"
      variant="outlined"
      size="small"
      className="w-85"
      value={values?.individual_Vendor_Name}
      onChange={(e) => {
        const inputValue = e.target.value;
        // Allow only alphabets (both uppercase and lowercase)
        const filteredValue = inputValue.replace(/[^A-Za-z]/g, '');
        handleChange({
          target: {
            name: 'individual_Vendor_Name',
            value: filteredValue,
          },
        });
      }}
      

      onBlur={handleBlur}
    />
    {touched.individual_Vendor_Name && errors.individual_Vendor_Name && (
      <div className="form-error" style={{ color: 'red', fontSize: '12px' }}>
        {errors.individual_Vendor_Name}
      </div>
    )}
  </div>
</Grid>














                      
                      {/* <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                        <div className="input-form"  style={{marginTop:"-15px"}}>
                          <h2 className="phaseLable ">Individual/ Vendor Name</h2>
                          <TextField
                            autoComplete="off"
                            name="individual_Vendor_Name"
                            id="individual_Vendor_Name"
                            variant="outlined"
                            size="small"
                            className="w-85"
                            value={values?.individual_Vendor_Name}
                            onChange={handleChange}
                            
        
                            //onInput={handleInput}
                            // disabled
                            onBlur={handleBlur} /> 
                             {touched.individual_Vendor_Name && errors.individual_Vendor_Name && (
                              <div className="form-error" style={{ color: 'red', fontSize: '12px' }}>
                                {errors.individual_Vendor_Name}
                              </div>
                            )}
                        </div>
                      </Grid> */}
                      <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                        <div className="input-form" style={{marginTop:"-15px"}} >
                          <h2 className="phaseLable ">Courier/Person Name</h2>
                          <TextField
                            autoComplete="off"
                            name="courier_Person_Name"
                            id="courier_Person_Name"
                            variant="outlined"
                            size="small"
                            className="w-85"
                            value={values?.courier_Person_Name}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              // Allow only alphabets (both uppercase and lowercase)
                              const filteredValue = inputValue.replace(/[^A-Za-z]/g, '');
                              handleChange({
                                target: {
                                  name: 'courier_Person_Name',
                                  value: filteredValue,
                                },
                              });
                            }}
                            // disabled
                            onBlur={handleBlur} />
                            {touched.courier_Person_Name && errors.courier_Person_Name && (
                              <div className="form-error" style={{ color: 'red' , fontSize: '12px'}}>
                                {errors.courier_Person_Name}
                              </div>
                            )}
                            
                        </div>
                      </Grid>
                      <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                        <div className="input-form" style={{marginTop:"-15px"}}>
                          <h2 className="phaseLable ">Courier/Person Phone Number</h2>
                          <TextField
                            autoComplete="off"
                            name="courier_Person_PhoneNumber"
                            id="courier_Person_PhoneNumber"
                            variant="outlined"
                            size="small"
                            className="w-85"
                            value={values?.courier_Person_PhoneNumber|| ""}
                             onChange={ handleChange}
                              //(e) => {
                              
                            //   if ( (e?.target?.selectionStart == 1) && !isValidContactNo(e?.target?.value)) {
                                
                            //     dispatch(fetchError("Contact Number must be start with 9,8,7 or 6"))
                               
                            //   }
                             // handleChange(e)}}
                            // disabled
                            type="text"
                            InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                            onPaste={(e: any) => {
                                if (!textFieldValidationOnPaste(e)) {
                                    dispatch(fetchError('You can not paste Spacial characters'));
                                }
                            }}
                            onKeyDown={(e: any) => {
                                if (e.target.selectionStart === 0 && e.code === 'Space') {
                                    e.preventDefault();
                                }
                                if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                                    e.preventDefault();
                                }
                            }}
                            onBlur={handleBlur} />{touched.courier_Person_PhoneNumber && errors.courier_Person_PhoneNumber && (
                              <div className="form-error" style={{ color: 'red', fontSize: '12px' }}>
          {errors.courier_Person_PhoneNumber}
                              </div>
                            )}
                        </div>
                      </Grid>
                    </Grid></>
              }
              </div>
              <div className="bottom-fix-history" style={{marginBottom: "-15px"}}>
              {  (
                  <MandateStatusHistory
                    mandateCode={assetCode}
                    accept_Reject_Status={currentStatus}
                    accept_Reject_Remark={currentRemark}
                  />
                )}
              </div>





              <div className="bottom-fix-btn bg-pd">
                {/* <div className="remark-field"> */}
                <Tooltip title="Back">
                  <Button
                    variant="outlined"
                    size="small"
                    type="reset"
                    style={reset}
                    sx={{
                      padding: "2px 20px !important",
                      marginRight: "10px !important",
                      borderRadius: 6,
                      marginTop:"5px"
                    }}
                    onClick={handleBackClick}
                  >
                    Back
                  </Button>
                </Tooltip>
                <Tooltip title="Submit">
                  <Button
                    style={{
                      padding: "2px 20px",
                      borderRadius: 6,
                      color: "rgb(255, 255, 255)",
                      borderColor: "rgb(0, 49, 106)",
                      backgroundColor: "rgb(0, 49, 106)",
                      marginTop:"5px"
                    }}
                    variant="outlined"
                    size="small"
                    type="submit"
                  >
                    Submit
                  </Button>
                </Tooltip>
                {/* </div> */}
              </div>
            </form >
            
          </div >
        </div >
      </div >
      <SwipeableDrawer
        anchor={"right"}
        open={openDrawerAssetCode}
        onClose={(e) => {
          setOpenDrawerAssetCode(!openDrawerAssetCode);
        }}
        onOpen={(e) => {
          setOpenDrawerAssetCode(!openDrawerAssetCode);
        }}
      >
        {/* <ComplienceTimeline mandateCode={mandateCode} /> */}
        
        <AssetCodeDrawer
          onAssetDrawerData={assetDrawerData}
          handleClose={() => setOpenDrawerAssetCode(false)}
        />
      </SwipeableDrawer>
    </>
  );
};

export default AssetGatePass;
