import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  DialogTitle,
  Tooltip,
  Grid,
  Box,
  TextField,
  Paper,
} from "@mui/material";
import { accordionTitle } from "shared/constants/CustomColor";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import pdf from "../../assets/icon/pdfImg.png";
import excel from "../../assets/icon/excel.png";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { widthCol } from "shared/constants/CustomColor";
import axios from "axios";
import MandateInfo from "pages/common-components/MandateInformation";
import { useUrlSearchParams } from "use-url-search-params";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "redux/store";
import moment from "moment";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchError, showMessage } from "redux/actions";
import staticImage from "../../assets/images/noPropertyFound.jpeg";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import FileNameDiaglogList from "pages/Mandate/DocumentUploadMandate/Components/Utility/Diaglogbox";
import { downloadFile } from "pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import DownloadIcon from "@mui/icons-material/Download";
import groupByDocumentData from "pages/Mandate/DocumentUploadMandate/Components/Utility/groupByDocumentData";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Image from "./Image.png";
import HistoryIcon from "@mui/icons-material/History";
import { makeStyles } from "@mui/styles";

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles({
  myTableHeadCell: {
    // Add your custom styles here
    backgroundColor: "lightblue",
    fontWeight: "bold",
    padding: "5px", // Change the padding value as needed
  },
  myTableCell: {
    padding: "5px",
  },
  myTableRemarkCell : {
    display: "table-cell",
    textAlign:"center",
    verticalAlign:"inherit"
    // flexDirection: 'row',
    // justifyContent: "center",
  },
});

