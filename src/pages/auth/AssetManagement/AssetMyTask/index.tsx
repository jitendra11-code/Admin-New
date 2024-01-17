import { Badge, Box, Button, Card, Grid, InputAdornment, Stack, Tab, TextField, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import { AgGridReact } from 'ag-grid-react';
import CommonGrid from '@uikit/AgGrid/Grid/CommonGrid';
import { useNavigate } from 'react-router-dom';
import { TbPencil } from 'react-icons/tb';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import axios from 'axios';
import moment from 'moment';

interface LinkTabProps {
  label?: string;
  href?: string;
}

function LinkTab(props: LinkTabProps) {
  return (
    <Tab
      component="a"
      onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
      }}
      {...props}
    />
  );
}

const AssetMyTask = () => {
  const navigate = useNavigate();
  const gridRef = React.useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState(null);
  const [gridColumnApi, setGridColumnApi] = React.useState(null);
  const [value, setValue] = useState("1");
  const [module, setModule] = useState("Asset Inward");
  const [myTaskData, setMyTaskData] = React.useState(null);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  function onGridReady(params) {
    gridRef.current!.api.sizeColumnsToFit();
  }

  const onFilterTextChange = (e) => {
    gridApi?.setQuickFilter(e.target.value);
  };

  const getAllData = async () => {
    await axios
      .get(`${process.env.REACT_APP_BASEURL}/api/AssetWorkflow/GetMyAssetTasks?recordtype=${value}&submodule=${module}`)
      .then((response: any) => {
        setMyTaskData(response?.data || []);
        console.log('res123', response)
      })
      .catch((e: any) => { });
  };

  useEffect(() => {
      getAllData(); 
  }, [module,value]);

  let columnDefs = [
    {
      field: "medals.bronze",
      headerName: "Actions",
      headerTooltip: "Actions",
      resizable: true,
      width: 90,
      minWidth: 90,
      pinned: "left",
      // cellRendererFramework: (e: any ) => (selfSubmit(e)),
      cellRenderer: (e: any) => (
        <>
          <div className="actions">
          
            <Tooltip
              title={`${e?.data?.workItem || "My Task"}`}
              className="actionsIcons"
            >
              <button className="actionsIcons actionsIconsSize">
                
                <TbPencil
                //   onClick={() => {
                //     if (user?.role === "Project Delivery Manager" && e?.data?.workItem === "Create or Assign Phase Approval Note") {
                      
                //       handleClickOpen();
                //       setColumnData(e?.data);          
                //      } else {
                //     var workflowType = e?.data?.workflowType;
                //     var userAction = null;

                //     if (!workflowType) return;
                    
                //     if (workflowType === "Phase") {
                //       userAction =
                //         userActionList &&
                //         userActionList?.find(
                //           (item) =>
                //             item?.tableId === parseInt(e?.data?.phaseId) &&
                //             item?.module === e?.data?.url
                //         );
                //       var url = e?.data?.url;
                //       var action = e?.data?.action;
                //       var runtimeId = e?.data?.runtimeId;
                //       navigate(
                //         `/phase/${e?.data?.phaseId}/${url}?source=list`,
                //         { state: { runtimeId: runtimeId, action: action } }
                //       );
                //       return;
                //     }
                //     userAction =
                //       userActionList &&
                //       userActionList?.find(
                //         (item) =>
                //           item?.mandateId === e?.data?.id &&
                //           item?.module === e?.data?.url
                //       );
                //     var urlX = userAction?.module || "";

                //     navigate(`/mandate/${e?.data?.id}/${urlX}?source=list`);
                //   }}
                // }
                />
                
            
              </button>
            </Tooltip>
              
          </div>
          
        </>
      )
    },
    {
      field: "BranchCode",
      headerName: "Branch Code",
      headerTooltip: "Branch Code",
      sortable: true,
      resizable: true,
      width: 140,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "BranchName",
      headerName: "Branch Name",
      headerTooltip: "Branch Name",
      sortable: true,
      resizable: true,
      width: 140,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "ClassDescription",
      headerName: "Class Description",
      headerTooltip: "Class Description",
      sortable: true,
      resizable: true,
      width: 220,
      minWidth: 220,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "BranchAddress",
      headerName: "Branch Address",
      headerTooltip: "Branch Address",
      sortable: true,
      resizable: true,
      width: 220,
      minWidth: 220,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "RequesterName",
      headerName: "Requester Name",
      headerTooltip: "Requester Name",
      sortable: true,
      resizable: true,
      width: 170,
      minWidth: 170,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "RequiredQuantity",
      headerName: "Required Quantity",
      headerTooltip: "Required Quantity",
      sortable: true,
      resizable: true,
      width: 140,
      minWidth: 130,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "ShiftingType",
      headerName: "Shifting Type",
      headerTooltip: "Shifting Type",
      sortable: true,
      resizable: true,
      width: 180,
      minWidth: 130,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "PINCode",
      headerName: "Pin Code",
      headerTooltip: "Pin Code",
      sortable: true,
      resizable: true,
      width: 90,
      minWidth: 70,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "Type",
      headerName: "Type",
      headerTooltip: "Type",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
    },
    {
      field: "CreatedDate",
      headerName: "Created Date",
      headerTooltip: "Created Date",
      sortable: true,
      resizable: true,
      width: 130,
      minWidth: 100,
      cellStyle: { fontSize: "13px" },
      valueFormatter: (params) => {
        if (params?.data?.createdDate?.split("T")[0] !== "0001-01-01") {
          return params?.data?.createdDate?.split("T")[0];
        }
        return "-";
      },
    },
    // {
    //   field: "admin_vertical",
    //   headerName: "Admin Vertical",
    //   headerTooltip: "Admin Vertical",
    //   sortable: true,
    //   resizable: true,
    //   width: 160,
    //   minWidth: 100,
    //   cellStyle: { fontSize: "13px" },
    // },
    // {
    //   field: "status",
    //   headerName: "Status",
    //   headerTooltip: "Status",
    //   sortable: true,
    //   resizable: true,
    //   width: 160,
    //   minWidth: 100,
    //   cellStyle: { fontSize: "13px" },
    // },
  ];

  
  return (
    <>
      <Grid sx={{ display: 'flex', alignItems: "center", justifyContent: "flex-start", marginBottom: "5px" }}>
        <Button >
          <Card
            // sx={{ opacity: 0.5 }}
            onClick={() => {
              
              setModule("Asset Inward");
              // navigate("/home/Branch_Management");
              // getMenuList();
            }}
            className={module === "Asset Inward" ? "BoxOuter asset-active" : "BoxOuter"}
          >
            <Badge badgeContent={100} color="secondary" style={{marginTop:"-60px", right:"22px", borderRadius:"-6px"}}></Badge>
            <Typography>
              Asset Inward
            </Typography>
          </Card>
        </Button>
        <Button  >
          <Card
            // sx={{ opacity: 0.5 }}
            onClick={() => {
              
              setModule("Asset Insurance");
              // navigate("/home/Branch_Management");
              // getMenuList();
            }}
            className={module === "Asset Insurance" ? "BoxOuter asset-active" : "BoxOuter"}
          >
            <Badge badgeContent={100} color="secondary" style={{marginTop:"-60px", right:"22px", borderRadius:"-6px"}}></Badge>
              <Typography>
                Asset Insurance
              </Typography>
            
          </Card>
        </Button>
        <Button  >
          <Card
            // sx={{ opacity: 0.5 }}
            onClick={() => {
              
              setModule("Asset Tagging");
              // navigate("/home/Branch_Management");
              // getMenuList();
            }}
            className={module === "Asset Tagging" ? "BoxOuter asset-active" : "BoxOuter"}
          >
            <Badge badgeContent={100} color="secondary" style={{marginTop:"-60px", right:"22px", borderRadius:"-6px"}}></Badge>
            <Typography>
              Asset Tagging
            </Typography>
          </Card>
        </Button>
        <Button  >
          <Card
            // sx={{ opacity: 0.5 }}
            onClick={() => {
              
              setModule("Asset PAV");
              // navigate("/home/Branch_Management");
              // getMenuList();
            }}
            className={module === "Asset PAV" ? "BoxOuter asset-active" : "BoxOuter"}
          >
            <Badge badgeContent={100} color="secondary" style={{marginTop:"-60px", right:"22px", borderRadius:"-6px"}}></Badge>
            <Typography>
              Asset PAV
            </Typography>
          </Card>
        </Button>
        
      </Grid> 
      {module === "Asset Inward" ? 
      <div
        style={{
          backgroundColor: "#fff",
          padding: "0px",
          border: "1px solid #0000001f",
          borderRadius: "5px",
        }}
      >
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example" className='assetTabslist'>
              <Tab  style={{minWidth : "165px", position: "relative" }} label={<Badge badgeContent={<span style= {{ position: "absolute" }}>100</span>} 
                    color="secondary" > 
                Asset Request
              </Badge>
                } value="1" />
              <Tab  label={<Badge badgeContent={<span style= {{ position: "absolute" }}>100</span>} 
                    color="secondary" > 
                Quotations
              </Badge>} value="2"  />
              <Tab  label={<Badge badgeContent={<span style= {{ position: "absolute" }}>100</span>} 
                    color="secondary" > 
                Gate Pass & Gate Inward
              </Badge>} value="3" />
              <Tab  label={<Badge badgeContent={<span style= {{ position: "absolute" }}>100</span>} 
                    color="secondary" > 
                Transfer Review & Closer 
              </Badge>} value="4" />
              <Tab  label={<Badge badgeContent={<span style= {{ position: "absolute" }}>100</span>} 
                    color="secondary" > 
                Payment Details
              </Badge>} value="5" />
            </TabList>
          </Box>
          <TabPanel value="1" style = {{height:"500px"}}>
            <CommonGrid
              defaultColDef={null}
              columnDefs={columnDefs}
              rowData={myTaskData}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={true}
              paginationPageSize={10}
            />
          </TabPanel>
          <TabPanel value="2" style = {{height:"500px"}}>
            <CommonGrid
                defaultColDef={null}
                columnDefs={columnDefs}
                rowData={myTaskData}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={true}
                paginationPageSize={10}
              />
          </TabPanel>
          <TabPanel value="3" style = {{height:"500px"}}>
            <CommonGrid
                defaultColDef={null}
                columnDefs={columnDefs}
                rowData={myTaskData}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={true}
                paginationPageSize={10}
              />
          </TabPanel>
          <TabPanel value="4" style = {{height:"500px"}}>
            <CommonGrid
                defaultColDef={null}
                columnDefs={columnDefs}
                rowData={myTaskData}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={true}
                paginationPageSize={10}
              />
          </TabPanel>
          <TabPanel value="5" style = {{height:"500px"}}>
            <CommonGrid
                defaultColDef={null}
                columnDefs={columnDefs}
                rowData={myTaskData}
                onGridReady={onGridReady}
                gridRef={gridRef}
                pagination={true}
                paginationPageSize={10}
              />
          </TabPanel>
        </TabContext>
    </div>
    : module === "Asset Insurance" ? 
    <div
        style={{
          backgroundColor: "#fff",
          padding: "0px",
          border: "1px solid #0000001f",
          borderRadius: "5px",
        }}
      >
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example" className='assetTabslist'>
              <Tab  label={<Badge badgeContent={<span style= {{ position: "absolute" }}>100</span>} 
                    color="secondary" > 
                Asset Insurence
              </Badge>} value="1" />
            </TabList>
          </Box>
          <TabPanel value="1" style = {{height:"500px"}}>
            <CommonGrid
              defaultColDef={null}
              columnDefs={columnDefs}
              rowData={myTaskData}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={true}
              paginationPageSize={10}
            />
          </TabPanel>
        </TabContext>
        
    </div>
    : module === "Asset Tagging" ? 
    <div
        style={{
          backgroundColor: "#fff",
          padding: "0px",
          border: "1px solid #0000001f",
          borderRadius: "5px",
        }}
      >
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example" className='assetTabslist'>
              <Tab  label={<Badge badgeContent={<span style= {{ position: "absolute" }}>100</span>} 
                    color="secondary" > 
                Asset Tagging
              </Badge>} value="1" />
            </TabList>
          </Box>
          <TabPanel value="1" style = {{height:"500px"}}>
            <CommonGrid
              defaultColDef={null}
              columnDefs={columnDefs}
              rowData={myTaskData}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={true}
              paginationPageSize={10}
            />
          </TabPanel>
        </TabContext>
        
    </div>
    : module === "Asset PAV" ?
    <div
        style={{
          backgroundColor: "#fff",
          padding: "0px",
          border: "1px solid #0000001f",
          borderRadius: "5px",
        }}
      >
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example" className='assetTabslist'>
              <Tab  label={<Badge badgeContent={<span style= {{ position: "absolute" }}>100</span>} 
                    color="secondary" > 
                Asset PAV
              </Badge>} value="1" />
            </TabList>
          </Box>
          <TabPanel value="1" style = {{height:"500px"}}>
            <CommonGrid
              defaultColDef={null}
              columnDefs={columnDefs}
              rowData={myTaskData}
              onGridReady={onGridReady}
              gridRef={gridRef}
              pagination={true}
              paginationPageSize={10}
            />
          </TabPanel>
        </TabContext>
        
    </div>
    : ""
}
      
    </>
  )
}

export default AssetMyTask