// import React from 'react'
import { SwipeableDrawer, Box, Button, Grid, InputAdornment, Stack, TextField, Tooltip } from '@mui/material';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react'
import { TbPencil, TbPlus } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { fetchError, showMessage, showWarning } from 'redux/actions';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
// import DrawerComponent from "./DrawerComponent";
import CapitalizedDrawerComponent from './CapitalizedDrawerComponent';
import CapitalizedPage from './CapitalizedPage';
import { downloadTemplate, downloadFile, fileValidation, _validationMaxFileSizeUpload } from 'pages/Mandate/DocumentUploadMandate/Components/Utility/FileUploadUtilty';
import { useAuthUser } from '@uikit/utility/AuthHooks';
// import AssetCodeDrawer from './AssetInsuranceDrawer';
import AssetCodeDrawer from './AssetCodeDrawer';
import AssetCodeTaggingDrawer from './AssetCodeTaggingDrawer';

const MAX_COUNT = 8;
const NewCapitalizedAssetDetails = () => {
  const [assetRequestData, setAssetRequestData] = useState([]);
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerActionType, setDrawerActionType] = useState(null);
  const fileInput = React.useRef(null);
  const [fileLimit, setFileLimit] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileLength, setFileLength] = React.useState(0);
  const { user } = useAuthUser();
  const [AssetData,setAssetData] = useState([]);
  const [openDrawerAssetCode, setOpenDrawerAssetCode] = React.useState(false);
  const [assetDrawerData, setAssetDrawerData]= React.useState(null);
  const [assetId, setAssetId] = React.useState<any>("");
  const [assetNumber, setAssetNumber] = React.useState<any>("");
  const handleOpenDrawer = () => {
    setOpenDrawer(true);
  };
  const childRef = useRef();
  const [docType, setDocType] = React.useState(null);
  const [documentTypeList, setDocumentTypeList] = React.useState([]);

  const getDocumentTypeList = () => {
    axios
        .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=DocumentMaster`)
        .then((response: any) => {
            if (!response) return;
            if (response && response?.data && response?.data?.data && response?.data?.data?.length > 0) {
                setDocumentTypeList(response?.data?.data);
            }
        })
        .catch((e: any) => {
            dispatch(fetchError('Error Occurred !'));
        });
  };
  useEffect(() => {
    getDocumentTypeList();
  }, []);

  useEffect(() => {
      if (documentTypeList && documentTypeList?.length > 0) {
          var obj = documentTypeList && documentTypeList.find((item) => item?.documentName === 'Asset Tagging');
          setDocType(obj || null);
      }
  }, [documentTypeList]);

  const handleOpenDrawerPlus = () => {
    setOpenDrawer(true);
    setDrawerActionType("add"); // Set action type for "plus" icon
  };

  const handleOpenDrawerView = () => {
    setOpenDrawer(true);
    setDrawerActionType("view"); // Set action type for "view" icon
  };
  const handleDrawerComponentData = (data) => {
    // Handle data received from the DrawerComponent
    // console.log("Data from CapitalizedDrawerComponent:", data);
    // You can perform additional actions with the data as needed
  };

  const handleClose = () =>{
    setOpenDrawer(false);
    setAssetData([]);
    // if (childRef.current) {
    //   childRef.current.resetForm();
    // }
    getAllData();
  };

  const getAllData = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/AssetTagging/GetAssetTaggingDetails`)
      .then((response: any) => {
        setAssetRequestData(response?.data || []);
      })
      .catch((e: any) => { });
  };

  useEffect(() => {
    getAllData();
  }, []);

  let columnDefs = [
    {
      field: "Action",
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
            <Tooltip title="Add Asset Details" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize" onClick={()=>{setAssetData(params?.data); handleOpenDrawerPlus();}}>
                <TbPlus />
              </button>
            </Tooltip>
            <Tooltip title="View Asset Details" className="actionsIcons">
              <button className="actionsIcons " onClick={()=>{setAssetData(params?.data); handleOpenDrawerView();}} >
                <VisibilityIcon style={{ fontSize: "14px" }} />
              </button>
            </Tooltip>
            <Tooltip title="Edit Asset Details" className="actionsIcons">
              <button className="actionsIcons actionsIconsSize" >
                <TbPencil  onClick={() => navigate(`/CapitalizedPage/${params?.data?.id}`)}/>
              </button>
            </Tooltip>
          </div>
        </>
      ),
      width: 90,
      minWidth: 90,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "assetCode",
      headerName: "Asset Code",
      headerTooltip: "Asset Code",
      sortable: true,
      resizable: true,
      cellRenderer: (params) => {
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        return  <a  href= "#" style={{ color: 'blue' }} onClick={() => {setAssetDrawerData(params?.data);setOpenDrawerAssetCode(!openDrawerAssetCode)}} >
          {params?.data?.assetCode}
          </a>
      },
      cellStyle: { fontSize: "13px" },
      width: 120,
      minWidth:120,
    },
    {
      field: "assetType",
      headerName: "Asset Type",
      headerTooltip: "Asset Type",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 120,
      minWidth: 120,
    },
    {
      field: "assetCategorization",
      headerName: "Asset Categorization",
      headerTooltip: "Asset Categorization",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 220,
      minWidth: 180,
    },
    {
      field: "assetClassDescription",
      headerName: "Asset Class Description",
      headerTooltip: "Asset Class Description",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 220,
      minWidth: 200,
    },
    {
      field: "assetDescription",
      headerName: "Asset Description",
      headerTooltip: "Asset Description",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 180,
      minWidth: 160,
    },
    {
      field: "pavLocation",
      headerName: "PAV Location",
      headerTooltip: "PAV Location",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 150,
      minWidth: 130,
    },
    {
      field: "bookVal",
      headerName: "Book val",
      headerTooltip: "Book val",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 120,
      minWidth: 100,
    },
    {
      field: "capitalizationDate",
      headerName: "Capitalization Date",
      headerTooltip: "Capitalization Date",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      cellRenderer: function (params) {
        var formattedDate =params?.value ? moment(params.value).format('DD/MM/YYYY') : null;
        return formattedDate;
      },
      width: 170,
      minWidth: 165,
    },
    {
      field: "item",
      headerName: "Item",
      headerTooltip: "Item",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 120,
      minWidth: 90,
    },
    {
      field: "awbno",
      headerName: "AWB No",
      headerTooltip: "AWB No",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 130,
      minWidth: 100,
    },
    {
      field: "courierAgency",
      headerName: "Courier Agency",
      headerTooltip: "Courier Agency",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      width: 180,
      minWidth: 150,
    },
    {
      field: "dispatchDate",
      headerName: "Dispatch Date",
      headerTooltip: "Dispatch Date",
      sortable: true,
      resizable: true,
      cellStyle: { fontSize: "13px" },
      cellRenderer: function (params) {
        var formattedDate = params?.value ? moment(params.value).format('DD/MM/YYYY') : null;
        return formattedDate;
      },
      width: 150,
      minWidth: 130,
    },
  ];

  // const getAllData = async () => {
  //   const responseData = [
  //     { id: 1, assetcode: 14089787, assettype: 'Furtture', assetcategorization: 'Furniture and Fixtures', assetClassdescription: '(Furniture and Fixtures)B03000', assetdescription: 'Chair Silver Steel make Mesh Back lumber', pavlocation: 'GANGARAMPUR', bookval: '65,745.17', capitlizeddate: '3-12-2022', Item: 'ASSETS TAG', awbNumber: 1428692554, Courieragency: 'TRACKON COURIER', dispatchdate: '3-12-2022' },
  //     { id: 1, assetcode: 14089787, assettype: 'Furtture', assetcategorization: 'Furniture and Fixtures', assetClassdescription: '(Furniture and Fixtures)B03001', assetdescription: 'Chair Silver Steel make Mesh Back lumber', pavlocation: 'GANGARAMPUR', bookval: '65,745.18', capitlizeddate: '4-12-2022', Item: 'ASSETS TAG', awbNumber: 1428692555, Courieragency: 'TRACKON COURIER', dispatchdate: '3-12-2022' },
  //     { id: 1, assetcode: 14089787, assettype: 'Furtture', assetcategorization: 'Furniture and Fixtures', assetClassdescription: '(Furniture and Fixtures)B03002', assetdescription: 'Chair Silver Steel make Mesh Back lumber', pavlocation: 'GANGARAMPUR', bookval: '65,745.19', capitlizeddate: '5-12-2022', Item: 'ASSETS TAG', awbNumber: 1428692556, Courieragency: 'TRACKON COURIER', dispatchdate: '3-12-2022' },
  //     { id: 1, assetcode: 14089787, assettype: 'Furtture', assetcategorization: 'Furniture and Fixtures', assetClassdescription: '(Furniture and Fixtures)B03003', assetdescription: 'Chair Silver Steel make Mesh Back lumber', pavlocation: 'GANGARAMPUR', bookval: '65,745.20', capitlizeddate: '6-12-2022', Item: 'ASSETS TAG', awbNumber: 1428692557, Courieragency: 'TRACKON COURIER', dispatchdate: '3-12-2022' },
  //     { id: 1, assetcode: 14089787, assettype: 'Furtture', assetcategorization: 'Furniture and Fixtures', assetClassdescription: '(Furniture and Fixtures)B03004', assetdescription: 'Chair Silver Steel make Mesh Back lumber', pavlocation: 'GANGARAMPUR', bookval: '65,745.21', capitlizeddate: '7-12-2022', Item: 'ASSETS TAG', awbNumber: 1428692558, Courieragency: 'TRACKON COURIER', dispatchdate: '3-12-2022' },
  //   ];

  //   setAssetRequestData(responseData);
  // }

  function onGridReady(params) {
    setGridApi(params.api);
    gridRef.current!.api.sizeColumnsToFit();
  }
  const onFilterTextChange = (e) => {
    gridApi?.setQuickFilter(e?.target?.value);
    if (gridApi.getDisplayedRowCount() == 0) {
      dispatch(fetchError("Data not found!"))
    }
  };

  const handleExportData = (message) => {
    var apiEndpoint;
    if (message === "EmptyCourierDetailsList") {
      apiEndpoint = "/api/AssetTagging/GetEmptyAssetTaggingCourierDetailsReport";
    } else {
      apiEndpoint = "/api/AssetTagging/GetExcelReport";
    }
      
    axios
    .get(`${process.env.REACT_APP_BASEURL}${apiEndpoint}`)
    .then((response) => {
      if (!response) {
        dispatch(fetchError("Error occurred in Export !!!"));
        return;
      }
      if (response?.data) {
        var filename = "AssetTagging.xlsx";
        if (filename && filename === "") {
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        const binaryStr = atob(response?.data);
        const byteArray = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          byteArray[i] = binaryStr.charCodeAt(i);
        }

        var blob = new Blob([byteArray], {
          type: "application/octet-stream",
        });
        if (typeof window.navigator.msSaveBlob !== "undefined") {
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var blobURL =
            window.URL && window.URL.createObjectURL
              ? window.URL.createObjectURL(blob)
              : window.webkitURL.createObjectURL(blob);
          var tempLink = document.createElement("a");
          tempLink.style.display = "none";
          tempLink.href = blobURL;
          tempLink.setAttribute("download", filename);
          if (typeof tempLink.download === "undefined") {
            tempLink.setAttribute("target", "_blank");
          }

          document.body.appendChild(tempLink);
          tempLink.click();

          setTimeout(function () {
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobURL);
          }, 200);

          dispatch(
            showMessage("Asset Tagging Excel downloaded successfully!")
          );
        }
      }
    });
  };

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    if (_validationMaxFileSizeUpload(e, dispatch) && fileValidation(e, chosenFiles, dispatch)) {
      getUploadNumber(e, chosenFiles);
    }
};

