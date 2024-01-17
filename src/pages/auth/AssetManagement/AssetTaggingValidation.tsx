import { Box, Button, InputAdornment, Stack, TextField,Grid, Dialog, DialogContent, DialogContentText, DialogActions, FormControlLabel, Checkbox,Tooltip, SwipeableDrawer } from '@mui/material';
import { GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { fetchError } from 'redux/actions';
import SearchIcon from '@mui/icons-material/Search';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { TbPencil } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import AssetCodeTaggingDrawer from './AssetCodeTaggingDrawer';

const AssetTaggingValidation = () => {
    const [assetRequestData,setAssetRequestData] = useState([]);
    const gridRef = React.useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [open,setOpen]=useState(false);
    const [Remark,setRemark] = useState('');
    const [errorRemark,setErrorRemark] = useState('');
    const [checked, setChecked] = React.useState({});
    const [assetTaggingData, setAssetTaggingData] = React.useState([]);
    const [openDrawerAssetCode, setOpenDrawerAssetCode] = React.useState(false);
    const [assetDrawerData, setAssetDrawerData]= React.useState(null);
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
            cellRenderer: (e: any) => (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginRight: "10px",
                }}>
                    <div>
                        <FormControlLabel
                        control={
                            <Checkbox
                            checked={checked[e?.rowIndex]   || false}
                            onChange={()=>{
                                const newChecked = {...checked};
                                newChecked[e?.rowIndex] = !newChecked[e?.rowIndex];
                                setChecked(newChecked);
                                if(newChecked[e?.rowIndex] === undefined || newChecked[e?.rowIndex])
                                {
                                    setAssetTaggingData([ ...assetTaggingData,{ ...e?.data } ]);
                                }
                                else if(newChecked[e?.rowIndex] === false){
                                    setAssetTaggingData(assetTaggingData.filter((d)=>d?.id !== e?.data?.id))
                                }
                            }}
                            />
                        }
                        label=""
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginRight: "10px",
                        }}
                        className="actions"
                    >
                        <Tooltip title="Asset Validation" className="actionsIcons">
                            <button className="actionsIcons actionsIconsSize">
                                <TbPencil onClick={() => navigate(`/CapitalizedPage/${e?.data?.id}?validation=validation`)} />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            ),
            width: 100,
            minWidth: 100,
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
    const handleClose = () => {
        setOpen(false);
        setRemark("");
        setErrorRemark("");
    };
    
    const onApproveOrSendBack = (type) =>{
        if(assetTaggingData.length == 0)
        {
            dispatch(fetchError("Atleast select one Asset Details"));
            return;
        }
        setOpen(true);
    }

    const handleRemark = ()=>{
        if(Remark.length == 0)
        {
            setErrorRemark("Please enter Remark");
            return;
        }

    }
    return(
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
          Asset Validation
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
            <Tooltip title="Approve">
              <Button
                size="small"
                style={primaryButtonSm}
                sx={{ color: "#fff", fontSize: "12px" }}
                onClick={() => onApproveOrSendBack("Approve")}
              >
                Approve
              </Button>
            </Tooltip>
            <Tooltip title="Send Back">
              <Button
                size="small"
                style={primaryButtonSm}
                sx={{ color: "#fff", fontSize: "12px" }}
                onClick={() => onApproveOrSendBack("SendBack")}
              >
                Send Back
              </Button>
            </Tooltip>
          </Stack>
        </div>
      </Grid>
      <Dialog
        className="dialog-wrap"
        open={open}
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent style={{ minWidth: "550px" }}>
          <DialogContentText id="alert-dialog-slide-description" style={{marginBottom:"5px"}}>
            Please enter Remark
          </DialogContentText>
          <textarea
            id="Remark"
            name="Remark"
            // variant="outlined"
            // size="small"
            style={{width: "500px", height: "70px"}}
            placeholder="Remark"
            value={Remark || ""}
            onChange={(e)=>{
              setRemark(e.target.value);
            }}
          />
          { errorRemark.length > 0 ? (<p className="form-error">{errorRemark}</p>) : null}
        </DialogContent>
        <DialogActions className="button-wrap">
          <Tooltip title="Cancel" placement='top'>
            <Button className="no-btn" onClick={handleClose}>
              Cancel
            </Button>
          </Tooltip>
          <Tooltip title="Submit" placement='top'>
            <Button
              className="yes-btn"
              onClick={handleRemark}
            >
              Submit
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>

      <SwipeableDrawer
        anchor={'right'}
        open={openDrawerAssetCode}
        onClose={(e) => {
            setOpenDrawerAssetCode(!openDrawerAssetCode);
        }}
        onOpen={(e) => {
            setOpenDrawerAssetCode(!openDrawerAssetCode);
        }}
    >
        {/* <ComplienceTimeline mandateCode={mandateCode} /> */}

        <AssetCodeTaggingDrawer onAssetDrawerData={assetDrawerData} handleClose={() => setOpenDrawerAssetCode(false)} />
      </SwipeableDrawer>

      <CommonGrid
        defaultColDef={{ flex: 1 }}
        columnDefs={columnDefs}
        rowData={assetRequestData}
        onGridReady={onGridReady}
        gridRef={gridRef}
        pagination={true}
        paginationPageSize={10}
      />

    </>
    );
}

export default AssetTaggingValidation;