import { Box, Button, Checkbox, FormControlLabel, Grid, InputAdornment, Stack, SwipeableDrawer, TextField, Tooltip } from '@mui/material';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import React, { useEffect } from 'react';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import SearchIcon from '@mui/icons-material/Search';
import { GridApi } from 'ag-grid-community';
import { fetchError } from 'redux/actions';
import { useDispatch } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AssetCodeDrawer from './AssetCodeDrawer';

const AssetInwardView = () => {
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [assetInwardData, setAssetInwardData] = React.useState(null);
    const [checked, setChecked] = React.useState({});
    const [assetDetailsData, setAssetDetailsData] = React.useState([]);
    const [assetDetailsUpdateData, setAssetDetailsUpdateData] = React.useState([]);
    const [openDrawerAssetCode, setOpenDrawerAssetCode] = React.useState(false);
    const [assetDrawerData, setAssetDrawerData]= React.useState(null);
    const [assetId, setAssetId] = React.useState<any>("");
    const [assetNumber, setAssetNumber] = React.useState<any>("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getAllData = async () => {
          await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/AssetGatePass/GetAssetInwardView`)
            .then((response: any) => {
              setAssetInwardData(response?.data || []);
              console.log('res123', response)
            })
            .catch((e: any) => { });
        };
    useEffect(() => {
        getAllData(); 
    }, [])
    const getAssetRequestMovementDetailsData = async (assetCode) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASEURL}/api/Asset/GetAssetRequestMovementDetailsByAssetId?assetId=${assetId}&assetcode=${assetNumber}`);
        // if (assetNumber === response?.data?.assetCode) {
          setAssetDrawerData(response?.data?.[0]);
        // }
        console.log('res', response?.data?.[0]);
      } catch (error) {
        // Handle errors here
        console.error(error);
      }
    };
    
    React.useEffect(() => {
      if (assetId && assetId !== "id") {
        getAssetRequestMovementDetailsData(assetId);
      }
    }, [assetId]);