const getUploadNumber = (e, files) => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetRecordId`)
      .then((response: any) => {
        if (!response) return;
        if (
          response &&
          response?.data &&
          response?.data &&
          response?.status === 200
        ) {
          var recId = response?.data;
          handleUploadFiles(e, files, recId);
        } else {
          e.target.value = null;
          dispatch(fetchError("Error Occurred !"));
          return;
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
};

const handleUploadFiles = async (e, files, recId) => {
  const uploaded = [...uploadedFiles];
  let limitExceeded = false;
  files &&
    files?.some((file) => {
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
  const formDataTemp: any = new FormData();
  formData.append('assetcode', 0);
  formData.append('documenttype', 'Asset Tagging');
  formData.append('CreatedBy', user?.UserName);
  formData.append('ModifiedBy', user?.UserName);
  formData.append('entityname','Asset Tagging');
  formData.append('RecordId', recId || 0);
  formData.append('remarks', '');
  for (var key in uploaded) {
    await formData.append("file", uploaded[key]);
  }
  for (var keys in uploaded) {
    await formDataTemp.append("file", uploaded[keys]);
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
      .then(async (response: any) => {
        if (!response) {
          setUploadedFiles([]);
          setFileLimit(false);
          dispatch(fetchError("Error Occurred !"));
          return;
        }
        if (response?.data?.data == null) {
          // setRemarks("");
          setUploadedFiles([]);
          setFileLimit(false);
          dispatch(fetchError("Documents are not uploaded!"));
          getAllData();
          // getVersionHistoryData();
          return;
        } else if (response?.data?.code === 200) {
          // setRemarks("");
          setUploadedFiles([]);
          setFileLimit(false);
          // dispatch(showMessage("Documents are uploaded successfully!"));
          // getVersionHistoryData();
          await axios
            .post(`${process.env.REACT_APP_BASEURL}/api/AssetTagging/UploadAndSaveExcelData`,formDataTemp)
            .then((res) => {
              if (!res) {
                e.target.value = null;
                dispatch(fetchError("Error Occured when uploading file !!!"));
                return;
              }
              e.target.value = null;
              if (res?.data?.status) {
                dispatch(showMessage(res?.data?.message));
                getAllData();
              }
              else
              {
                dispatch(fetchError(res?.data?.message));
              }

            })
            .catch((err) => {
            });
        }
      })
      .catch((e: any) => {
        dispatch(fetchError("Error Occurred !"));
      });
    }
  };

  return (
    // <div>AssetQuoteInputList</div>
    <>
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "15px",
        }}
      >
        <Box component="h2" className="page-title-heading mb-0">
          New Capitalized Asset Details
        </Box>

        <div className="phase-grid">
          <Stack
            display="flex"
            alignItems="flex-end"
            justifyContent="space-between"
            flexDirection="row"
            sx={{ mb: -2 }}
          >
            <TextField
              size="small"
              sx={{ marginRight: "10px" }}
              variant="outlined"
              name="search"
              onChange={(e) => {
                onFilterTextChange(e)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Download Template">
              <Button
                size="small"
                style={primaryButtonSm}
                sx={{ color: "#fff", fontSize: "12px" }}
                // onClick={() => downloadTemplate(docType)}
                onClick = {()=>handleExportData("EmptyCourierDetailsList")}
              >
                Download Template
              </Button>
            </Tooltip>
            <div>
              <Tooltip title="Upload">
                <Button
                  size="small"
                  style={primaryButtonSm}
                  sx={{ color: "#fff", fontSize: "12px" }}
                  onClick={() => {fileInput.current.click();}}
                  // onClick={() => navigate("/AssetQuoteInput")}
                >
                  Upload
                </Button>
              </Tooltip>
              <input
                ref={fileInput}
                multiple
                onChange={handleFileEvent}
                disabled={fileLimit}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                type="file"
                style={{ display: "none" }}
              />
            </div>
              <Tooltip title="Export to Excel">
                <Button
                  size="small"
                  style={primaryButtonSm}
                  sx={{ color: "#fff", fontSize: "12px" }}
                  onClick={() => handleExportData("AssetTaggingList")}
                >
                  Export to Excel
                </Button>
              </Tooltip>
          </Stack>
        </div>
      </Grid>

      <CommonGrid
        defaultColDef={{ flex: 1 }}
        columnDefs={columnDefs}
        rowData={assetRequestData}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
      />

      {/* SwipeableDrawer component */}
      <SwipeableDrawer
        anchor="right"
        open={openDrawer}
        onClose={handleClose}
        onOpen={() => setOpenDrawer(true)}
      >
        <CapitalizedDrawerComponent
          // ref={childRef}
          onAssetDetaildViewData={AssetData}
          handleClose={handleClose}
          actionType={drawerActionType}
          AssetData={AssetData}
        />
      </SwipeableDrawer>
      <SwipeableDrawer
        anchor={'right'}
        open={openDrawerAssetCode}
        onClose={(e) => {
            setOpenDrawerAssetCode(!openDrawerAssetCode);
            setAssetId("");
            setAssetNumber("");
        }}
        onOpen={(e) => {
            setOpenDrawerAssetCode(!openDrawerAssetCode);
            setAssetId("");
            setAssetNumber("");
        }}
    >
        {/* <ComplienceTimeline mandateCode={mandateCode} /> */}

        <AssetCodeTaggingDrawer onAssetDrawerData={assetDrawerData} handleClose={() => setOpenDrawerAssetCode(false)} />
      </SwipeableDrawer>
    </>
  )
}

export default NewCapitalizedAssetDetails