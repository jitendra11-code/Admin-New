import { Box, Autocomplete, Button, Checkbox, FormControlLabel, Grid, Stack, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid'
import { assetDetailsInitialValues } from '@uikit/schemas';
import { useFormik } from 'formik';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux';
import { fetchError, showMessage, showWarning } from 'redux/actions';
import { submit } from 'shared/constants/CustomColor';
import axios from "axios";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import ToggleSwitch from '@uikit/common/ToggleSwitch';

import { accordionTitle, toggleTitle, imageCard, secondaryButton, toggleTitle1 } from 'shared/constants/CustomColor';
import AddCircleIcon from '@mui/icons-material/AddCircle';
// import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import moment from 'moment';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import dayjs, { Dayjs } from "dayjs";
import * as Yup from "yup";
import { useFormikContext } from 'formik';
import Image from "./Image.png";
import Zip from "./zip.png";
import regExpressionTextField, { regExpressionRemark } from '@uikit/common/RegExpValidation/regForTextField';

const CapitalizedDrawerComponent = ({ onAssetDetaildViewData, handleClose, actionType,AssetData }) => {

  const dispatch = useDispatch();
  const [checked, setChecked] = React.useState({});
  const [selectedDropdown, setSelectedDropdown] = React.useState(null);
  const [unutilisedData, setUnutilisedData] = React.useState(null);
  const [assignedAssetData, setAssignedAssetData] = React.useState([]);
  const [assetPoolDetails, setAssetPoolDetails] = React.useState(null);
  const staticDate = new Date('2023-12-01');
  const handleReturnDate = () => { };
  const [totalTAT, setTotalTAT] = React.useState(true);
  const handleTat = (e) => {
    setTotalTAT(e.target.value === 'true' ? true : false);
  };
  const [imagePreview, setImagePreview] = React.useState<any>({});
  const [statusP, setStatusP] = useState(null);
  const [errorMsg, setErrorMsg] = useState<any>({});
  const [isSuccess, setIsSuccess] = useState<any>(false);
  const [imageUpload, setImageUpload] = React.useState<any>({});
  const [removeImagenName, setRemoveImagenName] = useState<any>([]);
  const [value, setValue] = useState('YES');
  const [isPhysicallyAvailable, setIsPhysicallyAvailable] = React.useState(true);
  const [toggleSwitch, setToggleSwitch] = React.useState<any>({});
  const { user } = useAuthUser(); 
  const [DispatchDate,setDispatchDate] = useState(moment(new Date()).format());
  const [dispatchDateError, setDispatchDateError] = useState<any>("");
  const [Item,setItem] = useState("");
  const [AWBNO,setAWBNO]=useState("");
  const [courierAgency,setCourierAgency]=useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLimit, setFileLimit] = useState(false);
  const [fileLength, setFileLength] = useState(0);

  const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
  }));

  const [imageError, setImageError] = useState<any>({
    AssetImageWithoutTag: true,
    AssetImageWithTag: true,
    CompleteAssetImage: true,
  });
  var ImageTypeList = [
    'AssetImageWithoutTag',
    'AssetImageWithTag',
    'CompleteAssetImage'
  ]

  const handleDrop = (e: any, imageKey) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];

    if (!droppedFile) {
      return;
    }

    const { name, size } = droppedFile;

    const MIN_FILE_SIZE = 10240;
    const fileSizeKiloBytes = size / 10240;
    if (fileSizeKiloBytes > MIN_FILE_SIZE) {
      setErrorMsg({
        ...errorMsg,
        [imageKey]: 'Please upload less than 10mb file size',
      });
      setIsSuccess(false);
      return;
    } else {
      setImageError({ ...imageError, [imageKey]: true });
      setImageUpload({ ...imageUpload, [imageKey]: droppedFile });
      setRemoveImagenName(removeImagenName?.filter((v) => v !== imageKey));
      let file = droppedFile;
      let fileURL = URL.createObjectURL(file);
      file.fileURL = fileURL;
      setImagePreview({ ...imagePreview, [imageKey]: file.fileURL });
      setIsSuccess(true);
    }
    setErrorMsg({ ...errorMsg, [imageKey]: '' });
  };

  const errorImage = useCallback(
    async (e, v: any) => {
      if (imagePreview) var x = imageError;
      if (x.hasOwnProperty(v)) {
        x[v] = false;
      }
      e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cHJvcGVydHl8ZW58MHx8MHx8&w=1000&q=80';
      await setImageError(x);
    },
    [imagePreview],
  );

  const onImageChange = (e: any) => {
    const { name, value } = e.target;

    const MIN_FILE_SIZE = 10240;
    const fileSizeKiloBytes = e.currentTarget.files[0].size / 10240;
    if (fileSizeKiloBytes > MIN_FILE_SIZE) {
      setErrorMsg({
        ...errorMsg,
        [name]: 'Please upload less than 10mb file size',
      });
      setIsSuccess(false);
      return;
    } else {
      setImageError({ ...imageError, [name]: true });
      setImageUpload({ ...imageUpload, [name]: e.currentTarget.files[0] });
      setRemoveImagenName(removeImagenName?.filter((v) => v !== name));
      let file = e.currentTarget.files[0];
      let fileURL = URL.createObjectURL(file);
      file.fileURL = fileURL;
      setImagePreview({ ...imagePreview, [name]: file.fileURL });
    }
    setErrorMsg({ ...errorMsg, [name]: '' });
    setIsSuccess(true);
  };
  
  const removeImage = (v: any) => {
    delete imagePreview[v];
    setRemoveImagenName([...removeImagenName, v]);
    let data = { ...imagePreview };
    delete data[v];

    setImagePreview(data);
  };
  
  const MAX_COUNT = 8;

  const AccordionSummary = styled((props: AccordionSummaryProps) => <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...props} />)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
      transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: theme.spacing(1),
    },
  }));

  const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
  }));

  const handleChangeToggle = (event: any, newAlignment: string) => {
    setToggleSwitch({
        ...toggleSwitch,
        [newAlignment]: event.target.value === 'true' ? true : false,
    });
    setFieldValue(newAlignment,event.target.value === 'true' ? (newAlignment=="tagNotReceived" ? true : "true") : (newAlignment=="tagNotReceived" ? false : "false"))
  };

  const handleDispatchDate = (newValue) => {
    if (newValue !== null && dayjs(newValue).isValid()) {
      setDispatchDateError("");
      setFieldValue("DispatchDate",moment(new Date(newValue)).format());
    } else {
      // setDispatchDateError("please enter valid date");
      setFieldTouched('DispatchDate', true);
    }
  };
  const handleConfirmationDate = (newValue) => {
    if (newValue !== null && dayjs(newValue).isValid()) {
      // setDispatchDateError("");
      // console.log("newValue",newValue);
      setFieldValue("ConfirmationDate",moment(new Date(newValue)).format());
    } else {
      // setDispatchDateError("please enter valid date");
      setFieldTouched('ConfirmationDate', true);
    }
  };

  // const dispatch = useDispatch();
  // const [checked, setChecked] = React.useState({});
  // const [selectedDropdown, setSelectedDropdown] = React.useState(null);
  // const [unutilisedData, setUnutilisedData] = React.useState(null);
  // const [assignedAssetData, setAssignedAssetData] = React.useState([]);
  // const [assetPoolDetails, setAssetPoolDetails] = React.useState(null);
  // const staticDate = new Date('2023-12-01');
  // console.log('Action Type:', actionType);
  // const handleReturnDate = () => { };
  // console.log('assigned', assignedAssetData, selectedDropdown)

  const handleDateChange = () => {

  };

  const handleEmpaneled = (e) => {

  };

  const validateSchema = Yup.object({
    Item: Yup.string().required("Please enter Item"),
    AWBNO: Yup.string().required("Please enter AWB No"),
    courierAgency: Yup.string().required("Please enter Courier Agency"),
    DispatchDate: Yup.date().required("Please select Dispatch date"),
    ConfirmationDate : Yup.date().required("Please select Confirmation date"),
    Name : Yup.string().required("Please enter Name"),
    EmailID: Yup.string().email("Invalid email format").required("Please enter Email Id"),
    Remarks: Yup.string().required("Please enter Remarks"),
    physicallyAvailable:Yup.string().required("Please select Physically Available"),
    workingCondition:Yup.string().required("Please select Working Condition"),
    tagNotReceived:Yup.bool().required("Please select Tag Not Received"),
  });

  const {
    values,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    handleChange,
    handleSubmit,
    setErrors,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: {
      Item: '',
      AWBNO: '',
      courierAgency: '',
      DispatchDate:new Date(),
      ConfirmationDate : new Date(),
      Name : '',
      EmailID:'',
      Remarks:'',
      physicallyAvailable:'',
      workingCondition:'',
      tagNotReceived:false,
    },
    validationSchema: validateSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values, action) => {
    },
  });

  useEffect(()=>{
    resetForm();
    setFieldValue("Item",AssetData?.item || "");
    setFieldValue("AWBNO",AssetData.awbno || "");
    setFieldValue("courierAgency",AssetData?.courierAgency || "");
    setFieldValue("DispatchDate",AssetData?.dispatchDate || "");
    setFieldValue("physicallyAvailable",AssetData?.physicallyAvailable || "");
    setFieldValue("workingCondition",AssetData?.workingCondition || "");
    setFieldValue("Name",AssetData?.name || "");
    setFieldValue("EmailID",AssetData?.emailID || "");
    setFieldValue("Remarks",AssetData?.remarks || "") ;
    setFieldValue("ConfirmationDate",AssetData?.confirmationDate || "");
    setFieldValue("tagNotReceived",AssetData?.tagnotReceived || "");
    setToggleSwitch({
      ...toggleSwitch,
      physicallyAvailable: AssetData?.physicallyAvailable == "true" ? true : AssetData?.physicallyAvailable == "false" ? false : null,
      workingCondition: AssetData?.workingCondition == "true" ? true : AssetData?.workingCondition == "false" ? false : null,
      tagNotReceived: AssetData?.tagnotReceived,
    });
    // if(AssetData?.assetCode){
    //   ImageTypeList && 
    //   ImageTypeList?.map((item) => {
    //       return _getImage(item);
    //   });
    // }
  },[AssetData]);

  const submitCourierDetails = async () => {
    if(values?.Item && values?.AWBNO && values?.courierAgency && values?.DispatchDate)
      // (values?.physicallyAvailable && values?.workingCondition && values?.Name && values?.EmailID && values?.Remarks && values?.ConfirmationDate && (values?.tagNotReceived == true ||values?.tagNotReceived==false))
    {
      const body = {
        id: AssetData?.id,
        assetCode: AssetData?.assetCode,
        assetType: AssetData?.assetType,
        assetCategorization: AssetData?.assetCategorization,
        assetClassDescription: AssetData?.assetClassDescription,
        assetDescription: AssetData?.assetDescription,
        pavLocation: AssetData?.pavLocation,
        bookVal: AssetData?.bookVal,
        capitalizationDate: AssetData?.capitalizationDate,
        status: AssetData?.status,
        createdBy: AssetData?.createdBy,
        createdDate: AssetData?.createdDate,
        modifiedBy: user?.UserName,
        modifiedDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
        item: values?.Item,
        awbno: values?.AWBNO,
        courierAgency: values?.courierAgency,
        dispatchDate: values?.DispatchDate,
        name : AssetData?.name,
        emailID : AssetData?.emailID,
        physicallyAvailable: AssetData?.physicallyAvailable,
        workingCondition: AssetData?.workingCondition,
        remarks: AssetData?.remarks,
        confirmationDate: AssetData?.confirmationDate,
        tagnotReceived: AssetData?.tagnotReceived,
        locationCode: AssetData?.locationCode,
        adminCategory: AssetData?.adminCategory,
        branchCode: AssetData?.branchCode,
        costCenter: AssetData?.costCenter,
        sapLocationCode: AssetData?.sapLocationCode,
        glAccount: AssetData?.glAccount,
        poNumber: AssetData?.poNumber,
        serial_number: AssetData?.serial_number,
        acquis_val: AssetData?.acquis_val,
        accum_dep: AssetData?.accum_dep,
        ord_dep_start_date: AssetData?.ord_dep_start_date
      }

      for (const key in imageUpload) {
        if (imageUpload.hasOwnProperty(key)) {
          const fileInfo = imageUpload[key];
          handleUploadFiles(fileInfo,key);
        }
      }

      if(removeImagenName.length>0)
      {
        await deleteImage();
      }
      await axios
        .post(`${process.env.REACT_APP_BASEURL}/api/AssetTagging/InsertUpdateAssetTagging`, body)
        .then((response: any) => {
          if (!response) {
            dispatch(fetchError("Asset Tagging details not updated"))
            handleCloseD();
            return;
          };
          if (response && response?.data?.code === 200 && response?.data?.status === true) {
            dispatch(showMessage("Asset Tagging details updated successfully"))
            handleCloseD();
            return;
          } else {
            dispatch(fetchError("Asset Tagging details not updated"));
            handleCloseD();
            return;
          }
        })
        .catch((e: any) => {
          handleClose();
          dispatch(fetchError("Error Occurred !"));
        });
      resetForm();
    }
    else{
      setFieldTouched("Item",true);
      setFieldTouched("AWBNO",true);
      setFieldTouched("courierAgency",true);
      setFieldTouched("DispatchDate",true);
      // setFieldTouched("physicallyAvailable",true);
      // setFieldTouched("workingCondition",true);
      // setFieldTouched("Name",true);
      // setFieldTouched("EmailID",true);
      // setFieldTouched("Remarks",true);
      // setFieldTouched("ConfirmationDate",true);
      // setFieldTouched("tagNotReceived",true);
    }
  }

  const handleUploadFiles = async (files,type) => {
    const filesArray = Array.isArray(files) ? files : [files];
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;
    filesArray.forEach((file) => {
        if (
          uploaded &&
          uploaded?.findIndex((f) => f.name === file.name) === -1
        ) {
          uploaded.push(file);
          if (uploaded?.length === MAX_COUNT) setFileLimit(true);
          if (uploaded?.length > MAX_COUNT) {
            dispatch(
              fetchError(
                `You can only add a maximum of ${MAX_COUNT} files` || ""
              )
            );
            setFileLimit(false);
            limitExceeded = true;
            return;
          }
        }
      });

    if (limitExceeded) {
      dispatch(
        fetchError(`You can only add a maximum of ${MAX_COUNT} files` || "")
      );

      return;
    }
    
    if (!limitExceeded) setUploadedFiles(uploaded);
    setFileLength((uploaded && uploaded?.length) || 0);
    const formData: any = new FormData();
    formData.append('assetcode', AssetData?.assetCode || 0);
    formData.append('documenttype', 'Asset Tagging');
    formData.append("CreatedBy", user?.UserName || "");
    formData.append("ModifiedBy", user?.UserName || "");
    formData.append('entityname', type);
    formData.append('RecordId', 0);
    formData.append('remarks', '');
    for (var key in uploaded) {
      await formData.append("file", uploaded[key]);
    }

    if (uploaded?.length === 0) {
      setUploadedFiles([]);
      setFileLimit(false);
      dispatch(fetchError("Error Occurred !"));
      return;
    }
    if (formData) {

      dispatch(
        showWarning(
          "Upload is in progress, please check after sometime"
        )
      );

      await axios
        .post(`${process.env.REACT_APP_BASEURL}/api/ImageStorage/FileUploadForAssetPool`,formData)
        .then((response: any) => {
            // e.target.value = null;
            if (!response) {
              setUploadedFiles([]);
              setFileLimit(false);
              setImagePreview({});
              setImageUpload({});
              setToggleSwitch({});
              dispatch(fetchError("Error Occurred !"));
              return;
            }
            if (response?.data?.data == null) {
              setImagePreview({});
              setImageUpload({});
              setToggleSwitch({});
              setUploadedFiles([]);
              setFileLimit(false);
              dispatch(fetchError("Documents are not uploaded!"));
              // getVersionHistoryData();
              return;
            } else if (response?.status === 200) {
              setImagePreview({});
              setImageUpload({});
              setToggleSwitch({});
              setUploadedFiles([]);
              setFileLimit(false);
              dispatch(showMessage("Documents are uploaded successfully!"));
              // getVersionHistoryData();
            }
        })
        .catch((e: any) => {
            dispatch(fetchError("Error Occurred !"));
        });
    }
  };

  const _getImage = async (type: string) => {
    await axios
        .get(`${process.env.REACT_APP_BASEURL}/api/AssetTagging/RetriveImageForAssetTagging?AssetCode=${AssetData?.assetCode || 0}&Type=Asset Tagging&entityname=${type}`)
        .then((response: any) => {
            if (response?.data?.base64String !== undefined) {
              // debugger
              let imageType = "image/png"; // default image type

                // Check if the response represents a zip file
              if (response?.data?.filename.toLowerCase().endsWith(".zip")) {
                setImagePreview((state) => ({
                  ...state,
                  [type]: `data:image/png;base64,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`,
              }));
              }
              else{
                setImagePreview((state) => ({
                    ...state,
                    [type]: `data:image/png;base64,${response?.data?.base64String}`,
                }));
              }
            } else {
                setImagePreview((state) => ({
                    ...state,
                    [type]: null,
                }));
            }
        })
        .catch((e: any) => {});
  };

  const deleteImage = async ()=> {
    await axios
      .post(`${process.env.REACT_APP_BASEURL}/api/AssetTagging/Delete_Asset_Tagging_Image?AssetCode=${AssetData?.assetCode || 0}&Type=Asset Tagging`,removeImagenName)
      .then((response : any)=>{
        if(!response){
            dispatch(fetchError("Error occurred"));
            return;
        }
        if(response && response?.data?.code === 200 && response?.data?.status === true) {
            dispatch(showMessage(response?.data?.message));
            return;
        }
        else{
            dispatch(fetchError("Asset Tagging Image details not deleted"));
            return;
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  }

  const handleCloseD = () => {
    handleClose();
    resetForm();
    setImagePreview({});
    setImageUpload({});
    setToggleSwitch({});
    setRemoveImagenName([]);
  }

  return (
    <>
      {/* <Box component="h2" className="page-title-heading mb-0" style={{marginLeft: "25px",marginTop: "5px",}}>
            Asset Tagging
      </Box> */}
    
      <div style={{ padding: "20px", width: "71vw", }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "-10px",
          }}
        >
          {/* <Typography className="section-headingTop">
            Asset Details View
          </Typography> */}
        </div>
        <div className="card-panal inside-scroll-87" style={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography className="section-headpad">
            Asset Details View
          </Typography>
          <div>
            <Grid marginBottom="0px" marginTop="0px" container item spacing={3} justifyContent="start" alignSelf="center">
              <Grid item xs={6} md={6} sx={{ position: 'relative' }} className="padtop0">
                <div className="approval-table pl-0">
                  <Table
                    sx={{
                      '&:last-child td, &:last-child th': {
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                      },
                      mt: 0,
                      mb: 0,
                    }}
                    aria-label="spanning table"
                  >
                    {/* <TableHead>
                    <TableRow sx={{ lineHeight: '0.5rem' }}>
                      <TableCell align="center" colSpan={2}>
                        Source Branch
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="center" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                        Field
                      </TableCell>
                      <TableCell align="center" className="w-75" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                        Values
                      </TableCell>
                    </TableRow>
                  </TableHead> */}
                    <TableBody>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Asset Code</TableCell>
                        <TableCell className="w-75">{AssetData?.assetCode}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Asset Categorization</TableCell>
                        <TableCell className="w-75">{AssetData?.assetCategorization}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Asset Description</TableCell>
                        <TableCell className="w-75">{AssetData?.assetDescription}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">PAV Location</TableCell>
                        <TableCell className="w-75">{AssetData?.pavLocation}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Branch Code</TableCell>
                        <TableCell className="w-75">{AssetData?.branchCode}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor" style={{ width: "30%" }}>SAP Location Code</TableCell>
                        <TableCell className="w-75">{AssetData?.sapLocationCode}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">PO Number</TableCell>
                        <TableCell className="w-75">{AssetData?.poNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Acquis.val.</TableCell>
                        <TableCell className="w-75">{AssetData?.acquis_val}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Book val.</TableCell>
                        <TableCell className="w-75">{AssetData?.bookVal}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Cap.date</TableCell>
                        <TableCell className="w-75">{moment(AssetData?.capitalizationDate).format("DD-MM-YYYY")}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Grid>
              <Grid item xs={6} md={6} sx={{ position: 'relative' }} className="padtop0">
                <div className="approval-table pl-0">
                  <Table
                    sx={{
                      '&:last-child td, &:last-child th': {
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                      },
                      mt: 0,
                      mb: 0,
                    }}
                    aria-label="spanning table"
                  >
                    {/* <TableHead>
                    <TableRow sx={{ lineHeight: '0.5rem' }}>
                      <TableCell align="center" colSpan={2}>
                        Destination Branch
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align="center" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                        Field
                      </TableCell>
                      <TableCell align="center" className="w-75" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                        Values
                      </TableCell>
                    </TableRow>
                  </TableHead> */}
                    <TableBody>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Asset type</TableCell>
                        <TableCell className="w-75">{AssetData?.assetType}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor" style={{ width: "33%" }}>Asset class description</TableCell>
                        <TableCell className="w-75">{AssetData?.assetClassDescription}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Location Code</TableCell>
                        <TableCell className="w-75">{AssetData?.locationCode}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Admin Category</TableCell>
                        <TableCell className="w-75">{AssetData?.adminCategory}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Cost Center</TableCell>
                        <TableCell className="w-75">{AssetData?.costCenter} </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">GL Account</TableCell>
                        <TableCell className="w-75">{AssetData?.glAccount}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Serial number</TableCell>
                        <TableCell className="w-75">{AssetData?.serial_number}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Accum.dep.</TableCell>
                        <TableCell className="w-75">{AssetData?.accum_dep}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="field-bold assetbackcolor">Ord.dep.start date</TableCell>
                        <TableCell className="w-75">{moment(AssetData?.ord_dep_start_date).format("DD-MM-YYYY")}</TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                </div>
              </Grid>
            </Grid>
          </div>

          <div style={{ border: '1px solid rgba(0, 0, 0, 0.12)', marginTop: "10px" }}>
            <Typography className="section-headpad">
              Courier Details
            </Typography>
            <Grid marginBottom="0px" marginTop="0px" container item spacing={3} justifyContent="start" alignSelf="center">
              <Grid item xs={12} md={12} sx={{ position: 'relative' }} className="padtop0">
                <div className="approval-table pl-0">
                  <Table
                    sx={{
                      '&:last-child td, &:last-child th': {
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                      },
                      mt: 0,
                      mb: 0,
                    }}
                    aria-label="spanning table"
                  >
                    <TableHead>
                      {/* <TableRow sx={{ lineHeight: '0.5rem' }}>
                        <TableCell align="center" colSpan={2}>
                          Source Branch
                        </TableCell>
                      </TableRow> */}
                      <TableRow>
                        <TableCell align="center" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                          Item
                        </TableCell>
                        <TableCell align="center" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                          AWB No.
                        </TableCell>
                        <TableCell align="center" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                          Courier Agency
                        </TableCell>
                        <TableCell align="center" sx={{ backgroundColor: '#f3f3f3 !important' }}>
                          Dispatch Date
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <TextField
                            id="Item"
                            name="Item"
                            variant="outlined"
                            size="small"
                            value={values?.Item || ""}
                            disabled={actionType=="view"}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          />
                          { touched.Item && errors.Item ? (<p className="form-error">{errors.Item}</p>) : null }
                        </TableCell>
                        <TableCell>
                          <TextField
                            id="AWBNO"
                            name="AWBNO"
                            variant="outlined"
                            size="small"
                            value={values?.AWBNO || ""}
                            disabled={actionType=="view"}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          />
                          { touched.AWBNO && errors.AWBNO ? (<p className="form-error">{errors.AWBNO}</p>) : null }
                        </TableCell>
                        <TableCell>
                          <TextField
                            id="courierAgency"
                            name="courierAgency"
                            variant="outlined"
                            size="small"
                            value={values?.courierAgency || ""}
                            disabled={actionType=="view"}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          />
                          { touched.courierAgency && errors.courierAgency ? (<p className="form-error">{errors.courierAgency}</p>) : null }
                        </TableCell>
                        <TableCell>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopDatePicker
                              className="w-85"
                              inputFormat="DD/MM/YYYY"
                              value={values?.DispatchDate || "" || null}
                              onChange={handleDispatchDate}
                              disabled={actionType=="view"}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  name="DispatchDate"
                                  size="small"
                                  onKeyDown={(e: any) => e.preventDefault()}
                                />
                              )}
                            />
                            { touched.DispatchDate && errors.DispatchDate ? (<p className="form-error">Please select Dispatch date</p>) : null }
                          </LocalizationProvider>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Grid>
            </Grid>
          </div>

          {false && (<div style={{ border: '1px solid rgba(0, 0, 0, 0.12)', marginTop: "10px" }}>

            <Typography className="section-headingTopAsset">Tagging Details</Typography>


            <Grid marginTop="0px" container item spacing={5} justifyContent="start" alignSelf="center">
              {/* <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                <Typography className="add-prop-bold" sx={toggleTitle}>
                  Direction Board - 2 Nos
                </Typography>
                <ToggleSwitch
                  alignment={toggleSwitch?.directionBoard}
                  handleChange={(e: any) => handleChangeToggle(e, 'directionBoard')}
                  yes={'yes'}
                  no={'no'}
                  name="directionBoard"
                  id="directionBoard"
                  onBlur={''}
                  disabled={statusP === 'Approve'}
                  bold="true"
                />
                {touched?.directionBoard && errors?.directionBoard ? <p className="form-error">{errors?.directionBoard}</p> : null}
              </Grid> */}
              <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Physically Available
                </Typography>
                <ToggleSwitch
                    alignment={toggleSwitch?.physicallyAvailable}
                    handleChange={(e: any) => handleChangeToggle(e, 'physicallyAvailable')}
                    yes={'yes'}
                    no={'no'}
                    disabled={statusP === 'Approve'}
                    name="physicallyAvailable"
                    id="physicallyAvailable"
                    onBlur={handleBlur}
                    bold="true"
                />
                {touched?.physicallyAvailable && errors?.physicallyAvailable ? <p className="form-error">{errors?.physicallyAvailable}</p> : null}
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Working Condition
                </Typography>
                <ToggleSwitch
                    alignment={toggleSwitch?.workingCondition}
                    handleChange={(e: any) => handleChangeToggle(e, 'workingCondition')}
                    yes={'yes'}
                    no={'no'}
                    disabled={statusP === 'Approve'}
                    name="workingCondition"
                    id="workingCondition"
                    onBlur={handleBlur}
                    bold="true"
                />
                {touched?.workingCondition && errors?.workingCondition ? <p className="form-error">{errors?.workingCondition}</p> : null}
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                  Name
                </Typography>
                <TextField
                  multiline
                  id="Name"
                  name="Name"
                  variant="outlined"
                  size="small"
                  value={values?.Name || ""}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onKeyDown={(e: any) => {
                    regExpressionTextField(e);
                  }}
                />
                {touched?.Name && errors?.Name ? <p className="form-error">{errors?.Name}</p> : null}
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                  Email Id
                </Typography>
                <TextField
                  id="EmailID"
                  name="EmailID"
                  variant="outlined"
                  size="small"
                  value={values?.EmailID || ""}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onKeyDown={(e: any) => {
                    if (e.target.selectionStart === 0 && e.code === 'Space') {
                        e.preventDefault();
                    }
                    if (e.code === 'Space') {
                        e.preventDefault();
                    }
                  }}
                />
                {touched?.EmailID && errors?.EmailID ? <p className="form-error">{errors?.EmailID}</p> : null}
              </Grid>

              <Grid item xs={6} md={6} sx={{ position: 'relative' }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                  Remarks
                </Typography>
                <TextField
                  multiline
                  id="Remarks"
                  name="Remarks"
                  variant="outlined"
                  size="small"
                  value={values?.Remarks || ""}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onKeyDown={(e: any) => {
                    regExpressionRemark(e);
                    if (e.which === 32 && !e.target.value.length) e.preventDefault();
                  }}
                />
                {touched?.Remarks && errors?.Remarks ? (<p className="form-error">{errors?.Remarks}</p>) : null}
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                <Typography className=" required add-prop-bold" sx={toggleTitle}>
                  Confirmation Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    className="w-85"
                    inputFormat="DD/MM/YYYY"
                    value={values?.ConfirmationDate || "" || null}
                    onChange={handleConfirmationDate}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="ConfirmationDate"
                        size="small"
                        onKeyDown={(e: any) => e.preventDefault()}
                      />
                    )}
                  />
                </LocalizationProvider>
                {touched?.ConfirmationDate && errors?.ConfirmationDate ? <p className="form-error">Please select Confirmation Date</p> : null}
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: 'relative' }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                  Tag Not Received
                </Typography>
                <ToggleSwitch
                    alignment={toggleSwitch?.tagNotReceived}
                    handleChange={(e: any) => handleChangeToggle(e, 'tagNotReceived')}
                    yes={'yes'}
                    no={'no'}
                    disabled={statusP === 'Approve'}
                    name="tagNotReceived"
                    id="tagNotReceived"
                    onBlur={handleBlur}
                    bold="true"
                />
                {touched?.tagNotReceived && errors?.tagNotReceived ? <p className="form-error">{errors?.tagNotReceived}</p> : null}
              </Grid>

              <Grid item xs={12} md={4} style={{ position: 'relative' }}>
                <label htmlFor="AssetImageWithoutTag" className="">
                  <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                    Asset Image Without Tag
                  </Typography>
                  {(!imagePreview?.AssetImageWithoutTag || !imageError?.AssetImageWithoutTag) && (
                    <>
                      
                      <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'AssetImageWithoutTag')}>
                        <span>
                          <img
                            onError={(e) => errorImage(e, 'AssetImageWithoutTag')}
                            src={Image}
                            style={{
                              width: 50,
                              height: 50,
                              marginLeft: 75,
                              marginTop: 10,
                            }}
                          />
                          <br />
                          <p style={{ marginTop: 10 }}> Drag your image, zip file here, </p>
                          <p style={{ marginLeft: 65 }}>or Browse</p>
                          <p
                            style={{
                              marginTop: 10,
                              fontSize: 10,
                              marginLeft: 38,
                              color: '#848181',
                            }}
                          >
                            Supports: JPG or PNG or ZIP
                          </p>
                        </span>
                      </Box>
                      <input type="file" id="AssetImageWithoutTag" name="AssetImageWithoutTag" accept=".png, .jpg, .jpeg, .zip" hidden onChange={onImageChange} />
                    </>
                  )}
                </label>
                {imagePreview?.AssetImageWithoutTag && imageError?.AssetImageWithoutTag && (
                  <>
                    <img
                      onError={(e) => errorImage(e, 'AssetImageWithoutTag')}
                      id="AssetImageWithoutTag"
                      src={imagePreview?.AssetImageWithoutTag}
                      style={{
                        width: '100%',
                        height: 150,
                        borderRadius: '4px',
                      }}
                      draggable="false"
                      onDragStart={(e) => e.preventDefault()}
                    />
                    <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('AssetImageWithoutTag')} />
                  </>
                )}
                {errorMsg?.AssetImageWithoutTag && <p className="form-error">{errorMsg?.AssetImageWithoutTag}</p>}
              </Grid>

              <Grid item xs={12} md={4} style={{ position: 'relative' }}>
                <label htmlFor="AssetImageWithTag" className="">
                  <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                    Asset Image With Tag
                  </Typography>
                  {(!imagePreview?.AssetImageWithTag || !imageError?.AssetImageWithTag) && (
                    <>
                      
                      <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'AssetImageWithTag')}>
                        <span>
                          <img
                            onError={(e) => errorImage(e, 'AssetImageWithTag')}
                            src={Image}
                            style={{
                              width: 50,
                              height: 50,
                              marginLeft: 75,
                              marginTop: 10,
                            }}
                          />
                          <br />
                          <p style={{ marginTop: 10 }}> Drag your image, zip file here, </p>
                          <p style={{ marginLeft: 65 }}>or Browse</p>
                          <p
                            style={{
                              marginTop: 10,
                              fontSize: 10,
                              marginLeft: 38,
                              color: '#848181',
                            }}
                          >
                            Supports: JPG or PNG or ZIP
                          </p>
                        </span>
                      </Box>
                      <input type="file" id="AssetImageWithTag" name="AssetImageWithTag" accept=".png, .jpg, .jpeg, .zip" hidden onChange={onImageChange} />
                    </>
                  )}
                </label>
                {imagePreview?.AssetImageWithTag && imageError?.AssetImageWithTag && (
                  <>
                    <img
                      onError={(e) => errorImage(e, 'AssetImageWithTag')}
                      id="AssetImageWithTag"
                      src={imagePreview?.AssetImageWithTag}
                      style={{
                        width: '100%',
                        height: 150,
                        borderRadius: '4px',
                      }}
                      draggable="false"
                      onDragStart={(e) => e.preventDefault()}
                    />
                    <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('AssetImageWithTag')} />
                  </>
                )}
                {errorMsg?.AssetImageWithTag && <p className="form-error">{errorMsg?.AssetImageWithTag}</p>}
              </Grid>

              <Grid item xs={12} md={4} style={{ position: 'relative' }}>
                <label htmlFor="CompleteAssetImage" className="">
                  <Typography className="add-prop-bold" sx={{ fontSize: '13px' }}>
                    Complete Asset Image
                  </Typography>
                  {(!imagePreview?.CompleteAssetImage || !imageError?.CompleteAssetImage) && (
                    <>
                      
                      <Box display="flex" flexDirection="row" justifyContent="center" style={imageCard} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'CompleteAssetImage')}>
                        <span>
                          <img
                            onError={(e) => errorImage(e, 'CompleteAssetImage')}
                            src={Image}
                            style={{
                              width: 50,
                              height: 50,
                              marginLeft: 75,
                              marginTop: 10,
                            }}
                          />
                          <br />
                          <p style={{ marginTop: 10 }}> Drag your image, zip file here, </p>
                          <p style={{ marginLeft: 65 }}>or Browse</p>
                          <p
                            style={{
                              marginTop: 10,
                              fontSize: 10,
                              marginLeft: 38,
                              color: '#848181',
                            }}
                          >
                            Supports: JPG or PNG or ZIP
                          </p>
                        </span>
                      </Box>
                      <input type="file" id="CompleteAssetImage" name="CompleteAssetImage" accept=".png, .jpg, .jpeg, .zip" hidden onChange={onImageChange} />
                    </>
                  )}
                </label>
                {imagePreview?.CompleteAssetImage && imageError?.CompleteAssetImage && (
                  <>
                    <img
                      onError={(e) => errorImage(e, 'CompleteAssetImage')}
                      id="CompleteAssetImage"
                      src={imagePreview?.CompleteAssetImage}
                      style={{
                        width: '100%',
                        height: 150,
                        borderRadius: '4px',
                      }}
                      draggable="false"
                      onDragStart={(e) => e.preventDefault()}
                    />
                    <IoIosCloseCircleOutline className="closeIocns" onClick={() => removeImage('CompleteAssetImage')} />
                  </>
                )}
                {errorMsg?.CompleteAssetImage && <p className="form-error">{errorMsg?.CompleteAssetImage}</p>}
              </Grid>


            </Grid>

            {/* Asset image div start */}
            <Grid marginBottom="30px" container item spacing={5} justifyContent="start" alignSelf="center">

            </Grid>
          </div>)}
        </div>

        <Stack
          display="flex"
          flexDirection="row"
          justifyContent="center"
          sx={{ margin: "10px" }}
          style={{
            marginTop: "20px",
            position: "fixed",
            bottom: "5px",
            left: "55%"
          }}
        >
          {actionType === "add" && (
            <>
              <Tooltip title="CANCEL">
                <Button
                  variant="contained"
                  type="button"
                  size="small"
                  style={submit}
                  onClick={() => {handleCloseD();}}
                >
                  CANCEL
                </Button>
              </Tooltip>
              <Tooltip title="SUBMIT">
                <Button
                  variant="contained"
                  type="button"
                  size="small"
                  style={submit}
                  onClick={()=>{submitCourierDetails()}}
                >
                  SUBMIT
                </Button>
              </Tooltip>
            </>
          )}
          </Stack>
          <Stack
          display="flex"
          flexDirection="row"
          justifyContent="center"
          sx={{ margin: "10px" }}
          style={{
            marginTop: "20px",
            position: "fixed",
            bottom: "5px",
            left: "60%"
          }}
        >
          {actionType === "view" && (
            <Tooltip title="CANCEL">
              <Button
                variant="contained"
                type="button"
                size="small"
                style={submit}
                onClick={() => {handleCloseD();}}
                // sx={{marginLeft:"76px"}}
              >
                CANCEL
              </Button>
            </Tooltip>
          )}
        </Stack>
      </div>
    </>
  )
}

export default CapitalizedDrawerComponent