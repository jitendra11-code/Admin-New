import React, {useState, useEffect} from 'react';
import './MergedTable.css';
import { TbPencil } from "react-icons/tb";
import {Autocomplete, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Select, Stack, TextField, Tooltip} from "@mui/material";
import axios from 'axios';
import { primaryButtonSm } from 'shared/constants/CustomColor';
import { useFormik } from 'formik';
import * as Yup from "yup";
import moment from 'moment';
import { useAuthUser } from '@uikit/utility/AuthHooks';
import { fetchError, showMessage } from 'redux/actions';
import { useDispatch } from 'react-redux';
import AppTooltip from '@uikit/core/AppTooltip';
import { AiFillFileExcel } from 'react-icons/ai';

const VerticalCategoryBranch = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [data,setData] = useState([]);
  const [Vertical,setVertical] = useState([]);
  const [Category,setCategory] = useState([]);
  const [openV, setOpenV] = React.useState(false);
  const [openC, setOpenC] = React.useState(false);
  const [openB, setOpenB] = React.useState(false);
  const { user } = useAuthUser();
  const dispatch = useDispatch();
  const [VeditFlag,setVeditFlag] = useState(false);
  const [CeditFlag,setCeditFlag] = useState(false);
  const [BeditFlag,setBeditFlag] = useState(false);

  const getVerticalCategoryBranch = async () => {
    await axios
        .get(`${process.env.REACT_APP_BASEURL}/api/BranchType/getVerticalCategoryBranch`)
        .then((response : any)=>{
            setData(response?.data || []);
        })
        .catch((e:any) => {});
  };

  useEffect(() =>{
      getVerticalCategoryBranch();
      getVertical();
  },[]);

  const getVertical = async () => {
    await axios
        .get(`${process.env.REACT_APP_BASEURL}/api/Verticals/GetVerticals`)
        .then((response : any)=>{
          setVertical(response?.data || []);
        })
        .catch((e:any) => {});
  };

  const getCategory = async (verticalId) => {
    await axios
        .get(`${process.env.REACT_APP_BASEURL}/api/Verticals/GetGlCategory?verticalId=${verticalId}`)
        .then((response : any)=>{
          setCategory(response?.data || []);
        })
        .catch((e:any) => {});
  };

  const handleClickOpenV = ()=> {
    setOpenV(true);
  }
  const handleCloseV = () => {
    setOpenV(false);
    setTimeout(()=>{
      resetForm();
      VeditFlag ? setVeditFlag(false) : setVeditFlag(false);
      setSelectedRow(null);
    },100)
  }

  const handleClickOpenC = ()=> {
    setOpenC(true);
  }
  const handleCloseC = () => {
    setOpenC(false);
    setTimeout(()=>{
      resetForm();
      CeditFlag ? setCeditFlag(false) : setCeditFlag(false);
      setSelectedRow(null);
    },100)
  }

  const handleClickOpenB = ()=> {
    setOpenB(true);
  }
  const handleCloseB = () => {
    setOpenB(false);
    setTimeout(()=>{
      resetForm();
      BeditFlag ? setBeditFlag(false) : setBeditFlag(false);
      setSelectedRow(null);
    },100)
  }

  const styling = {
    marginTop: "5px",
    marginBottom: "5px",
  }

  // Group the data by vertical ID
  const groupedData: { [key: string]: { [key: string]: any[] } } = {};
  data.forEach((item) => {
    const verticalKey = item.verticalId;
    if (!groupedData[verticalKey]) {
      groupedData[verticalKey] = {};
    }

    // Group the data by category ID within each vertical ID
    const categoryKey = item.gLcategoryId;
    if (!groupedData[verticalKey][categoryKey]) {
      groupedData[verticalKey][categoryKey] = [];
    }
    groupedData[verticalKey][categoryKey].push(item);
  });

  // Generate table rows with merged columns
  const rows = [];
  for (const verticalKey in groupedData) {
    const verticalGroup = groupedData[verticalKey];
    const verticalGroupSize = Object.values(verticalGroup).reduce(
      (sum, categoryGroup) => sum + (categoryGroup as any[]).length,
      0
    );

    let isFirstVertical = true;
    for (const categoryKey in verticalGroup) {
      const categoryGroup = verticalGroup[categoryKey] as any[];

      let isFirstCategory = true;
      categoryGroup.forEach((item, index) => {
        const mergedVerticalCell = isFirstVertical && isFirstCategory ? (
          <td rowSpan={verticalGroupSize}>{item.vertical}</td>
        ) : null;

        const mergedCategoryCell = isFirstCategory ? (
          <td rowSpan={categoryGroup.length}>{item.category}</td>
        ) : null;

        const rowClassName = selectedRow === item ? 'selected' : '';

       
        rows.push(
          <tr key={`${item.verticalId}-${item.gLcategoryId}-${item.branchtypeId}`}  className={rowClassName} >
            <td>
              <div>
              <Tooltip title="Edit Vertical" className="actionsIcons">
                <button onClick={()=>{setSelectedRow(item); setVeditFlag(true); setOpenV(true);}}>
                  <Avatar className='avataricon'>V</Avatar>
                </button>
              </Tooltip>
              <Tooltip title="Edit Category" className="actionsIcons">
                <button onClick={()=>{setSelectedRow(item); setCeditFlag(true); setOpenC(true);}} >
                <Avatar className='avataricon'>C</Avatar>
                </button>
              </Tooltip>
              <Tooltip title="Edit Branch" className="actionsIcons">
                <button onClick={()=>{setSelectedRow(item); setBeditFlag(true); setOpenB(true);}}>
                <Avatar className='avataricon'>B</Avatar>
                </button>
              </Tooltip>
              </div>
            </td>
            {mergedVerticalCell}
            {mergedCategoryCell}
            <td>{item.branch}</td>
          </tr>
        );

        isFirstVertical = false;
        isFirstCategory = false;
      });
    }
  }

  const validateSchema = Yup.object({
    vertical1: Yup.string().required("Please enter vertical"),
    vertical2: Yup.string().required("Please select vertical"),
    category2: Yup.string().required("Please enter category"),
    vertical3: Yup.string().required("Please select vertical"),
    category3: Yup.string().required("Please select category"),
    branch3: Yup.string().required("Please enter branch"),
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
      vertical1: '',
      vertical2: '',
      category2: '',
      vertical3: '',
      category3: '',
      branch3: '',
    },
    validationSchema: validateSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values, action) => {
    },
  });
  

  useEffect(()=>{
    if(VeditFlag){
      setFieldValue("vertical1",selectedRow.vertical);
    }
    if(CeditFlag){
      setFieldValue("vertical2",selectedRow.verticalId);
      setFieldValue("category2",selectedRow.category);
    }
    if(BeditFlag){
      setFieldValue("vertical3",selectedRow.verticalId);
      setFieldValue("category3",selectedRow.gLcategoryId);
      setFieldValue("branch3",selectedRow.branch);
    }
  },[setSelectedRow,VeditFlag,CeditFlag,BeditFlag]);

    const handleSubmitV = () =>{
      if(values?.vertical1)
      {
        const body = {
            id: VeditFlag ? selectedRow.verticalId : 0,
            uid: "1",
            countryID: 1,
            verticalID: null, //auto-generate at backend
            verticalName: values?.vertical1,
            l1AdminInfraSPOCEcode: "1",
            l1AdminInfraSPOCName: "1",
            l2AdminInfraSPOCEcode: "1",
            l2AdminInfraSPOCName: "1",
            cpuspocEcode: "1",
            cpuspocName: "1",
            nhcpuspocEcode: "1",
            nhcpuspocName: "1",
            legalSPOCEcode: "1",
            legalSPOCName: "1",
            complianceSPOCEncode: "1",
            complianceSPOCName: "1",
            status: "Active",
            createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            createdBy: user?.UserName,
            updatedOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
            updatedBy: user?.UserName,
        }

        axios
          .post(`${process.env.REACT_APP_BASEURL}/api/Verticals/InsertUpdateVerticalMaster`, body)
          .then((response: any) => {
            if (!response) {
              VeditFlag ? dispatch(fetchError("Vertical Master not updated")) : dispatch(fetchError("Vertical Master not added"))
              setOpenV(false);
              return;
            };
            if (response && response?.data?.code === 200 && response?.data?.status === true) {
              VeditFlag ? dispatch(showMessage("Vertical Master updated successfully")) : dispatch(showMessage("Vertical Master added successfully"))
              getVerticalCategoryBranch();
              getVertical();
              setOpenV(false);
              return;
            } else {
              dispatch(fetchError("Vertical Master already exists"));
              setOpenV(false);
              return;
            }
          })
          .catch((e: any) => {
            setOpenV(false);
            dispatch(fetchError("Error Occurred !"));
          });

          setTimeout(()=>{
            resetForm();
            VeditFlag ? setVeditFlag(false) : setVeditFlag(false);
          },1000);
          setSelectedRow(null);
      }
      else
      {
        setFieldTouched('vertical1', true);
      }
    }
    
    const handleSubmitC = () =>{
      if(values?.vertical2 && values?.category2)
      {

        const body = {
          id: CeditFlag ? selectedRow.gLcategoryId : 0,
          uid: "1",
          verticalID: values?.vertical2,
          glCategoryID: null,//auto-generate at backend
          glCategoryName: values?.category2,
          status: "Active",
          createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          createdBy: user?.UserName,
          updatedOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          updatedBy: user?.UserName,
        }

        axios
          .post(`${process.env.REACT_APP_BASEURL}/api/GLCategories/InsertUpdateGLCategory`, body)
          .then((response: any) => {
            if (!response) {
              CeditFlag ? dispatch(fetchError("Category details not updated")) : dispatch(fetchError("Category details not added"))
              setOpenC(false);
              return;
            };
            if (response && response?.data?.code === 200 && response?.data?.status === true) {
              CeditFlag ? dispatch(showMessage("Category details updated successfully")) : dispatch(showMessage("Category details added successfully"))
              getVerticalCategoryBranch();
              getVertical();
              setOpenC(false);
              return;
            } else {
              dispatch(fetchError("Category details already exists"));
              setOpenC(false);
              return;
            }
          })
          .catch((e: any) => {
            setOpenC(false);
            dispatch(fetchError("Error Occurred !"));
          });
        setTimeout(()=>{
          resetForm();
          CeditFlag ? setCeditFlag(false) : setCeditFlag(false);
        },1000);
        setSelectedRow(null);
      }
      else
      {
        setFieldTouched('vertical2', true);
        setFieldTouched('category2', true);
      }
    }
    
    const handleSubmitB = () =>{
      if(values?.vertical3 && values?.category3 && values?.branch3)
      {

        const body = {
          id: BeditFlag ? selectedRow.branchtypeId : 0,
          uid: "1",
          glCategoryID: values?.category3,
          gLandVertical: (values?.vertical3).toString(),
          branchTypeID: " ", //auto-generate at backend
          branchTypeName: values?.branch3,
          projectOwnerSPOCEcode: "1",
          projectOwnerSPOCName: "1",
          mandateAcceptanceTAT: "1",
          propertySourcingTAT: "1",
          sourcingOptionTAT: "1",
          businessApprovalTAT: "1",
          legalComplianceTAT: "1",
          layoutTAT: "1",
          rccStabilityTAT: "1",
          sitereadinessTAT: "1",
          civilTAT: "1",
          admintoGephandoverTAT: "1",
          networkLinkdeliveryTAT: "1",
          cashierJoiningatBranchTAT: "1",
          desktopDeliveryTAT: "1",
          desktopinstallationTAT: "1",
          userConfigurationTAT: "1",
          geotoBusinessHandoverTAT: "1",
          status : "Active",
          createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          createdBy: user?.UserName,
          updatedOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          updatedBy: user?.UserName,
        }

        axios
          .post(`${process.env.REACT_APP_BASEURL}/api/BranchType/InsertUpdateBranchType`, body)
          .then((response: any) => {
            if (!response) {
              BeditFlag ? dispatch(fetchError("BranchType details not updated")) : dispatch(fetchError("BranchType details not added"))
              setOpenB(false);
              return;
            };
            if (response && response?.data?.code === 200 && response?.data?.status === true) {
              BeditFlag ? dispatch(showMessage("BranchType details updated successfully")) : dispatch(showMessage("BranchType details added successfully"))
              getVerticalCategoryBranch();
              getVertical();
              setOpenB(false);
              return;
            } else {
              dispatch(fetchError("BranchType details already exists"));
              setOpenB(false);
              return;
            }
          })
          .catch((e: any) => {
            setOpenB(false);
            dispatch(fetchError("Error Occurred !"));
          });
        setTimeout(()=>{
          resetForm();
          BeditFlag ? setBeditFlag(false) : setBeditFlag(false);
        },1000);
        setSelectedRow(null);
      }
      else
      {
        setFieldTouched('vertical3', true);
        setFieldTouched('category3', true);
        setFieldTouched('branch3', true);
      }
    }
    
    const getTitleV = ()=>{
      if (VeditFlag) {
        return 'Edit Vertical';
      } else {
        return 'Add Vertical';
      }
    }
    const getTitleC = ()=>{
      if (CeditFlag) {
        return 'Edit Category';
      } else {
        return 'Add Category';
      }
    }
    const getTitleB = ()=>{
      if (BeditFlag) {
        return 'Edit Branch';
      } else {
        return 'Add Branch';
      }
    }

    useEffect(()=>{
      getCategory(values?.vertical3);
    },[values?.vertical3]);


    const handleExportData = () => {
      axios
        .get(
          `${process.env.REACT_APP_BASEURL}/api/BranchType/GetExcelReport`
        )
        .then((response) => {
          if (!response) {
            dispatch(fetchError("Error occurred in Export !!!"));
            return;
          }
          if (response?.data) {
            var filename = "VerticalCategoryBranch.xlsx";
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
                showMessage("Vertical Category Branch Excel downloaded successfully!")
              );
            }
          }
        });
    };
  return (
    <>
      <Grid
          sx={{
              display : "flex",
              alignItems : "center",
              justifyContent : "space-between",
              marginBottom : "15px",
          }}
      >
          <Box component="h2" className="page-title-heading mb-0">
              Vertical Category Branch
          </Box>
          <div className="rolem-grid">
            <Stack
              display="flex"
              alignItems="flex-end"
              justifyContent="space-between"
              flexDirection="row"
              sx={{ mb: -2 }}
            >
            
              <Button
              size="small"
              style={primaryButtonSm}
              sx={{ color: "#fff", fontSize: "12px" }}
              onClick={handleClickOpenV}
              >
              Add Vertical
              </Button>
              <Button
              size="small"
              style={primaryButtonSm}
              sx={{ color: "#fff", fontSize: "12px" }}
              onClick={handleClickOpenC}
              >
              Add Category
              </Button>
              <Button
              size="small"
              style={primaryButtonSm}
              sx={{ color: "#fff", fontSize: "12px" }}
              onClick={handleClickOpenB}
              >
              Add Branch
              </Button>
              <AppTooltip title="Export Excel">
                <IconButton
                  className="icon-btn"
                  sx={{
                    // borderRadius: "50%",
                    // borderTopColor:"green",
                    width: 35,
                    height: 35,
                    // color: (theme) => theme.palette.text.secondary,
                    color: "white",
                    backgroundColor: "green",
                    "&:hover, &:focus": {
                      backgroundColor: "green", // Keep the color green on hover
                    },
                  }}
                  onClick={() => { handleExportData(); }}
                  size="large"
                >
                  <AiFillFileExcel />
                </IconButton>
              </AppTooltip>
            </Stack>
          </div>
      </Grid>  
      <div className="card-panal inside-scroll-185" style={{border: "1px solid rgba(0, 0, 0, 0.12)"}}> 
        <table className="merged-table">
          <thead>
            <tr>
              <th style={{width:"30px"}}>Actions</th>
              <th>Vertical</th>
              <th>Category</th>
              <th>Branch</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div> 

      <Dialog
        open={openV}
        onClose={handleCloseV}
        aria-describedby="alert-dialog-slide-description"
        maxWidth="lg"
        PaperProps={{ style: { borderRadius: '20px', }, }}
        >
      <form>
        <DialogTitle id="alert-dialog-title" className="title-model">
            {getTitleV()}
        </DialogTitle>
        <DialogContent style={{ width: "450px" }}>
          <h2 className="phaseLable required" style={styling}>Vertical</h2>
          <TextField
            id="vertical1"
            name="vertical1"
            variant="outlined"
            size="small"
            value={values?.vertical1 || ""}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          { touched.vertical1 && errors.vertical1 ? (<p className="form-error">{errors.vertical1}</p>) : null }
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button className="yes-btn" onClick={handleSubmitV}>{VeditFlag ? 'Update' : 'Submit'}</Button>
          <Button className="no-btn" onClick={handleCloseV}>Cancel</Button>
        </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={openC}
        onClose={handleCloseC}
        aria-describedby="alert-dialog-slide-description"
        maxWidth="lg"
        PaperProps={{ style: { borderRadius: '20px', }, }}
        >
      <form>
        <DialogTitle id="alert-dialog-title" className="title-model">
          {getTitleC()}
        </DialogTitle>
        <DialogContent style={{ width: "450px" }}>
          <h2 className="phaseLable required" style={styling}>Vertical</h2>
          <Select
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
            size="small"
            className="w-85"
            name="vertical2"
            id="vertical2"
            value={values.vertical2 || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={CeditFlag}
            sx={CeditFlag && {
              backgroundColor: "#f3f3f3",
              borderRadius: "6px",
            }}
          >
            <MenuItem value="" style={{ display: "none" }}>
              <em>Select Vertical</em>
            </MenuItem>
            {Vertical?.map((v: any) => <MenuItem value={v?.id}>{v?.verticalName}</MenuItem>)}
          </Select>
          
          {touched.vertical2 && errors.vertical2 ? (<p className="form-error">{errors.vertical2}</p>) :  null}

          <h2 className="phaseLable required" style={styling}>Category</h2>
          <TextField
            id="category2"
            name="category2"
            variant="outlined"
            size="small"
            value={values?.category2 || ""}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          {touched.category2 && errors.category2 ? (<p className="form-error">{errors.category2}</p>) : null }
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button className="yes-btn" onClick={handleSubmitC}>{CeditFlag ? 'Update' : 'Submit'}</Button>
          <Button className="no-btn" onClick={handleCloseC}>Cancel</Button>
        </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={openB}
        onClose={handleCloseB}
        aria-describedby="alert-dialog-slide-description"
        maxWidth="lg"
        PaperProps={{ style: { borderRadius: '20px', }, }}
        >
      <form>
        <DialogTitle id="alert-dialog-title" className="title-model">
          {getTitleB()}
        </DialogTitle>
        <DialogContent style={{ width: "450px" }}>
        <h2 className="phaseLable required" style={styling}>Vertical</h2>
          <Select
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
            size="small"
            className="w-85"
            name="vertical3"
            id="vertical3"
            value={values.vertical3 || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={BeditFlag}
            sx={BeditFlag && {
              backgroundColor: "#f3f3f3",
              borderRadius: "6px",
            }}
          >
            <MenuItem value="" style={{ display: "none" }}>
              <em>Select Vertical</em>
            </MenuItem>
            {Vertical?.map((v: any) => <MenuItem value={v?.id}>{v?.verticalName}</MenuItem>)}
          </Select>
          {touched.vertical3 && errors.vertical3 ? (<p className="form-error">{errors.vertical3}</p>) : null }

          <h2 className="phaseLable required" style={styling}>Category</h2>
          <Select
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
            size="small"
            className="w-85"
            name="category3"
            id="category3"
            value={values.category3 || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={BeditFlag}
            sx={BeditFlag && {
              backgroundColor: "#f3f3f3",
              borderRadius: "6px",
            }}
          >
            <MenuItem value="" style={{ display: "none" }}>
              <em>Select Category</em>
            </MenuItem>
            {Category?.map((v: any) => <MenuItem value={v?.id}>{v?.glCategoryName}</MenuItem>)}
          </Select>
          {touched.category3 && errors.category3 ? (<p className="form-error">{errors.category3}</p>) : null }

          <h2 className="phaseLable required" style={styling}>Branch</h2>
          <TextField
            id="branch3"
            name="branch3"
            variant="outlined"
            size="small"
            value={values?.branch3 || ""}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          {touched.branch3 && errors.branch3 ? (<p className="form-error">{errors.branch3}</p>) : null }
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button className="yes-btn" onClick={handleSubmitB}>{BeditFlag ? 'Update' : 'Submit'}</Button>
          <Button className="no-btn" onClick={handleCloseB}>Cancel</Button>
        </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default VerticalCategoryBranch;