import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Tooltip, Typography } from "@mui/material";
import "./style.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CommonGrid from "@uikit/AgGrid/Grid/CommonGrid";
import { AgGridReact } from "ag-grid-react";
import moment from "moment";
import { useDispatch } from "react-redux";
import FileNameDiaglogList from "../DocumentUploadMandate/Components/Utility/Diaglogbox";
import DownloadIcon from "@mui/icons-material/Download";
import groupByDocumentData from "../DocumentUploadMandate/Components/Utility/groupByDocumentData";
import { fetchError } from "redux/actions";
import { downloadFile } from "../DocumentUploadMandate/Components/Utility/FileUploadUtilty";
import VisibilityIcon from '@mui/icons-material/Visibility';


const FinalPropertyReadOnly = () => {
  const navigate = useNavigate();
  const [propertyImages, setPropertyImages] = useState([]);
  const [readOnlyData, setReadOnlyData] = useState<any>({});
  const [isFinal, setisFinal] = useState<any>("");
  const [tableData, setTableData] = useState<any>([]);
  const [nearByBusinessData, setNearByBusinessData] = useState<any>([]);
  const { id } = useParams();
  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [bussinessData, setBussinessData] = useState([]);
  const [imagePreview, setImagePreview] = React.useState<any>({});
  const gridRef3 = React.useRef<AgGridReact>(null);
  const [docUploadHistory, setDocUploadHistory] = useState([]);
  const [docRecordId, setDocRecordId] = React.useState(0);
  const [lessorType, setLessorType] = useState<any>([])
  const [nameOfOwnership, setnameOfOwnership] = useState([])
  const [ageOfBuilding, setAgeOfBuilding] = useState([])
  const [mottgageStatus, setMottgageStatus] = useState([])
  const [gridApiDU, setGridApiUpload] = React.useState(null);
  const [gridColumnApiDU, setGridColumnApiUpload] = React.useState(null);
  const dispatch = useDispatch();
  const [openComp, setOpenComp] = React.useState(false);
  const [imagePreviewComp, setImagePreviewComp] = React.useState<any>([]);

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
      .catch((e: any) => {
      });
  };

  useEffect(() => {
    getMasterData();
  }, []);

  const getVersionHistoryData = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/ImageStorage/GetDocUploadHistory?mandateid=${id || 0
        }&documentType=Property Documents&recordId=${readOnlyData?.basicrefid || 0}`
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
    getVersionHistoryData();
  }, [bussinessData]);

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
      minWidth: 50,
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
      minWidth: 120,
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
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "landlord_contact",
      headerName: "Primary No.",
      headerTooltip: "Primary Number.",
      resizable: true,
      width: 110,
      minWidth: 110,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (e: any) => {
        var data = e.data.landlord_contact;
        return data || "";
      },
    },
    {
      field: "landlord_alternate_contact",
      headerName: "Alternate No.",
      headerTooltip: "Alternate Number.",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.landlord_alternate_contact;
        return data || "";
      },
      width: 190,
      minWidth: 110,
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
      minWidth: 130,
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
      headerName: "Email Id",
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
        return data
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "securityDeposite",
      headerName: "Security Deposite",
      headerTooltip: "Security Deposite",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data?.securityDeposite ? "Yes" : "No";
        return data
      },
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "landlord_aadhar",
      headerName: "Aadhaar Number ",
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
    
  ];

 
  const _getImageViewMore = (id: number, type: string, source: string) => {
    var _images = [];
    return axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/ImageStorage/RetriveImage?ImageId=${id || 0}&ImageType=${type}`
      )
      .then((response: any) => {
        if (response?.data?.base64String !== undefined) {
          if (source === "list") {
            setImagePreview((state) => ({
              ...state,
              [type]: `data:image/png;base64,${response?.data?.base64String}`,
            }));
          } else {
            setImagePreview((state) => ({
              ...state,
              [type]: `data:image/png;base64,${response?.data?.base64String}`,
            }));
          }
        } else {
          if (source === "list") {
            setImagePreview((state) => ({
              ...state,
              [type]: null,
            }));
          } else {
            setImagePreview((state) => ({
              ...state,
              [type]: null,
            }));
          }
        }

      })
      .catch((e: any) => { });
  };

  const _getImage = async (id: number, type: string) => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/ImageStorage/RetriveImage?ImageId=${id || 0}&ImageType=${type}`
      )
      .then((response: any) => {
        if (response?.data?.base64String !== undefined) {
          setImagePreview((state) => ({
            ...state,
            [type]: `data:image/png;base64,${response?.data?.base64String}`,
          }));
        } else {
          setImagePreview((state) => ({
            ...state,
            [type]: null,
          }));
        }
      })
      .catch((e: any) => { });
  };

  React.useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/PropertyPool/GetFinalProperty?mandateid=${id}`
      )
      .then(async (response: any) => {
        setReadOnlyData(response?.data?.length > 0 ? response?.data?.[0] : {});
        if (response?.data?.length > 0) {
          setisFinal(response.data[0]?.id);
        }
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
  

        const promises = imageTypeList &&
          imageTypeList?.map(item => _getImageViewMore(readOnlyData?.propertyImageDetailsId, item, "list"));

        Promise.all(promises)
          .then(results => {
           
          })
          .catch(error => {
          });
        axios
          .get(
            `${process.env.REACT_APP_BASEURL}/api/PropertyLandlordDetails/GetPropertyBusinessDetailsById?Id=${response.data[0]?.id}`
          )
          .then(async (response: any) => {
            setBussinessData(response?.data);
          })
          .catch((e) => { });
      })
      .catch((e) => { });
  }, [isFinal]);

  function onGridReady(params) {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    gridRef.current!.api.sizeColumnsToFit();
  }

  const getPropertyLandlordData = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/PropertyLandlordDetails/GetLandlordDetailsById?Id=${isFinal || 0}`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data && response?.data?.length > 0)
          setTableData(response?.data);
      })

      .catch((e) => { });
  };
  const getNearByBusinessData = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL
        }/api/PropertyLandlordDetails/GetPropertyBusinessDetailsById?Id=${isFinal || 0
        }`
      )
      .then((response: any) => {
        if (!response) return;
        if (response && response?.data && response?.data?.length > 0)
          setNearByBusinessData(response?.data);
      })

      .catch((e) => { });
  };

  const getHeightForTable = useCallback(() => {
    var height = 0;
    var dataLength = (bussinessData && bussinessData?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [bussinessData]);

  const getHeightForTable2 = useCallback(() => {
    var height = 0;
    var dataLength = (tableData && tableData?.length) || 0;
    if (dataLength === 0) return "0px";
    height = 45 * dataLength + 57;

    if (height > 0 && dataLength <= 4) return `${height}px`;
    return "200px";
  }, [tableData]);

  React.useEffect(() => {
    getPropertyLandlordData();
    getNearByBusinessData();
  }, [isFinal]);

  const errorImage = useCallback(
    async (e, v: any) => {
      e.currentTarget.src =
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cHJvcGVydHl8ZW58MHx8MHx8&w=1000&q=80";
    },
    [readOnlyData]
  );

  const _getImageViewMoreComp = (bid) => {
    var imageTypeList = [
      "CompetitorImage1",
      "CompetitorImage2",
      "CompetitorImage3",
      "CompetitorImage4",
    ];
    
    imageTypeList && imageTypeList?.map(type => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/PropertyLandlordDetails/RetriveImage?propBusinessId=${bid}&Type=${type}`)
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
      .catch((e: any) => { });
    })
  };

  let columnDefsNb = [
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
                <VisibilityIcon style={{ fontSize: "15px" }} onClick={()=>{ _getImageViewMoreComp(params?.data?.id); setOpenComp(true)}} className="actionsIcons"/>
            </Tooltip>
          </div>
        </>
      ),
      width: 100,
      minWidth : 100,
      cellStyle: { fontSize: "13px" },
    },
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
      minWidth: 60,
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
      width: 130,
      minWidth: 100,
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
      width: 190,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },

    {
      field: "business_full_name",
      headerName: "Business Full Name",
      headerTooltip: "Business Full Name",
      resizable: true,
      width: 130,
      minWidth: 100,
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
      width: 190,
      minWidth: 100,
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
      minWidth: 100,
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
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "carpet_area",
      headerName: "Carpet Area",
      headerTooltip: "carpet_area",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.carpet_area;
        return data || "";
      },
      width: 190,
      minWidth: 100,
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
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "maintenance_amount",
      headerName: "Monthly Maintenace Amount",
      headerTooltip: "Monthly Maintenace Amount",
      sortable: true,
      resizable: true,
      cellRenderer: (e: any) => {
        var data = e.data.maintenance_amount;
        return data || "";
      },
      width: 190,
      minWidth: 100,
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
      minWidth: 100,
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
      minWidth: 100,
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
      minWidth: 90,
      cellStyle: { fontSize: "13px" },
    },
  ];
  function onGridReady3(params) {
    setGridApiUpload(params.api);
    setGridColumnApiUpload(params.columnApi);
    gridRef3.current!.api.sizeColumnsToFit();
  }

  let columnDefsUpload = [
    {
      field: "srno",
      headerName: "Sr. No",
      headerTooltip: "Sr. No",
      cellRenderer: (e: any) => {
        var index = e?.rowIndex;
        return index + 1;
      },

      sortable: true,
      resizable: true,
      width: 80,
      minWidth: 70,
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
      minWidth: 100,
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
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "createdBy",
      headerName: "Created By",
      headerTooltip: "Created By",
      sortable: true,
      resizable: true,
      width: 190,
      minWidth: 150,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Download",
      headerName: "Download",
      headerTooltip: "Download",
      resizable: true,
      width: 110,
      minWidth: 100,
      cellStyle: { fontSize: "13px", textAlign: "center" },

      cellRenderer: (obj: any) => (
        <>
          <div className="actions">
            <Tooltip title="Download" className="actionsIcons">
              <DownloadIcon
                style={{ fontSize: "15px" }}
                onClick={() => {
                  var mandate = { id: id };
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
      minWidth: 100,
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

  const handleCloseComp = () => {
    setOpenComp(false);
    setImagePreviewComp([]);
  }
  return (
    <>
      {isFinal ? (
        <>
          <div className="section">
            <Typography className="section-heading">COMMERCIAL</Typography>
            <Grid
              marginBottom="0px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Rent per month :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.rpm}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    TDS deduction % @ rent/month :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.tdsDeductionRPM}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    GST Applicable :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.isGSTApplicable ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    GST Number :
                  </Typography>
                  <Typography className="property-value">{readOnlyData?.gstNo}</Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    GST Deduction % @ rent/month :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.gstDeductionRPM}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Security Deposit Amount :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.securityDepositAmount}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Maintenance charges :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.maintenanceCharges}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Total fixed expenses per month(Inc Taxes) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.totalFixedExpensesPerMonth}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Property taxes :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.propertyTaxes}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Rent free period(in days) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.rentFreePeriod}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Rent escalation freq.(In years) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.rentEscelationFrequency}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Rent escalation (%) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.rentEscalation}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label"> Remark :</Typography>
                  <Typography className="property-value">
                    {readOnlyData?.commercial_Status}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>

          <div className="section">
            <Typography className="section-heading">
              PROPERTY GEO DETAILS
            </Typography>
            <Grid
              marginBottom="0px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Name of building/complex :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.nameOfTheBuilding}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Floor number :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.floorNumberInBuilding === 1
                      ? "Basement"
                      : readOnlyData?.floorNumberInBuilding === 2
                        ? "Ground Floor"
                        : readOnlyData?.floorNumberInBuilding === 3
                          ? "1st Floor"
                          : readOnlyData?.floorNumberInBuilding === 4
                            ? "2nd Floor"
                            : readOnlyData?.floorNumberInBuilding === 6
                              ? "4th Floor"
                              : readOnlyData?.floorNumberInBuilding === 7
                                ? "5th Floor"
                                : readOnlyData?.floorNumberInBuilding === 8
                                  ? "6th Floor"
                                  : readOnlyData?.floorNumberInBuilding === 9
                                    ? "7th Floor"
                                    : readOnlyData?.floorNumberInBuilding === 10
                                      ? "8th Floor"
                                      : readOnlyData?.floorNumberInBuilding === 11
                                        ? "9th Floor"
                                        : readOnlyData?.floorNumberInBuilding === 12
                                          ? "10th Floor"
                                          : readOnlyData?.floorNumberInBuilding === 13
                                            ? "11th Floor"
                                            : readOnlyData?.floorNumberInBuilding === 14
                                              ? "12th Floor"
                                              : readOnlyData?.floorNumberInBuilding === 15
                                                ? "13th Floor"
                                                : readOnlyData?.floorNumberInBuilding === 16
                                                  ? "14th Floor"
                                                  : readOnlyData?.floorNumberInBuilding === 17
                                                    ? "15th Floor"
                                                    : readOnlyData?.floorNumberInBuilding === 18
                                                      ? "16th Floor"
                                                      : readOnlyData?.floorNumberInBuilding === 19
                                                        ? "17th Floor"
                                                        : readOnlyData?.floorNumberInBuilding === 20
                                                          ? "18th Floor"
                                                          : readOnlyData?.floorNumberInBuilding === 21
                                                            ? "19th Floor"
                                                            : readOnlyData?.floorNumberInBuilding === 22
                                                              ? "20th Floor"
                                                              : ""}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Premises address :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.premisesAddress}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Pin code :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.pinCode}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label"> City :</Typography>
                  <Typography className="property-value">
                    {readOnlyData?.city}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">District :</Typography>
                  <Typography className="property-value">
                    {readOnlyData?.disctrict}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label"> State :</Typography>
                  <Typography className="property-value">
                    {readOnlyData?.state}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label"> Country :</Typography>
                  <Typography className="property-value">
                    {readOnlyData?.country}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Property Status :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.propertyStatus == 1
                      ? "Ready to Move"
                      : readOnlyData?.propertyStatus == 2
                        ? "Under Construction"
                      : readOnlyData?.propertyStatus == 3
                      ? "Ready to position"  : ""}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Distance from bus stand (In Meters) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.premiseDistanceFromBST}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Distance from railway station (In Meters) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.premiseDistanceFromRST}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Wine bar/shop presence with geo tag :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.shopPresenceWithGeoTag}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Nature of Ownership :
                  </Typography>
                  <Typography className="property-value">
                    {nameOfOwnership?.find((v, i) => readOnlyData?.ownership_Nature == i + 1)?.formName || ""}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Age of the Building :
                  </Typography>
                  <Typography className="property-value">
                    {ageOfBuilding?.find((v, i) => readOnlyData?.age_Of_building == i + 1)?.formName || ""}

                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Mortgage Status :
                  </Typography>
                  <Typography className="property-value">
                    {mottgageStatus?.find((v, i) => readOnlyData?.mortgage_Status == i + 1)?.formName || ""}

                  </Typography>
                </div>
              </Grid>
              {readOnlyData?.mortgage_Status == "1" && <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Name of Bank/Financial Institution :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.bank_Finance_Institution || ""}
                  </Typography>
                </div>
              </Grid>}

              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label"> Remark :</Typography>
                  <Typography className="property-value">
                    {readOnlyData?.propertyGeoDetails_Status}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Competitors Available :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.nearByBusinessAvailable === true
                      ? "Yes"
                      : "No"}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>
          <div className="section">
            <Typography className="section-heading">Competitors</Typography>
            <Grid
            >
              {readOnlyData?.nearByBusinessAvailable === true ? (
                <div
                  style={{
                    height: getHeightForTable(),
                    marginTop: "10px",
                  }}
                >
                  <CommonGrid
                    defaultColDef={{ flex: 1 }}
                    columnDefs={columnDefsNb}
                    rowData={bussinessData || []}
                    onGridReady={onGridReady}
                    gridRef={gridRef}
                    pagination={false}
                    paginationPageSize={null}
                  />
                </div>
              ) : (
                ""
              )}
            </Grid>
          </div>
          <div className="section">
            <Typography className="section-heading">
              INFRA REQUIREMENT
            </Typography>
            <Grid
              marginBottom="0px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Perm. ava. on terrace for two ant.(30ft.) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.permissionOnTerraceForTwoAntennas
                      ? "Yes"
                      : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Space for signage :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.spaceForSignage ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Main Glow Sign Board (St. Size 20 x 4 ft.) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.mainGlowSignBoard ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Side Board - (Standard Size 10 x 4 ft.) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.sideBoard ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Ticker Board - (St. Size 20 x 1 ft.) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.tickerBoard ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Lollypop/Flange Board - (St. Size 2 Nos) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.flangeBoard ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Branding in Staircase :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.brandingInStaircase ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Direction Board - 2 Nos :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.directionBoard ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    RCC Strong room to be build by :
                  </Typography>
                  <Typography className="property-value">
                    {/* {readOnlyData?.rccStrongRoomBuildBy} */}
                    {readOnlyData?.rccStrongRoomBuildBy == "1"
                    ? "BFL"
                    : readOnlyData?.rccStrongRoomBuildBy == "2"
                    ? "Landlord"
                    : readOnlyData?.rccStrongRoomBuildBy == "3" ? "Borne By Both Parties" : ""}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    BFL Share % :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.rcc_bfl_share}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Landlord Share % :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.rcc_landlord_share}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    RCC Strong room build Comments :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.rccStrongRoomBuildComments}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label"> Remark :</Typography>
                  <Typography className="property-value">
                    {readOnlyData?.infraRequirement_Status}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>
          <div className="section">
            <Typography className="section-heading">
              PROPERTY INFRA DETAILS
            </Typography>
            <Grid
              marginBottom="0px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Premise / Floor sanction :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.floorSanction === 1 ? "Commercial"
                      : readOnlyData?.floorSanction === 2 ? "Residential" : ""}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Total constructed Floor Area in SFT :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.totalConstructedFloorAreaInSFT}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Total Carpet area in SFT :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.totalCarpetAreaInSFT}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Chargeable area in SFT :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.chargeableAreaInSFT}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Landlord to provide Verified Flooring :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.landlordProvideVetrifiedFlooring
                      ? "Yes"
                      : "NO"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Current Branch Entrance type :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.currentBranchEntranceType == "1"
                      ? "Not yet installed"
                      : ""}
                      {/* : "installed"} */}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Door Type to be provided by Landlord :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.grilledDoorProvidedByLandlord == "1" ? "Shutter Door"
                      : readOnlyData?.grilledDoorProvidedByLandlord == "2" ? "Collapsible Grilled Gate"
                        : readOnlyData?.grilledDoorProvidedByLandlord == "3" ? "Both" : ""}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Ventilation ava. in branch :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.ventilationAvailableInBranch ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Grilled Windows in office area :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.grilledWindowsInOfficeArea ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Grilled Window Count(in Office Area) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.grilledWindowCountForOfficeArea}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Grilled Window Note(in Office Area) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.grilledWindowNoteForOfficeArea}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Ventilation in Washroom Area :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.ventilationInWashroomArea ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Grilled Windows in Washroom area :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.grilledWindowsInWashroomArea ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Grilled Window Count(in Washroom Area) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.grilledWindowCountForWashroomArea}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Grilled Window Note(in Washroom Area) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.grilledWindowNoteForWashroomArea}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Space for AC outdoor units :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.spaceForACOutdoorUnits ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Space for DG Set :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.spaceForDGSet ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Premise Accessibility (24*7) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.premiseAccessability ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Premise Access. (24*7) not ava. Reason :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.premiseAccessabilityNotAvailableReason}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Parking Availability :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.parkingAvailability ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Parking Type :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.parkingType === 1 ? "Dedicated Parking"
                      : readOnlyData?.parkingType === 2 ? "Common Parking"
                        : readOnlyData?.parkingType === 3 ? "Road Side Parking" : ""}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Number of Car parking available :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.numberOfCarParkingAvailable}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    {" "}
                    Number of Bike parking available :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.numberOfBikeParkingAvailable}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label"> Remark :</Typography>
                  <Typography className="property-value">
                    {readOnlyData?.propertyInfraDetails_Status}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>
          <div className="section">
            <Typography className="section-heading">LEASSOR DETAILS</Typography>
            <Grid
            >
              <div
                style={{
                 
                  height: getHeightForTable2(),

                  marginTop: "10px",
                }}
              >
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
            </Grid>
          </div>
          <div className="section">
            <Typography className="section-heading">LEGAL</Typography>
            <Grid
              marginBottom="0px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Agreement Reg. Applicability :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.agreementRegistrationApplicability
                      ? "Yes"
                      : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Agreement Duration (In Years) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.agreementDuration}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Lock In for premise owner (In Years) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.lockInForPremiseOwner}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Lock in for BFL :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.isLockInForBFL ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Lock in for BFL (In Years) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.lockInForBFL}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Agreement reg. charges born by :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.agreementRegistrationChargesBornBy === 1 ? "BFL"
                      : readOnlyData?.agreementRegistrationChargesBornBy === 2 ? "Landlord"
                        : readOnlyData?.agreementRegistrationChargesBornBy === 3 ? "To be born by both" : ""}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    BFL Share % :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.bflShare}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Landlord Share % :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.landlordShare}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">Remark :</Typography>
                  <Typography className="property-value">
                    {readOnlyData?.legal_Status}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>
          <div className="section">
            <Typography className="section-heading">
              PROPERTY IMAGE DETAILS
            </Typography>
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
                    Building/Property front View :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "PropertyFrontView")}
                      src={imagePreview?.PropertyFrontView}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Building/Property Entrance View :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "PropertyEntranceView")}
                      src={imagePreview?.PropertyEntranceView}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Interior front view :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "InteriorFrontView")}
                      src={imagePreview?.InteriorFrontView}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Interior rear view :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "InteriorRearView")}
                      src={imagePreview?.InteriorRearView}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Office Entrance View :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "OfficeEntranceView")}
                      src={imagePreview?.OfficeEntranceView}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Washroom 01 View :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "Washroom01View")}
                      src={imagePreview?.Washroom01View}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Washroom 02 View :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "Washroom02View")}
                      src={imagePreview?.Washroom02View}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Building/Property Left side View :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "PropertyLeftSideView")}
                      src={imagePreview?.PropertyLeftSideView}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Building/Property Right side View :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "PropertyRightSideView")}
                      src={imagePreview?.PropertyRightSideView}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Building/Property Rear side View :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "PropertyRearSideView")}
                      src={imagePreview?.PropertyRearSideView}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Building/Property Opp. side View :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "PropertyOppositeView")}
                      src={imagePreview?.PropertyOppositeView}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                    Building/Property Parking Image :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "PropertyParkingImage")}
                      src={imagePreview?.PropertyParkingImage}
                    />
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>
          <div className="section">
            <Typography className="section-heading">UTILITY</Typography>
            <Grid
              marginBottom="0px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Electricity connection Availability :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.electricityConnectionAvailablity
                      ? "Yes"
                      : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Electricity Power Load (In KVA) :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.electricityPowerLoad}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Electricity Connection Born By :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.electricityConnectionBornBy}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Water Supply Availability :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.waterSupplyAvailability == "true"
                      ? "24x7"
                      : "Fixed Time"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Water Supply From Timings :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.selectWaterSupplyTimings}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Water Supply To Timings :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.selectWaterSupplyTimingsToTime}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Sink with tiles Ava. in Pantry Area :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.sinkInPantryArea ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Washroom Availability :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.washroomAvailablity ? "Yes" : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Washroom Type :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.washroomType == "1" ? "Dedicate"
                      : readOnlyData?.washroomType == "2" ? "Common" : ""}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Washroom Available Count :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.washroomAvailableCount}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Male Washroom Count :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.maleWashroomCount}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Female Washroom Count :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.femaleWashroomCount}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Urinals Ava. in Male Washroom :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.urinalsAvailableInMaleWashroom == "1" ? "Yes"
                      : readOnlyData?.urinalsAvailableInMaleWashroom == "2" ? "No"
                        : readOnlyData?.urinalsAvailableInMaleWashroom == "3" ? "Not Applicable" : ""}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Urinals count In Male Washroom :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.urinalsCountInMaleWashroom}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Toilet Seat Type In Male Washroom :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.toiletSeatTypeInMaleWashroom}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Toilet Seat count In Male Washroom :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.toiletSeatCountInMaleWashroom}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Toilet Seat count In Female Washroom :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.toiletSeatCountInFemaleWashroom}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Wash Basin Ava. inside Washrooms :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.washBasinAvailableInsideWashrooms
                      ? "Yes"
                      : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">
                    Doors, Lock and Key Ava. in Washrooms :
                  </Typography>
                  <Typography className="property-value">
                    {readOnlyData?.doorsLockKeyAvailableInwashrooms
                      ? "Yes"
                      : "No"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div style={{ display: "flex" }}>
                  <Typography className="property-label">Remark :</Typography>
                  <Typography className="property-value">
                    {readOnlyData?.utility_Status}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </div>
          <div className="section">
            <Typography className="section-heading">
              PROPERTY ADDITIONAL DOCUMENTS
            </Typography>
            <div
              style={{
                height: getHeightForTable(),
                marginTop: "10px",
              }}
            >
              <CommonGrid
                defaultColDef={{ flex: 1 }}
                columnDefs={columnDefsUpload}
                rowData={docUploadHistory || []}
                onGridReady={onGridReady3}
                gridRef={gridRef3}
                pagination={false}
                paginationPageSize={null}
              />
            </div>
          </div>

          <Dialog
          open={openComp}
          onClose={handleCloseComp}
          aria-describedby="alert-dialog-slide-description"
          maxWidth="lg"
          PaperProps={{ style: { borderRadius: '20px', }, }}
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
                    Competitors Image 1 :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "CompetitorImage1")}
                      src={imagePreviewComp?.CompetitorImage1}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                  Competitors Image 2 :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "CompetitorImage2")}
                      src={imagePreviewComp?.CompetitorImage2}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                  Competitors Image 3 :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "CompetitorImage3")}
                      src={imagePreviewComp?.CompetitorImage3}
                    />
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6} md={4} lg={3} sx={{ position: "relative" }}>
                <div>
                  <Typography className="property-label">
                  Competitors Image 4 :
                  </Typography>
                  <Typography className="property-value">
                    <img
                      style={{ height: "200px", width: "100%" }}
                      onError={(e) => errorImage(e, "CompetitorImage4")}
                      src={imagePreviewComp?.CompetitorImage4}
                    />
                  </Typography>
                </div>
              </Grid>
            </Grid>
            </DialogContent>
            <DialogActions className="button-wrap">
              <Button className="no-btn" onClick={handleCloseComp}>Close</Button>
            </DialogActions>
            </form>
          </Dialog>
        </>
      ) : (
        <Typography
          style={{ display: "grid", placeItems: "center", height: "50vh" }}
        >
          No Final Property Found
        </Typography>
      )}
    </>
  );
};

export default FinalPropertyReadOnly;