console.log('assetDetailsData',assetDetailsData)
    const updateAssetDetailsData = () => {
      const body = assetDetailsData.map((item) => {
        return  {
          // ...item,
          id : item?.fk_asset_inward_details_id,
          status:"Updated on SAP",
          remarks:""
        }

      })

      axios
        .post(
          `${process.env.REACT_APP_BASEURL}/api/AssetGatePass/UpdateAssetInwardDetailsStatus`,
          body
        )
        .then((response: any) => {
          console.log('res123',response)
          if (response) {
            navigate("/BranchAdminReview")
          }
          
          if (!response) {
            dispatch(fetchError("Gate Pass details not updated"));
            // setOpen(false);
            return;
          }
        }).catch((e: any) => {
          // setOpen(false);
          dispatch(fetchError("Error Occurred !"));
        });
       
      
    }
    
    let columnDefs = [
        {
          field: "Action",
          headerName: "Actions",
          headerTooltip: "Actions",
          sortable: false,
          resizable: false,
          pinned: "left",
          cellRenderer: (e: any) => (
            <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked[e?.rowIndex]   || false}
                  onChange={() => {
                    const newChecked = { ...checked };
                    // setFlag(false)
                    // Toggle the selected state for the current row
                    newChecked[e?.rowIndex] = !newChecked[e?.rowIndex];
  
                    // Update the state with the new selection
                    setChecked(newChecked);
  
                    console.log('eeeee',e,newChecked)
  
                    // newChecked[e?.rowIndex] =
                    //   checked[e?.rowIndex] === undefined
                    //     ? true
                    //     : !checked[e?.rowIndex];
                    // setChecked({ ...checked });
                    if (
                      newChecked[e?.rowIndex] === undefined ||
                      newChecked[e?.rowIndex]
                    ) {
                      // assignedAssetData[e?.rowIndex] = { ...e?.data };
                      setAssetDetailsData([ ...assetDetailsData,{ ...e?.data } ]);
                     
                    } else if (newChecked[e?.rowIndex]=== false) {
                      // delete assignedAssetData[e?.rowIndex];
                      // setAssignedAssetData([ ...assignedAssetData ]);
                      setAssetDetailsData(assetDetailsData.filter(obj => obj?.id !== e?.data?.id))
                    }
  
                    // if (assignedAssetData ) {
                    //   newChecked[e?.rowIndex] = false;
                    //   setChecked(newChecked);
                    // }
                    
                   
                  }}
                />
              }
              label=""
            />
          </>
          ),
          width: 90,
          minWidth: 90,
          cellStyle: { fontSize: "13px" },
        },
        {
          field: "assetNumber",
          headerName: "Asset Number",
          headerTooltip: "Asset Number",
          sortable: true,
          resizable: true,
          cellRenderer: (params) => {
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            console.log("AccsetCode",params)
            return  <a  href= "#" style={{ color: 'blue' }} onClick={() => {setAssetId(params?.data?.fk_asset_request_id);setAssetNumber(params?.data?.assetNumber);setOpenDrawerAssetCode(!openDrawerAssetCode)}} >
              {params?.data?.assetNumber}
              </a>
          },
          cellStyle: { fontSize: "13px" },
          width: 160,
          minWidth: 140,
        },
        {
          field: "assetCategory",
          headerName: "Asset Category",
          headerTooltip: "Asset Category",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 160,
          minWidth: 140,
        },
        {
          field: "assetdescription",
          headerName: "Asset Description",
          headerTooltip: "Asset Description",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 160,
          minWidth: 140,
        },
        {
            field: "capDate",
            headerName: "Capitalized Date",
            headerTooltip: "Capitalized Date",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            cellRenderer: function (params) {
              var formattedDate = moment(params.value).format('DD/MM/YYYY');
              return formattedDate;
            },
            width: 150,
            minWidth: 120,
          },
        {
          field: "qty",
          headerName: "Quantity",
          headerTooltip: "Quantity",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 120,
          minWidth: 120,
        },
        {
          field: "requester",
          headerName: "Requester",
          headerTooltip: "Requester",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 120,
          minWidth: 120,
        },
        {
          field: "approvedBy",
          headerName: "Approved By",
          headerTooltip: "Approved By",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 140,
          minWidth: 140,
        },
        {
            field: "approvedOn",
            headerName: "Approved On",
            headerTooltip: "Approved On",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            cellRenderer: function (params) {
              var formattedDate = moment(params.value).format('DD/MM/YYYY');
              return formattedDate;
            },
            width: 150,
            minWidth: 150,
          },
        {
          field: "locationChangeFrom",
          headerName: "Location Change From",
          headerTooltip: "Location Change From",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 200,
          minWidth: 200,
        },
        
        {
          field: "costCentreChangeFrom",
          headerName: "Cost Center Change From",
          headerTooltip: "Cost Center Change From",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 200,
          minWidth: 200,
        },
        {
          field: "fromState",
          headerName: "From State",
          headerTooltip: "From State",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 150,
          minWidth: 150,
        },
        {
          field: "locationChangeTo",
          headerName: "Location Change To",
          headerTooltip: "Location Change To",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 200,
          minWidth: 200,
        },
        {
          field: "costCentreChangeTo",
          headerName: "Cost Center Change To",
          headerTooltip: "Cost Center Change To",
          sortable: true,
          resizable: true,
          cellStyle: { fontSize: "13px" },
          width: 250,
          minWidth: 250,
        },
        {
            field: "toState",
            headerName: "To State",
            headerTooltip: "To State",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 150,
            minWidth: 130,
        },
        {
            field: "movementType",
            headerName: "Movement Type",
            headerTooltip: "Movement Type",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 150,
            minWidth: 140,
        },
        {
            field: "plant",
            headerName: "Plant",
            headerTooltip: "Plant",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 150,
            minWidth: 100,
        },
        {
            field: "storageLocation",
            headerName: "Storage Location",
            headerTooltip: "Storage Location",
            sortable: true,
            resizable: true,
            cellStyle: { fontSize: "13px" },
            width: 150,
            minWidth: 150,
        },
      ];

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
  return (
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
          Asset Inward View
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
                console.log('e', e)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Asset Details Updated">
              <Button
                size="small"
                style={primaryButtonSm}
                sx={{ color: "#fff", fontSize: "12px" }}
                onClick={() =>assetDetailsData.length > 0 ? updateAssetDetailsData() : dispatch(fetchError("Please select atleast one record!!"))}
              >
              Asset Details Updated
              </Button>
            </Tooltip>
          </Stack>
        </div>
      </Grid>

      <CommonGrid
        defaultColDef={{ flex: 1 }}
        columnDefs={columnDefs}
        rowData={assetInwardData}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
      />
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

                <AssetCodeDrawer onAssetDrawerData={assetDrawerData} handleClose={() => setOpenDrawerAssetCode(false)} />
      </SwipeableDrawer>
    </>
  )
}

export default AssetInwardView