const PropertyComparison = () => {
  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  const [tableData, setTableData] = useState<any>([]);
  const [open, setOpen] = React.useState(false);
  const [landlordOpen, setLandlordOpen] = React.useState(false);
  const [bussinessOpen, setBussinessOpen] = React.useState(false);
  const [docsOpen, setDocsOpen] = React.useState(false);
  const [mandateInfo, setMandateData] = React.useState(null);
  const [remarkOpen, setRemarkOpen] = React.useState(false);
  const navigate = useNavigate();
  const handleChangeAccordian =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  const location = useLocation();
  const apiType = location?.state?.apiType || "";
  const [userAction, setUserAction] = React.useState(null);
  const action = userAction?.action || "";
  const runtimeId = userAction?.runtimeId || 0;

  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [propertyData, setpropertyData] = useState([]);
  const [images, setImages] = useState([]);
  const [params] = useUrlSearchParams({}, {});
  const [mandateCode, setMandateCode] = useState<any>("");
  const [currentStatus, setCurrentStatus] = React.useState("");
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [refId, setRefId] = useState("");
  const { user } = useAuthUser();
  const { id } = useParams();
  const mandateId = window.location.pathname?.split("/")[3];
  const [pincode, setpincode] = useState("");
  const [ids, setId] = useState("");
  const [index, setIndex] = useState("");
  const [type, setType] = useState("");
  const [rejectCount, setRejectCount] = useState(0);
  const dispatch = useDispatch();
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [landlord, setLandlord] = useState("");
  const [bussiness, setBussiness] = useState("");
  const [Docs, setDocs] = useState("");
  const [nearByBusinessData, setNearByBusinessData] = useState<any>([]);
  const [PropertyFrontView, setPropertyFrontView] = useState<any>([]);
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const [docUploadHistory, setDocUploadHistory] = useState([]);
  const [lessorType, setLessorType] = useState<any>([]);
  const [nameOfOwnership, setnameOfOwnership] = useState([]);
  const [ageOfBuilding, setAgeOfBuilding] = useState([]);
  const [mottgageStatus, setMottgageStatus] = useState([]);
  const [openComp, setOpenComp] = React.useState(false);
  const [imagePreviewComp, setImagePreviewComp] = React.useState<any>([]);
  const [remark, setRemark] = React.useState("");
  const [remarkData, setRemarkData] = React.useState([]);
  const classes = useStyles();

  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );
  const getMasterData = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName`
      )
      .then((response: any) => {
        setLessorType(
          response?.data?.filter((v) => v?.masterName == "Lessor Type")
        );
        setnameOfOwnership(
          response?.data?.filter((v) => v?.masterName == "Nature of Ownership")
        );
        setAgeOfBuilding(
          response?.data?.filter((v) => v?.masterName == "Age of the Building")
        );
        setMottgageStatus(
          response?.data?.filter((v) => v?.masterName == "Mortgage Status")
        );
      })
      .catch((e: any) => {});
  };

  useEffect(() => {
    getMasterData();
  }, []);

  useEffect(() => {
    if (propertyData && propertyData?.length > 0) {
      propertyData &&
        propertyData?.map((item) => {
          return _getImage(
            item?.propertyImageDetailsId,
            "PropertyFrontView",
            "nolist"
          );
        });
    }
  }, [propertyData, setpropertyData]);

  const handleClickOpenRemark = (id) => {
    setRemarkOpen(true);
    var data = [...propertyData];
    const showRemarkData = data?.filter((item) => item?.id === id);

    setRemarkData(showRemarkData[0]?.pastRemarks);
  };

  const handleClickOpen = (id, i, type) => {
    var data = [...propertyData];
    if (user?.role && user?.role === "Business Associate" && type !== "1") {
      var numberOfPropApproved =
        data && data?.filter((item) => item?.mappingStatus === "Approve");
      if (
        numberOfPropApproved &&
        numberOfPropApproved?.length &&
        numberOfPropApproved?.length === 1
      ) {
        dispatch(fetchError("You can not approve more than one property"));
        setId(id);
        setIndex(i);
        setType(type);
        setOpen(false);
        return;
      }
    }
    setId(id);
    setIndex(i);
    setType(type);
    setOpen(true);
  };
  const handleClickOpenAccept = (id: string, i: string, type: string): void => {
    setId(id);
    setIndex(i);
    setType(type);
    setOpen(true);
  };

  let columnDefs = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      width: 90,
      minWidth: 90,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "landlord_full_name",
      headerName: "Full Name",
      headerTooltip: "Full Name",
      cellRenderer: (e: any) => {
        var data = e.data.landlord_full_name;
        return data || "";
      },
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "landlord_occupation",
      headerName: "Occupation ",
      headerTooltip: "Occupation",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.landlord_occupation;
        return data || "";
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "landlord_contact",
      headerName: "Primary No",
      headerTooltip: "Primary Number",
      resizable: true,
      width: 110,
      minWidth: 150,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (e: any) => {
        var data = e.data.landlord_contact;
        return data || "";
      },
    },
    {
      field: "landlord_alternate_contact",
      headerName: "Alternate No",
      headerTooltip: "Alternate Number",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.landlord_alternate_contact;
        return data || "";
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "landlord_present_add",
      headerName: "Present Address  ",
      headerTooltip: "Present Address",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.landlord_present_add;
        return data || "";
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "landlord_permanent_add",
      headerName: "Permanent Address ",
      headerTooltip: "Permanent Address",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.landlord_permanent_add;
        return data || "";
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "landlord_permanent_emailId",
      headerName: "Email Id ",
      headerTooltip: "Email Id",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.landlord_permanent_emailId;
        return data || "";
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "landlord_pan",
      headerName: "PAN Number",
      headerTooltip: "PAN Number",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.landlord_pan.toUpperCase();
        return data || "";
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "landlord_aadhar",
      headerName: "Aadhaar Number",
      headerTooltip: "Aadhaar Number",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.landlord_aadhar;
        return data || "";
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "lessor_Type",
      headerName: "Lessor Type",
      headerTooltip: "Lessor Type",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data?.lessor_Type;
        return lessorType?.find((v, i) => data == i + 1)?.formName || "";
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "rentToBePaid",
      headerName: "Rent to be paid",
      headerTooltip: "Rent to be paid",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data?.rentToBePaid ? "Yes" : "No";
        return data;
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "securityDeposite",
      headerName: "Security Deposit",
      headerTooltip: "Security Deposit",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data?.securityDeposite ? "Yes" : "No";
        return data;
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
  ];
  const getTitleForApproveButton = useCallback(() => {
    if (user?.role === "Project Manager") {
      return "Recommend";
    } else if (user?.role === "GEO Manager") {
      return "Validate Geo Details";
    }
    return "Approve";
  }, [user?.role]);

  const getTitleForApproveButtonDisabled = useCallback(() => {
    if (user?.role === "Project Manager") {
      return "Recommended";
    } else if (user?.role === "GEO Manager") {
      return "Validated Geo Details";
    }
    return "Approved";
  }, [user?.role]);

  const getTitle = (type: string): string => {
    if (type == "0") {
      return `Are you sure you want to ${getTitleForApproveButton()} this property?`;
    } else if (type === "1") {
      return "Are you sure you want to Reject this property?";
    } else if (type === "2") {
      return "Are you sure you want to Reject All Properties?";
    } else if (type === "3") {
      return "Are you sure you want to Accept All Properties?";
    } else {
      return "";
    }
  };
  const _saveProperyApporvalOrRejection = (e) => {
    e.preventDefault();
    var data = [...propertyData];
    var _approvedLength;
    if (propertyData && propertyData?.length === 0) {
      dispatch(fetchError("No Property data is found"));
      return;
    }
    if (remark == "") {
      dispatch(fetchError("Please enter the Remark"));
      return;
    }
    var numberOfPropApproved =
      data && data?.filter((item) => item?.mappingStatus === "Approve");
    if (numberOfPropApproved?.length === 0) {
      dispatch(fetchError("Approve at least one property"));
      return;
    }
    data =
      data &&
      data?.length > 0 &&
      data?.map((item) => {
        return {
          propertyID: item?.id || 0,
          status:
            (item?.mappingStatus
              ? item?.mappingStatus === "Assigned"
                ? "Reject"
                : item?.mappingStatus
              : "") || "",
          mandateId: mandateCode?.id || 0,
          remarks: remark || "",
        };
      });
    _approvedLength =
      data && data?.filter((item) => item?.status === "Approve");
    _approvedLength = (_approvedLength && _approvedLength?.length) || 0;
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/PropertyPool/UpdateAllPropertyComparisionStatus`,
        data
      )
      .then((response: any) => {
        if (!response) return;
        if (
          response &&
          response?.data?.data &&
          response?.data?.data?.length > 0
        ) {
          let status = "";
          status =
            _approvedLength && _approvedLength >= 1 ? "Approved" : "Rejected";
          workflowAPICall(status || "");
        } else {
          dispatch(fetchError("Property Operation failed"));
          return;
        }
      })
      .catch((e: any) => {});
  };

  const _generatePropertyData = (id, index) => {
    var data = [...propertyData];
    if (data === null) {
      dispatch(fetchError("Property Operation failed"));
      handleClose();
      return;
    }
    if (remark === "") {
      dispatch(fetchError("Please enter the Remark"));
      return;
    }
    data[index].mappingStatus = "Approve";
    setpropertyData(data);
    handleClose();
    dispatch(showMessage("Property Approved successfully!"));
  };

  const _generatePropertyRejectData = (id, index) => {
    var data = [...propertyData];
    if (data === null) {
      dispatch(fetchError("Property Operation failed"));
      handleClose();
      return;
    }
    data[index].mappingStatus = "Reject";
    setpropertyData(data);
    handleClose();
    dispatch(fetchError("Property Rejected successfully!"));
  };

  const defineActionForProperty = (
    type: string,
    id: string,
    index: string
  ): void => {
    if (type === "0") {
      _generatePropertyData(id, index);
    } else if (type === "1") {
      _generatePropertyRejectData(id, index);
    } else if (type === "2") {
      if (propertyData && propertyData?.length === 0) {
        dispatch(fetchError("No Property data is found"));
        return;
      }
      rejectAll();
    } else if (type === "3") {
      if (propertyData && propertyData?.length === 0) {
        dispatch(fetchError("No Property data is found"));
        return;
      }
      if (remark == "") {
        dispatch(fetchError("Please enter the Remark"));
        return;
      }
      ApproveAll();
    } else {
    }
  };
  const handleClickOpenLandlord = (id) => {
    setLandlordOpen(true);
    setLandlord(id);
  };
  const handleClickOpenBussiness = (id) => {
    setBussinessOpen(true);
    setBussiness(id);
  };
  const handleClickOpenDocs = (id, v) => {
    setDocsOpen(true);
    setDocs(id);
    setRefId(v?.basicrefid);
  };

  const handleClose = () => {
    setOpen(false);
    setLandlordOpen(false);
    setRemarkOpen(false);
  };

  const handleClose2 = () => {
    setBussiness(null);
    setBussinessOpen(false);
    setNearByBusinessData([]);
  };
  const handleClose3 = () => {
    setDocsOpen(false);
  };

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  React.useEffect(() => {
    if (id && id != "noid") {
      setMandateCode(id);
    }
  }, [id]);

  React.useEffect(() => {
    if (mandateCode && mandateCode?.id !== undefined) {
      const userAction =
        userActionList &&
        userActionList?.find(
          (item) =>
            item?.mandateId === parseInt(mandateCode?.id) &&
            item?.module === module
        );
      if (apiType === "") {
        setUserAction(userAction);
      } else {
        let action = mandateCode;
        setUserAction(action);
      }
      if (params.source === "list") {
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

  const getProperty = async (id) => {
    await axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/PropertyPool/GetPropertyPoolForComparision?MandateId=${
          mandateCode?.id || 0
        }`
      )
      .then((response: any) => {
        setpropertyData(response?.data || []);
      })
      .catch((e: any) => {});
  };

  const errorImage = useCallback(
    async (e, v: any) => {
      e.currentTarget.src = staticImage;
    },
    [propertyData]
  );
  const getNearByBusinessData = async (bussiness) => {
    await axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/PropertyLandlordDetails/GetPropertyBusinessDetailsById?Id=${
          bussiness || 0
        }`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data && response?.data?.length > 0)
          setNearByBusinessData(response?.data);
      })

      .catch((e) => {});
  };

  const imageCard1 = {
    height: "200px",
    width: "100%",
    backgroundColor: "#F8F8F8",
    borderRadius: 4,
    borderStyle: "dashed",
    borderWidth: "1px",
    borderColor: "#817F7F",
  };

  const _getImageViewMoreComp = (bid) => {
    var imageTypeList = [
      "CompetitorImage1",
      "CompetitorImage2",
      "CompetitorImage3",
      "CompetitorImage4",
    ];

    imageTypeList &&
      imageTypeList?.map((type) => {
        axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/PropertyLandlordDetails/RetriveImage?propBusinessId=${bid}&Type=${type}`
          )
          .then((response: any) => {
            if (response?.data?.base64String !== undefined) {
              setImagePreviewComp((state) => ({
                ...state,
                [type]: `data:image/png;base64,${response?.data?.base64String}`,
              }));
            } else {
              setImagePreviewComp((state) => ({
                ...state,
                [type]: null,
              }));
            }
          })
          .catch((e: any) => {});
      });
  };

  const getPropertyLandlordData = async (landlord) => {
    await axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/PropertyLandlordDetails/GetLandlordDetailsById?Id=${
          landlord || 0
        }`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data && response?.data?.length > 0)
          setTableData(response?.data);
      })

      .catch((e) => {});
  };
  React.useEffect(() => {
    if (landlord) {
      getPropertyLandlordData(landlord);
    }
  }, [landlord]);
  React.useEffect(() => {
    if (bussiness) {
      getNearByBusinessData(bussiness);
    }
  }, [bussiness]);

  React.useEffect(() => {
    if (mandateCode && mandateCode?.id !== undefined) {
      getProperty(mandateCode?.id);
    }
  }, [mandateCode?.id]);

  const _getImage = async (id: number, type: string, source: string) => {
    var _images = images;
    var _propertyFrontViewImages = PropertyFrontView;
    await axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/ImageStorage/RetriveImage?ImageId=${id || 0}&ImageType=${type}`
      )
      .then((response: any) => {
        if (response?.data?.base64String !== undefined) {
          if (source === "list") {
            _images.push(
              `data:image/png;base64,${response?.data?.base64String}`
            );
          } else {
            _propertyFrontViewImages.push({
              id: id,
              image: `data:image/png;base64,${response?.data?.base64String}`,
            });
          }
        } else {
          if (source === "list") {
            _images.push(staticImage);
          } else {
            _propertyFrontViewImages.push({
              id: id,
              image: staticImage,
            });
          }
        }
        setPropertyFrontView(_propertyFrontViewImages);
      })
      .catch((e: any) => {});
  };

  const _getImageViewMore = (id: number, type: string, source: string) => {
    var _images = [];
    var _propertyFrontViewImages = PropertyFrontView;
    return axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/ImageStorage/RetriveImage?ImageId=${id || 0}&ImageType=${type}`
      )
      .then((response: any) => {
        if (response?.data?.base64String !== undefined) {
          if (source === "list") {
            return `data:image/png;base64,${response?.data?.base64String}`;
            setImages((prevArray) => [
              ...prevArray,
              `data:image/png;base64,${response?.data?.base64String}`,
            ]);
          } else {
            _propertyFrontViewImages.push({
              id: id,
              image: `data:image/png;base64,${response?.data?.base64String}`,
            });
          }
        } else {
          if (source === "list") {
            return staticImage;
            setImages((prevArray) => [...prevArray, staticImage]);
          } else {
            _propertyFrontViewImages.push({
              id: id,
              image: staticImage,
            });
          }
        }
        setPropertyFrontView(_propertyFrontViewImages);
      })
      .catch((e: any) => {});
  };

  const onViewMore = (v: any) => {
    var imageTypeList = [
      "PropertyFrontView",
      "PropertyEntranceView",
      "InteriorFrontView",
      "InteriorRearView",
      "OfficeEntranceView",
      "Washroom01View",
      "Washroom02View",
      "PropertyLeftSideView",
      "PropertyRightSideView",
      "PropertyRearSideView",
      "PropertyOppositeView",
      "PropertyParkingImage",
    ];
    const promises =
      imageTypeList &&
      imageTypeList?.map((item) =>
        _getImageViewMore(v?.propertyImageDetailsId, item, "list")
      );

    Promise.all(promises)
      .then((results) => {
        setImages(results);
        setIsOpen(true);
      })
      .catch((error) => {});
  };
  const _getRuntimeId = (id) => {
    const userAction =
      userActionList &&
      userActionList?.find(
        (item) => item?.mandateId === parseInt(id) && item?.module === module
      );
    return userAction?.runtimeId || 0;
  };

  const workflowAPICall = (action) => {
    const body = {
      runtimeId: _getRuntimeId(mandateCode?.id) || 0,
      mandateId: mandateCode?.id || 0,
      tableId: mandateCode?.id || 0,
      remark: action === "Approved" ? "Approved" : "rejected" || "",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: action || "", // Approve or Rejected  , Created
    };

    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${
          body?.runtimeId
        }&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${
          body?.createdBy
        }&createdOn=${body.createdOn}&action=${body?.action}&remark=${
          body?.remark || ""
        }`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data === true) {
          dispatch(showMessage("Submitted Successfully!"));
          navigate("/list/task");
        } else {
          dispatch(fetchError("Property Task failed !"));
          return;
        }
      });
  };

  const propertyApproved = async (id: any, i: any) => {
    await axios
      .post(
        `${
          process.env.REACT_APP_BASEURL
        }/api/PropertyPool/UpdatePropertyPoolComparisionStatus?id=${ids}&status=Approve&MandateId=${
          mandateCode?.id || 0
        }`,
        {}
      )
      .then((response: any) => {
        getProperty(mandateCode?.id);
        workflowAPICall("Approved");
        handleClose();
        dispatch(showMessage("Property Approve successfully!"));
      })
      .catch((e: any) => {});
  };
  const propertyReject = async (id: any, i: any) => {
    await axios
      .post(
        `${
          process.env.REACT_APP_BASEURL
        }/api/PropertyPool/UpdatePropertyPoolComparisionStatus?id=${ids}&status=Reject&MandateId=${
          mandateCode?.id || 0
        }`,
        {}
      )
      .then((response: any) => {
        getProperty(mandateCode?.id);
        setRejectCount(rejectCount + 1);
        handleClose();
        dispatch(fetchError("Property Reject successfully!"));

        if (rejectCount + 1 == propertyData?.length) {
          navigate("/list/task");
          if (response) {
            workflowAPICall("Rejected");
          }
        }
      })
      .catch((e: any) => {});
  };

  const rejectAll = async () => {
    if (propertyData && propertyData?.length === 0) {
      dispatch(fetchError("No Property data is found"));
      return;
    }
    await axios
      .post(
        `${
          process.env.REACT_APP_BASEURL
        }/api/PropertyPool/UpdatePropertyPoolComparisionStatus?status=RejectAll&MandateId=${
          mandateCode?.id || 0
        }`,
        {}
      )
      .then((response: any) => {
        getProperty(mandateCode?.id);
        navigate("/list/task");
        handleClose();
        if (response) {
          workflowAPICall("Rejected");
        }
        setpropertyData(response?.data);
      })
      .catch((e: any) => {});
  };

  const ApproveAll = async () => {
    if (propertyData && propertyData?.length === 0) {
      dispatch(fetchError("No Property data is found"));
      return;
    }
    if (remark == "") {
      dispatch(fetchError("Please enter the Remark"));
      return;
    }
    await axios
      .post(
        `${
          process.env.REACT_APP_BASEURL
        }/api/PropertyPool/UpdatePropertyPoolComparisionStatus?status=ApproveAll&MandateId=${
          mandateCode?.id || 0
        }&Remarks=${remark}`,
        {}
      )
      .then((response: any) => {
        getProperty(mandateCode?.id);
        navigate("/list/task");
        handleClose();
        if (response) {
          workflowAPICall("Approved");
        }
        setpropertyData(response?.data);
      })
      .catch((e: any) => {});
  };

  const handleCloseComp = () => {
    setOpenComp(false);
    setImagePreviewComp([]);
  };
  let columnDefsNb = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      width: 70,
      minWidth: 70,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "",
      headerName: "Actions",
      headerTooltip: "Actions",
      sortable: false,
      resizable: false,
      pinned: "left",
      cellRenderer: (params: any) => (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginRight: "10px",
            }}
            className="actions"
          >
            <Tooltip title="View Image" className="actionsIcons">
              <VisibilityIcon
                style={{ fontSize: "15px" }}
                onClick={() => {
                  _getImageViewMoreComp(params?.data?.id);
                  setOpenComp(true);
                }}
                className="actionsIcons"
              />
            </Tooltip>
          </div>
        </>
      ),
      width: 100,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "nearby_outlet",
      headerName: "Any Nearby Business Outlets",
      headerTooltip: "Any Nearby Business Outlets",
      cellRenderer: (e: any) => {
        var data = e.data.nearby_outlet;
        return data || "";
      },
      sortable: true,
      resizable: true,
      width: 110,
      minWidth: 90,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "same_building",
      headerName: "Are they in same building",
      headerTooltip: "Are they in same building",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.same_building;
        return data || "";
      },
      width: 110,
      minWidth: 90,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "business_full_name",
      headerName: "Business Full Name",
      headerTooltip: "Business Full Name",
      resizable: true,
      width: 110,
      minWidth: 90,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (e: any) => {
        var data = e.data.business_full_name;
        return data || "";
      },
    },
    {
      field: "business_type",
      headerName: "Business Type",
      headerTooltip: "Business Type",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.business_type;
        return data || "";
      },
      width: 150,
      minWidth: 90,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "others_business_type",
      headerName: "Please specify the types of business",
      headerTooltip: "Please specify the types of business",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.others_business_type;
        return data || "";
      },
      width: 190,
      minWidth: 110,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "floor",
      headerName: "Floor",
      headerTooltip: "Floor",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.floor;
        return data || "";
      },
      width: 190,
      minWidth: 110,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "carpet_area",
      headerName: "Carpet Area",
      headerTooltip: "Carpet Area",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.carpet_area;
        return data || "";
      },
      width: 190,
      minWidth: 110,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "monthly_rent",
      headerName: "Monthly Rent",
      headerTooltip: "Monthly Rent",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.monthly_rent;
        return data || "";
      },
      width: 190,
      minWidth: 110,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "maintenance_amount",
      headerName: "Monthly Maintenance Amount",
      headerTooltip: "Monthly Maintenance Amount",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.maintenance_amount;
        return data || "";
      },
      width: 190,
      minWidth: 110,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "lease_period",
      headerName: "Lease Period(In Months)",
      headerTooltip: "Lease Period(In Months)",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.lease_period;
        return data || "";
      },
      width: 190,
      minWidth: 110,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "inception_month_year",
      headerName: "Inception Month & Year",
      headerTooltip: "Inception Month & Year",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.inception_month_year;
        return (
          (data &&
            moment(data).isValid() &&
            moment(data).format("DD/MM/YYYY")) ||
          ""
        );
      },
      width: 190,
      minWidth: 110,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "distance",
      headerName: "Distance from proposed location(In meters.)",
      headerTooltip: "Distance from proposed location(In meters.)",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.distance;
        return data || "";
      },
      width: 190,
      minWidth: 130,
      cellStyle: { fontSize: "13px" },
    },
  ];

  let columnDefsUpload = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Serial Number",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 80,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "filename",
      headerName: "File Name",
      headerTooltip: "File Name",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.filename;
        data = data?.split(".");
        data = data?.[0];
        return data || "";
      },
      width: 400,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      headerTooltip: "Created Date",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        return moment(e?.data?.createdDate).format("DD/MM/YYYY");
      },
      width: 150,
      minWidth: 130,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdDate",
      headerName: "Created Time",
      headerTooltip: "Created Time",
      cellRenderer: (e: any) => {
        return moment(e?.data?.createdDate).format("h:mm:ss A");
      },
      sortable: true,
      resizable: true,
      width: 150,
      minWidth: 130,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 130,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Download",
      headerName: "Download",
      headerTooltip: "Download",
      resizable: true,
      width: 110,
      minWidth: 90,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (obj: any) => (
        <>
          <div className="actions">
            <Tooltip title="Download" className="actionsIcons">
              <DownloadIcon
                style={{ fontSize: "15px" }}
                onClick={() => {
                  var mandate = { id: mandateCode?.id };
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
      field: "",
      headerName: "View",
      headerTooltip: "View",
      resizable: true,
      width: 110,
      minWidth: 90,
      cellStyle: { fontSize: "13px", textAlign: "center" },

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
    axios
      .get(
        `${
          process.env.REACT_APP_BASEURL
        }/api/ImageStorage/GetDocUploadHistory?mandateid=${
          mandateCode?.id || 0
        }&documentType=Property Documents&recordId=${refId || 0}`
      )
      .then((response: any) => {
        if (!response) {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data && response?.data && response?.data?.length > 0) {
          var data = groupByDocumentData(response?.data, "versionNumber");
          setDocUploadHistory(data || []);
        }
        if (response && response?.data?.length === 0) {
          setDocUploadHistory([]);
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
  };

  React.useEffect(() => {
    if (
      mandateCode &&
      mandateCode?.id != "noid" &&
      mandateCode?.id !== undefined
    ) {
      getVersionHistoryData();
    }
  }, [mandateCode, refId]);

  const truncateRemarkText = (text) => {
    const words = text.split(' ');
  
    if (words.length > 5) {
      const truncatedText = words.slice(0, 5).join(' ');
      return `${truncatedText} ...`;
    }
  
    return text;
  };

  return (
    <>
      <div
        className="card-panal"
        style={{ border: "1px solid rgba(0, 0, 0, 0.12)" }}
      >
        <MandateInfo
          mandateCode={mandateCode}
          source="property-comparision"
          pageType=""
          redirectSource={`${params?.source}`}
          setMandateCode={setMandateCode}
          setMandateData={setMandateData}
          setpincode={setpincode}
          setCurrentStatus={setCurrentStatus}
          setCurrentRemark={setCurrentRemark}
        />
      </div>
      <form>
        <div
          className={`profile-comparison profile ${
            propertyData?.length > 3 ? "inside-scroll-313" : "inside-scroll-261"
          }`}
        >
          <TableContainer>
            <Table
              sx={{ minWidth: 650, marginBottom: 0, tableLayout: "fixed" }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow className="table-row">
                  <TableCell
                    className="table-cell"
                    align="left"
                    style={widthCol}
                  ></TableCell>
                  {propertyData &&
                    propertyData?.length > 0 &&
                    propertyData?.map((v: any, i: any) => (
                      <TableCell align="center" className="table-cell">
                        {" "}
                        <div style={{ margin: "5px" }}>
                          <span
                            className={
                              v.mappingStatus === "Reject"
                                ? "property-reject"
                                : v.mappingStatus == "Approve"
                                ? "property-approve"
                                : "property-normal"
                            }
                          >
                            Option {i + 1}
                          </span>
                        </div>
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>

          <Accordion
            defaultExpanded={true}
            expanded={expanded === "panel1"}
            onChange={handleChangeAccordian("panel1")}
          >
            <AccordionSummary
              aria-controls="panel1d-content"
              id="panel1d-header"
            >
              <Typography style={accordionTitle}>
                PROPERTY GEO DETAILS
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                sx={{
                  minWidth: 650,
                  tableLayout: "fixed",
                }}
                aria-label="simple table"
              >
                <TableBody>
                  <TableRow
                    style={widthCol}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      Name of building/Complex
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.nameOfTheBuilding}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Premises address
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.premisesAddress}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Floor Number
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.floorNumberInBuilding === 1
                          ? "Basement"
                          : v?.floorNumberInBuilding === 2
                          ? "Ground Floor"
                          : v?.floorNumberInBuilding === 3
                          ? "1st Floor"
                          : v?.floorNumberInBuilding === 4
                          ? "2nd Floor"
                          : v?.floorNumberInBuilding === 6
                          ? "4th Floor"
                          : v?.floorNumberInBuilding === 7
                          ? "5th Floor"
                          : v?.floorNumberInBuilding === 8
                          ? "6th Floor"
                          : v?.floorNumberInBuilding === 9
                          ? "7th Floor"
                          : v?.floorNumberInBuilding === 10
                          ? "8th Floor"
                          : v?.floorNumberInBuilding === 11
                          ? "9th Floor"
                          : v?.floorNumberInBuilding === 12
                          ? "10th Floor"
                          : v?.floorNumberInBuilding === 13
                          ? "11th Floor"
                          : v?.floorNumberInBuilding === 14
                          ? "12th Floor"
                          : v?.floorNumberInBuilding === 15
                          ? "13th Floor"
                          : v?.floorNumberInBuilding === 16
                          ? "14th Floor"
                          : v?.floorNumberInBuilding === 17
                          ? "15th Floor"
                          : v?.floorNumberInBuilding === 18
                          ? "16th Floor"
                          : v?.floorNumberInBuilding === 19
                          ? "17th Floor"
                          : v?.floorNumberInBuilding === 20
                          ? "18th Floor"
                          : v?.floorNumberInBuilding === 21
                          ? "19th Floor"
                          : v?.floorNumberInBuilding === 22
                          ? "20th Floor"
                          : v?.floorNumberInBuilding === 23
                          ? "21st Floor"
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      City
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.city}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      District
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.disctrict}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      State
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.state}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Country
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.country}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Property Status
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.propertyStatus == 1
                          ? "Ready to Move"
                          : v?.propertyStatus == 2
                          ? "Under Construction"
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Distance from bus stand (In Meters)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.premiseDistanceFromBST}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Distance from railway station (In Meters)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.premiseDistanceFromRST}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Wine shop with geo tag
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.shopPresenceWithGeoTag}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Nature of Ownership
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {nameOfOwnership?.find(
                          (k, i) => v?.ownership_Nature == i + 1
                        )?.formName || ""}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Age of the Building(in Years)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {ageOfBuilding?.find(
                          (k, i) => v?.age_Of_building == i + 1
                        )?.formName || ""}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Mortgage Status
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {mottgageStatus?.find(
                          (k, i) => v?.mortgage_Status == i + 1
                        )?.formName || ""}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Name of Bank/Financial Institution
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.bank_Finance_Institution === "null"
                          ? ""
                          : v?.bank_Finance_Institution || ""}
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Remarks
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.propertyGeoDetails_Status}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Competitors Available
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.nearByBusinessAvailable === true ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
          <Accordion
            defaultExpanded={true}
            expanded={expanded === "panel9"}
            onChange={handleChangeAccordian("panel9")}
          >
            <AccordionSummary
              aria-controls="panel9d-content"
              id="panel9d-header"
            >
              <Typography style={accordionTitle}>Competitors</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                sx={{ minWidth: 650, tableLayout: "fixed" }}
                aria-label="simple table"
                style={{ tableLayout: "fixed" }}
              >
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      style={widthCol}
                    ></TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          onClick={() => handleClickOpenBussiness(v.id)}
                          style={{
                            padding: "2px 20px",
                            borderRadius: 6,
                            color: "#00316a",
                            borderColor: "#00316a",
                          }}
                        >
                          View Competitors
                        </Button>
                        <Dialog
                          fullWidth
                          maxWidth="xl"
                          open={bussinessOpen}
                          onClose={handleClose2}
                          aria-labelledby="alert-dialog-title"
                          aria-describedby="alert-dialog-description"
                        >
                          <DialogTitle
                            id="alert-dialog-title"
                            style={{
                              paddingRight: 20,
                              fontSize: 16,
                              color: "#000",
                            }}
                          >
                            {"Competitors"}
                          </DialogTitle>
                          <DialogContent>
                            <div style={{ height: "calc(100vh - 260px)" }}>
                              <CommonGrid
                                defaultColDef={{ flex: 1 }}
                                columnDefs={columnDefsNb}
                                rowData={nearByBusinessData || []}
                                onGridReady={onGridReady}
                                gridRef={gridRef}
                                pagination={false}
                                paginationPageSize={null}
                              />
                            </div>
                          </DialogContent>

                          <DialogActions style={{ justifyContent: "center" }}>
                            <Button className="no-btn" onClick={handleClose2}>
                              Close
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
              <div></div>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel2"}
            onChange={handleChangeAccordian("panel2")}
          >
            <AccordionSummary
              aria-controls="panel2d-content"
              id="panel2d-header"
            >
              <Typography style={accordionTitle}>COMMERCIAL</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                sx={{ minWidth: 650, tableLayout: "fixed" }}
                aria-label="simple table"
              >
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Rate per month
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.rpm}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      TDS deduction % @ rent/month
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.tdsDeductionRPM}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      GST Applicable
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.isGSTApplicable ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      GST Number
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.gstNo}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      GST Deduction % @ rent/month
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.gstDeductionRPM}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Security Deposit Amount
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.securityDepositAmount}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    style={widthCol}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Maintenance charges
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.maintenanceCharges}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Total fixed expenses per month(Inc Taxes)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.totalFixedExpensesPerMonth}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      Property taxes
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.propertyTaxes}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Rent free period(in days)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.rentFreePeriod}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Rent escalation freq.(In years)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.rentEscelationFrequency}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Rent escalation (%)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.rentEscalation}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Remarks
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.commercial_Status}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel3"}
            onChange={handleChangeAccordian("panel3")}
          >
            <AccordionSummary
              aria-controls="panel3d-content"
              id="panel3d-header"
            >
              <Typography style={accordionTitle}>INFRA REQUIREMENT</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                sx={{ minWidth: 650, tableLayout: "fixed" }}
                aria-label="simple table"
                style={{ tableLayout: "fixed" }}
              >
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Permission ava. on terrace for 2 ant.(30 ft.)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.permissionOnTerraceForTwoAntennas ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Space for signage
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.spaceForSignage ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Main Glow Sign Board (Stand. Size 20 x 4 ft.)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.mainGlowSignBoard ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Side Board - (Standard Size 10 x 4 ft.)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.sideBoard ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Ticker Board - (Standard Size 20 x 1 ft.)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.tickerBoard ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    style={widthCol}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Lollypop / Flange Board - (Stand. Size 2 Nos)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.flangeBoard ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Branding in Staircase
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.brandingInStaircase ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      Direction Board - 2 Nos
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.directionBoard ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      RCC Strong room to be build by
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.rccStrongRoomBuildBy == "1"
                          ? "BFL"
                          : v?.rccStrongRoomBuildBy == "2"
                          ? "Landlord"
                          : v?.rccStrongRoomBuildBy == "3"
                          ? "Borne By Both Parties"
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      RCC Strong room build comments
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.rccStrongRoomBuildComments}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      BFL Share %
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.rcc_bfl_share}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Landlord Share %
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.rcc_landlord_share}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Remarks
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.infraRequirement_Status}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel4"}
            onChange={handleChangeAccordian("panel4")}
          >
            <AccordionSummary
              aria-controls="panel4d-content"
              id="panel4d-header"
            >
              <Typography style={accordionTitle}>
                PROPERTY INFRA DETAILS
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                sx={{ minWidth: 650, tableLayout: "fixed" }}
                aria-label="simple table"
                style={{ tableLayout: "fixed" }}
              >
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Premise / Floor sanction :
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.floorSanction === 1
                          ? "Commercial"
                          : v?.floorSanction === 2
                          ? "Residential"
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Total constructed Floor Area in SqFt
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.totalConstructedFloorAreaInSFT}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Total Carpet Area in SqFt
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.totalCarpetAreaInSFT}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Chargeable Area in SqFt
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.chargeableAreaInSFT}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Landlord to provide Verified Flooring
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.landlordProvideVetrifiedFlooring ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Current Branch Entrance Type
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.currentBranchEntranceType == "1"
                          ? "Not Yet Installed"
                          : v?.currentBranchEntranceType == "2"
                          ? "Installed"
                          : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    style={widthCol}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Door Type to be provided by Landlord
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.grilledDoorProvidedByLandlord == "1"
                          ? "Shutter Door"
                          : v?.grilledDoorProvidedByLandlord == "2"
                          ? "Collapsible Grill Gate"
                          : v?.grilledDoorProvidedByLandlord == "3"
                          ? "Both"
                          : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Ventilation available in Branch
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.ventilationAvailableInBranch ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      Grilled Windows in Office Area
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.grilledWindowsInOfficeArea ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Grilled Window Count(in Office Area)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.grilledWindowCountForOfficeArea}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Grilled Window Note(in Office Area)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.grilledWindowNoteForOfficeArea}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Ventilation in Washroom Area
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.ventilationInWashroomArea ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Grilled Windows in Washroom Area
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.grilledWindowsInWashroomArea ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Grilled Window Count(in Washroom Area)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.grilledWindowCountForWashroomArea}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Grilled Window Note(in Washroom Area)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.grilledWindowNoteForWashroomArea}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Space for AC outdoor units
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.spaceForACOutdoorUnits ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Space for DG Set
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.spaceForDGSet ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Premise Accessibility (24*7)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.premiseAccessability ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Premise Accessibility (24*7) not available Reason
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.premiseAccessabilityNotAvailableReason}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Parking Availability
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.parkingAvailability ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Parking Type
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.parkingType === 1
                          ? "Dedicated Parking"
                          : v?.parkingType === 2
                          ? "Common Parking"
                          : v?.parkingType === 3
                          ? "Road Side Parking"
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Number of Car Parking Available
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.numberOfCarParkingAvailable}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Number of Bike Parking Available
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.numberOfBikeParkingAvailable}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Remarks
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.propertyInfraDetails_Status}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
          <Accordion
            defaultExpanded={true}
            expanded={expanded === "panel5"}
            onChange={handleChangeAccordian("panel5")}
          >
            <AccordionSummary
              aria-controls="panel5d-content"
              id="panel5d-header"
            >
              <Typography style={accordionTitle}>LEASSOR DETAILS</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                sx={{ minWidth: 650, tableLayout: "fixed" }}
                aria-label="simple table"
                style={{ tableLayout: "fixed" }}
              >
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      style={widthCol}
                    ></TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          onClick={() => handleClickOpenLandlord(v.id)}
                          style={{
                            padding: "2px 20px",
                            borderRadius: 6,
                            color: "#00316a",
                            borderColor: "#00316a",
                          }}
                        >
                          View Landlord
                        </Button>
                        <Dialog
                          fullWidth
                          maxWidth="xl"
                          open={landlordOpen}
                          onClose={handleClose}
                          aria-labelledby="alert-dialog-title"
                          aria-describedby="alert-dialog-description"
                        >
                          <DialogTitle
                            id="alert-dialog-title"
                            style={{
                              paddingRight: 20,
                              fontSize: 16,
                              color: "#000",
                            }}
                          >
                            {"Landlord Details"}
                          </DialogTitle>
                          <DialogContent>
                            <div style={{ height: "calc(100vh - 260px)" }}>
                              <CommonGrid
                                defaultColDef={{ flex: 1 }}
                                columnDefs={columnDefs}
                                rowData={tableData || []}
                                onGridReady={onGridReady}
                                gridRef={gridRef}
                                pagination={false}
                                paginationPageSize={null}
                              />
                            </div>
                          </DialogContent>
                          <DialogActions style={{ justifyContent: "center" }}>
                            <Button className="no-btn" onClick={handleClose}>
                              Close
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
              <div></div>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel6"}
            onChange={handleChangeAccordian("panel6")}
          >
            <AccordionSummary
              aria-controls="panel6d-content"
              id="panel6d-header"
            >
              <Typography style={accordionTitle}>LEGAL</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                sx={{ minWidth: 650, tableLayout: "fixed" }}
                aria-label="simple table"
                style={{ tableLayout: "fixed" }}
              >
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Agreement Registration Applicability
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.agreementRegistrationApplicability ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Agreement Duration (In Years)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.agreementDuration}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Lock in for premise owner (In Years)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.lockInForPremiseOwner}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Lock in for BFL
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.isLockInForBFL ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Lock in for BFL (In Years)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.lockInForBFL}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Agreement registration charges born by
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.agreementRegistrationChargesBornBy === 1
                          ? "BFL"
                          : v?.agreementRegistrationChargesBornBy === 2
                          ? "Landlord"
                          : v?.agreementRegistrationChargesBornBy === 3
                          ? "To be born by both"
                          : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    style={widthCol}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      BFL Share %
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.bflShare}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Landlord Share %
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.landlordShare}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Remarks
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.legal_Status}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel7"}
            onChange={handleChangeAccordian("panel7")}
          >
            <AccordionSummary
              aria-controls="panel7d-content"
              id="panel7d-header"
            >
              <Typography style={accordionTitle}>UTILITY</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                sx={{ minWidth: 650, tableLayout: "fixed" }}
                aria-label="simple table"
                style={{ tableLayout: "fixed" }}
              >
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Electricity Connection Availability
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.electricityConnectionAvailablity ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Electricity Power Load (In KVA)
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.electricityPowerLoad}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Electricity Connection Born By
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.electricityConnectionBornBy}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Water Supply Availability
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.waterSupplyAvailability == "true"
                          ? "24x7"
                          : "Fixed Time"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Water Supply From Timings
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.selectWaterSupplyTimings
                          ? moment(v?.selectWaterSupplyTimings)?.format(
                              "DD-MM-YYYY HH:mm:ss"
                            )
                          : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Water Supply To Timings
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.selectWaterSupplyTimingsToTime
                          ? moment(v?.selectWaterSupplyTimingsToTime)?.format(
                              "DD-MM-YYYY HH:mm:ss"
                            )
                          : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Sink with Tiles Available in Pantry Area
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.sinkInPantryArea ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    style={widthCol}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Washroom Availability
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.washroomAvailablity ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Washroom Type
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.washroomType == "1"
                          ? "Dedicated"
                          : v?.washroomType == "2"
                          ? "Common"
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Washroom Available Count
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.washroomAvailableCount}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Male Washroom Count
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.maleWashroomCount}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Female Washroom Count
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.femaleWashroomCount}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Urinals Available in Male Washroom
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.urinalsAvailableInMaleWashroom === "1"
                          ? "Yes"
                          : v?.urinalsAvailableInMaleWashroom === "2"
                          ? "No"
                          : v?.urinalsAvailableInMaleWashroom === "3"
                          ? "Not Applicable"
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Urinals Count in Male Washroom
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.urinalsCountInMaleWashroom}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Toilet Seat Type in Male Washroom
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.toiletSeatTypeInMaleWashroom}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Toilet Seat Count in Male Washroom
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.toiletSeatCountInMaleWashroom}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Toilet Seat Count in Female Washroom
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.toiletSeatCountInFemaleWashroom}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Wash Basin Available inside Washrooms
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.washBasinAvailableInsideWashrooms ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Doors, Lock and Key Available in Washrooms
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        {v?.doorsLockKeyAvailableInwashrooms ? "Yes" : "No"}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={widthCol}>
                      Remarks
                    </TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">{v?.utility_Status}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
          <Accordion
            defaultExpanded={true}
            expanded={expanded === "panel10"}
            onChange={handleChangeAccordian("panel10")}
          >
            <AccordionSummary
              aria-controls="panel10d-content"
              id="panel10d-header"
            >
              <Typography style={accordionTitle}>
                PROPERTY ADDITIONAL DOCUMENTS
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                sx={{ minWidth: 650, tableLayout: "fixed" }}
                aria-label="simple table"
                style={{ tableLayout: "fixed" }}
              >
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      style={widthCol}
                    ></TableCell>
                    {propertyData?.map((v) => (
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          onClick={() => handleClickOpenDocs(v.id, v)}
                          style={{
                            padding: "2px 20px",
                            borderRadius: 6,
                            color: "#00316a",
                            borderColor: "#00316a",
                          }}
                        >
                          View Additional Documents
                        </Button>
                        <Dialog
                          fullWidth
                          maxWidth="xl"
                          open={docsOpen}
                          onClose={handleClose3}
                          aria-labelledby="alert-dialog-title"
                          aria-describedby="alert-dialog-description"
                        >
                          <DialogTitle
                            id="alert-dialog-title"
                            style={{
                              paddingRight: 20,
                              fontSize: 16,
                              color: "#000",
                            }}
                          >
                            {"PROPERTY ADDITIONAL DOCUMENTS"}
                          </DialogTitle>
                          <DialogContent>
                            <div style={{ height: "calc(100vh - 260px)" }}>
                              <CommonGrid
                                defaultColDef={{ flex: 1 }}
                                columnDefs={columnDefsUpload}
                                rowData={docUploadHistory || []}
                                onGridReady={onGridReady}
                                gridRef={gridRef}
                                pagination={false}
                                paginationPageSize={null}
                              />
                            </div>
                          </DialogContent>
                          <DialogActions style={{ justifyContent: "center" }}>
                            <Button className="no-btn" onClick={handleClose3}>
                              Close
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
              <div></div>
            </AccordionDetails>
          </Accordion>
          <Accordion
            className="profileImageDetails"
            expanded={expanded === "panel8"}
            onChange={handleChangeAccordian("panel8")}
            sx={{ padding: "0px !important" }}
          >
            <AccordionSummary
              aria-controls="panel8d-content"
              id="panel8d-header"
              className="profileImageDetails"
            >
              <Typography style={accordionTitle}>
                PROPERTY IMAGE DETAILS
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                sx={{ minWidth: 650, tableLayout: "fixed" }}
                aria-label="simple table"
                style={{ tableLayout: "fixed" }}
                className="profileImageDetails"
              >
                <TableBody>
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    className="profileImageDetails"
                  >
                    <TableCell
                      className="profileImageDetails"
                      align="center"
                      style={widthCol}
                    ></TableCell>
                    {propertyData &&
                      propertyData?.length > 0 &&
                      propertyData?.map((v) => (
                        <TableCell align="center">
                          <img
                            onError={(e) => errorImage(e, "PropertyFrontView")}
                            src={
                              (PropertyFrontView &&
                                PropertyFrontView?.length > 0 &&
                                PropertyFrontView?.find(
                                  (item) =>
                                    item?.id === v?.propertyImageDetailsId
                                )?.image) ||
                              staticImage
                            }
                            height="100px"
                            width="200px"
                            alt=""
                          />
                          <br />
                          <Button
                            variant="outlined"
                            size="medium"
                            style={{
                              padding: "2px 20px",
                              borderRadius: 6,
                              color: "#00316a",
                              borderColor: "#00316a",
                            }}
                            onClick={() => onViewMore(v)}
                          >
                            {" "}
                            View More
                          </Button>
                        </TableCell>
                      ))}
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
          <div className="mob bottom-button" style={{ marginBottom: "40px" }}>
            
            <Table
              sx={{ minWidth: 650, tableLayout: "fixed" }}
              aria-label="simple table"
              style={{ tableLayout: "fixed", borderTop: "1px solid #0000001f" }}
            >
              <TableBody>
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center" style={{fontWeight : 'bold'}} className="hide-mob">Remark</TableCell>
                  {propertyData &&
                    propertyData?.map((v: any, i: any) => (
                      <TableCell align="center" className={classes.myTableRemarkCell}>
                        
                        {v?.remarks == null ? v?.remarks : truncateRemarkText(v?.remarks) }
                        {v?.pastRemarks != null ?
                        <Tooltip title="Remark History">
                          <HistoryIcon
                            onClick={() => handleClickOpenRemark(v?.id)}
                          />
                        </Tooltip>
                        : ""
                        }
                      </TableCell>
                    ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mob bottom-button">
            <Table
              sx={{ minWidth: 650, tableLayout: "fixed" }}
              aria-label="simple table"
              style={{ tableLayout: "fixed", borderTop: "1px solid #0000001f" }}
            >
              <TableBody>
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center" className="hide-mob"></TableCell>
                  {propertyData &&
                    propertyData?.map((v: any, i: any) => (
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="medium"
                          onClick={() => handleClickOpen(v?.id, i, "0")}
                          style={{
                            padding: "2px 5px",
                            borderRadius: 6,
                            fontSize: 12,
                            color: "#fff",
                            borderColor:
                              v?.mappingStatus === "Approve" ? "" : "#00316a",
                            minWidth: "100px",
                            marginRight: "5px",
                            backgroundColor:
                              v?.mappingStatus === "Approve"
                                ? "gray"
                                : "#00316a",
                          }}
                          disabled={v?.mappingStatus === "Approve"}
                        >
                          {v?.mappingStatus === "Approve"
                            ? getTitleForApproveButtonDisabled()
                            : getTitleForApproveButton()}
                        </Button>
                        {propertyData?.length > 3 && (
                          <>
                            <br />
                            <br />
                          </>
                        )}
                        <Button
                          variant="outlined"
                          size="medium"
                          disabled={v?.mappingStatus === "Reject"}
                          onClick={() => handleClickOpen(v?.id, i, "1")}
                          style={{
                            fontSize: 12,
                            padding: "2px 5px",
                            borderRadius: 6,
                            borderColor:
                              v?.mappingStatus === "Reject"
                                ? "#fff"
                                : "#00316a",
                            minWidth: "100px",
                            color: "#fff",
                            marginRight: "5px",
                            backgroundColor:
                              v?.mappingStatus === "Reject"
                                ? "gray"
                                : "#00316a",
                          }}
                        >
                          {v?.mappingStatus === "Reject"
                            ? "Rejected"
                            : "Reject"}
                        </Button>
                      </TableCell>
                    ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
          {userAction?.module === module && (
            <>
              {action !== "" && action === "View" && (
                <div className="bottom-fix-btn">
                  {userAction?.stdmsg !== undefined && (
                    <span className="message-right-bottom">
                      {userAction?.stdmsg}
                    </span>
                  )}
                </div>
              )}

              {action !== "" && action === "Approve" && (
                <div className="bottom-fix-btn">
                  <Button
                    variant="outlined"
                    size="medium"
                    style={{
                      padding: "2px 20px",
                      fontSize: 12,
                      borderRadius: 6,
                      color: "#00316a",
                      borderColor: "#00316a",
                    }}
                  >
                    <img src={pdf} alt="" className="icon-size" /> Download
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    style={{
                      marginLeft: 10,
                      fontSize: 12,
                      padding: "2px 20px",
                      borderRadius: 6,
                      color: "#00316a",
                      borderColor: "#00316a",
                    }}
                  >
                    <img src={excel} alt="" className="icon-size" /> Download
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={() => {
                      if (propertyData && propertyData?.length === 0) {
                        dispatch(fetchError("No Property data is found"));
                        return;
                      }
                      handleClickOpenAccept("", "", "2");
                    }}
                    style={{
                      marginLeft: 10,
                      fontSize: 12,
                      padding: "2px 20px",
                      borderRadius: 6,
                      color: "#00316a",
                      borderColor: "#00316a",
                    }}
                  >
                    Reject All
                  </Button>
                  {user?.role && user?.role !== "Business Associate" && (
                    <Button
                      variant="outlined"
                      size="medium"
                      onClick={() => {
                        if (propertyData && propertyData?.length === 0) {
                          dispatch(fetchError("No Property data is found"));
                          return;
                        }
                        handleClickOpenAccept("", "", "3");
                      }}
                      style={{
                        marginLeft: 10,
                        fontSize: 12,
                        padding: "2px 20px",
                        borderRadius: 6,
                        color: "#00316a",
                        borderColor: "#00316a",
                      }}
                    >
                      {`${getTitleForApproveButton()} All`}
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={(e) => {
                      _saveProperyApporvalOrRejection(e);
                    }}
                    style={{
                      marginLeft: 10,
                      fontSize: 12,
                      padding: "2px 20px",
                      borderRadius: 6,
                      color: "#fff",
                      borderColor: "#00316a",
                      backgroundColor: "#00316a",
                    }}
                  >
                    Submit
                  </Button>
                  {userAction?.stdmsg !== undefined && (
                    <span className="message-right-bottom">
                      {userAction?.stdmsg}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </form>
      {isOpen && (
        <Lightbox
          imageLoadErrorMessage={
            <img src={staticImage} height="400" width="500" />
          }
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => {
            setIsOpen(false);
            setImages([]);
            setPhotoIndex(0);
          }}
          onMovePrevRequest={() =>
            setPhotoIndex((photoIndex + images.length - 1) % images.length)
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % images.length)
          }
        />
      )}
      <Dialog
        className="dialog-wrap-remarks"
        open={remarkOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        style={{ maxWidth: "1200px" }}
      >
        <DialogContent>
          <DialogContentText
            id="alert-dialog-slide-description"
            style={{ marginBottom: "5px" }}
          >
            List of Remark
          </DialogContentText>
          <Paper>
            <Table
              sx={{ minWidth: 750, tableLayout: "fixed" }}
              aria-label="simple table"
              style={{ tableLayout: "fixed", border: "1px solid #0000001f" }}
            >
              <TableHead>
                <TableRow>
                  {/* {propertyData &&
                    propertyData?.map((v: any, i: any) => (
                      <TableCell align="left"> {"User Name : Remarks" }</TableCell> ))} */}
                  {/* Add more TableCell components for additional columns */}
                  <TableCell align="left" className={classes.myTableHeadCell}>
                    User Name
                  </TableCell>
                  <TableCell align="left" className={classes.myTableHeadCell}>
                    Role Name
                  </TableCell>
                  <TableCell align="left" className={classes.myTableHeadCell}>
                    Remarks
                  </TableCell>
                  <TableCell align="left" className={classes.myTableHeadCell}>
                    Action On
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {remarkData &&
                  remarkData?.map((v: any, i: any) => (
                    <TableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      style={{ padding: "5px" }}
                    >
                      <TableCell
                        key={i}
                        align="left"
                        className={classes.myTableCell}
                      >
                        {v?.userName}{" "}
                      </TableCell>
                      <TableCell
                        key={i}
                        align="left"
                        className={classes.myTableCell}
                      >
                        {v?.roleName}{" "}
                      </TableCell>
                      <TableCell
                        key={i}
                        align="left"
                        className={classes.myTableCell}
                      >
                        {v?.remarks}
                      </TableCell>
                      <TableCell
                        key={i}
                        align="left"
                        className={classes.myTableCell}
                      >
                        {moment(v?.actionOn).format("DD/MM/YYYY , hh:mm:ss a")}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>
        </DialogContent>

        <DialogActions className="button-wrap">
          <Button className="no-btn" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        className="dialog-wrap"
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {getTitle(type)}
          </DialogContentText>
          <Grid item xs={6} md={3} sx={{ position: "relative" }}>
            <div className="input-form">
              <h2 className="phaseLable required">Remarks</h2>
              <textarea
                // autoComplete="off"
                name="remark"
                id="remark"
                // variant="outlined"
                // size="small"
                className="w-85 bor-rad-10 height-create pad-cre textarea_create"
                value={remark}
                onChange={(e: any) => {
                  setRemark(e?.target?.value);
                }}
                maxLength={2500}
                // onPaste={(e: any) => {
                //   if (!textFieldValidationOnPaste(e)) {
                //     dispatch(fetchError("You can not paste Spacial characters"))
                //   }
                // }}
                // onKeyDown={(e: any) => {
                //   if (e.target.selectionStart === 0 && e.code === "Space") {
                //     e.preventDefault();
                //   }
                //   regExpressionTextField(e)
                // }}

                // onBlur={handleBlur}
              />
            </div>
          </Grid>
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button
            className="no-btn"
            onClick={() => {
              handleClose();
              setRemark("");
            }}
          >
            Cancel
          </Button>
          <Button
            className="yes-btn"
            onClick={() => defineActionForProperty(type, id, index)}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openComp}
        onClose={handleCloseComp}
        aria-describedby="alert-dialog-slide-description"
        maxWidth="lg"
        PaperProps={{ style: { borderRadius: "20px" } }}
      >
        <form>
          <DialogTitle id="alert-dialog-title" className="title-model">
            View Competitors Image
          </DialogTitle>
          <DialogContent style={{ width: "1200px" }}>
            <Grid
              marginBottom="0px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Competitor Image 1 :
                  </Typography>
                  <label htmlFor="CompetitorImage1" className="">
                    {!imagePreviewComp?.CompetitorImage1 && (
                      <>
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          style={imageCard1}
                        >
                          <span style={{ marginTop: "40px" }}>
                            <img
                              onError={(e) => errorImage(e, "CompetitorImage1")}
                              src={Image}
                              style={{
                                width: 50,
                                height: 50,
                                marginLeft: 45,
                                marginTop: 10,
                              }}
                            />
                            <br />
                            <p style={{ marginTop: 10 }}>
                              {" "}
                              No Image Available{" "}
                            </p>
                          </span>
                        </Box>
                      </>
                    )}
                  </label>
                  {imagePreviewComp?.CompetitorImage1 && (
                    <>
                      <img
                        onError={(e) => errorImage(e, "CompetitorImage1")}
                        src={imagePreviewComp?.CompetitorImage1}
                        style={{
                          width: "100%",
                          height: "200px",
                          borderRadius: "4px",
                        }}
                      />
                    </>
                  )}
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Competitor Image 2 :
                  </Typography>
                  <label htmlFor="CompetitorImage2" className="">
                    {!imagePreviewComp?.CompetitorImage2 && (
                      <>
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          style={imageCard1}
                        >
                          <span style={{ marginTop: "40px" }}>
                            <img
                              onError={(e) => errorImage(e, "CompetitorImage2")}
                              src={Image}
                              style={{
                                width: 50,
                                height: 50,
                                marginLeft: 45,
                                marginTop: 10,
                              }}
                            />
                            <br />
                            <p style={{ marginTop: 10 }}>
                              {" "}
                              No Image Available{" "}
                            </p>
                          </span>
                        </Box>
                      </>
                    )}
                  </label>
                  {imagePreviewComp?.CompetitorImage2 && (
                    <>
                      <img
                        onError={(e) => errorImage(e, "CompetitorImage2")}
                        src={imagePreviewComp?.CompetitorImage2}
                        style={{
                          width: "100%",
                          height: "200px",
                          borderRadius: "4px",
                        }}
                      />
                    </>
                  )}
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Competitor Image 3 :
                  </Typography>
                  <label htmlFor="CompetitorImage3" className="">
                    {!imagePreviewComp?.CompetitorImage3 && (
                      <>
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          style={imageCard1}
                        >
                          <span style={{ marginTop: "40px" }}>
                            <img
                              onError={(e) => errorImage(e, "CompetitorImage3")}
                              src={Image}
                              style={{
                                width: 50,
                                height: 50,
                                marginLeft: 45,
                                marginTop: 10,
                              }}
                            />
                            <br />
                            <p style={{ marginTop: 10 }}>
                              {" "}
                              No Image Available{" "}
                            </p>
                          </span>
                        </Box>
                      </>
                    )}
                  </label>
                  {imagePreviewComp?.CompetitorImage3 && (
                    <>
                      <img
                        onError={(e) => errorImage(e, "CompetitorImage3")}
                        src={imagePreviewComp?.CompetitorImage3}
                        style={{
                          width: "100%",
                          height: "200px",
                          borderRadius: "4px",
                        }}
                      />
                    </>
                  )}
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Competitor Image 4 :
                  </Typography>
                  <label htmlFor="CompetitorImage4" className="">
                    {!imagePreviewComp?.CompetitorImage4 && (
                      <>
                        <Box
                          display="flex"
                          flexDirection="row"
                          justifyContent="center"
                          style={imageCard1}
                        >
                          <span style={{ marginTop: "40px" }}>
                            <img
                              onError={(e) => errorImage(e, "CompetitorImage4")}
                              src={Image}
                              style={{
                                width: 50,
                                height: 50,
                                marginLeft: 45,
                                marginTop: 10,
                              }}
                            />
                            <br />
                            <p style={{ marginTop: 10 }}>
                              {" "}
                              No Image Available{" "}
                            </p>
                          </span>
                        </Box>
                      </>
                    )}
                  </label>
                  {imagePreviewComp?.CompetitorImage4 && (
                    <>
                      <img
                        onError={(e) => errorImage(e, "CompetitorImage4")}
                        src={imagePreviewComp?.CompetitorImage4}
                        style={{
                          width: "100%",
                          height: "200px",
                          borderRadius: "4px",
                        }}
                      />
                    </>
                  )}
                </div>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions className="button-wrap">
            <Button className="no-btn" onClick={handleCloseComp}>
              Close
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default PropertyComparison;
