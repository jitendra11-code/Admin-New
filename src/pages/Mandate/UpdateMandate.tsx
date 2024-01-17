import {
  Button,
  MenuItem,
  Stack,
  TextField,
  Grid,
} from "@mui/material";
import Select from "@mui/material/Select";
import axios from "axios";
import React, { useEffect } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { submit } from "shared/constants/CustomColor";
import regExpressionTextField, {
  textFieldValidationOnPaste,
  regExpressionRemark,
} from "@uikit/common/RegExpValidation/regForTextField";

const UpdateMandate = () => {
  const [data, setData] = React.useState<any>({});
  const [projectManager, setProjectManager] = React.useState([])

  const [branchType, setBranchType] = React.useState([])
  const [glCategories, setGlCategories] = React.useState([])

  const navigate = useNavigate();
  const getById = () => {
    axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/mandatesById?id=${window.location.pathname?.split("/")[3]
        }`
      )
      .then((response: any) => {
        setData(response?.data);
      })
      .catch((e: any) => {
      });
  }



  useEffect(() => {
    getById();
  }, []);

  const handleChange = (e: any) => {

    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const body = {
      "id": data?.id,
      "uid": "",
      "status": data?.status,
      "phaseId": data?.phaseId,
      "mandateCode": data?.mandateCode,
      "glCategoryId": 0,
      "branchId": 0,
      "pincode": "string",
      "state": "string",
      "region": "string",
      "district": "string",
      "city": "string",
      "location": "string",
      "tierName": "string",
      "remark": "string",
      "sourcingAssociate": "string",
      "projectManagerId": 0,
      "pM_Remarks": "string",
      "branchCode": "string",
      "completionPer": 0,
      "accept_Reject_Status": "string",
      "accept_Reject_Remark": "string",
      "createdBy": "string",
      "createdDate": "2022-11-15T09:56:47.913Z",
      "modifiedBy": "string",
      "modifiedDate": "2022-11-15T09:56:47.913Z"
    }
    axios
      .post(
        `${process.env.REACT_APP_BASEURL}/api/Mandates/UpdateMandates?id=${data?.id}`,
        data
      )
      .then((response: any) => {
        navigate("/mandate");
      })
      .catch((e: any) => {
      });
  };
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=BranchType`)
      .then((response: any) => {
        setBranchType(response?.data?.data)

      })
      .catch((e: any) => {

      });
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=GLCategory`)
      .then((response: any) => {
        setGlCategories(response?.data?.data)

      })
      .catch((e: any) => {
      });
    axios
      .get(`${process.env.REACT_APP_BASEURL}/api/Countries/getAllWithDataWithDesignation?RoleId=29`)
      .then((response: any) => {
        setProjectManager(response?.data?.data)

      })
      .catch((e: any) => {
      });
  }, [])
  return (
    <div>
     
      <div className="card-panal">
        <form onSubmit={handleSubmit}>
          <div className="phase-outer">
            <Grid
              marginBottom="30px"
              container
              item
              spacing={5}
              justifyContent="start"
              alignSelf="center"
            >
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Phase Code</h2>
                  <TextField
                    name="phaseId"
                    id="phaseId"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.phaseCode}
                    onChange={handleChange}
                    disabled
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Mandate Code</h2>
                  <TextField
                    name="mandateCode"
                    id="mandateCode"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.mandateCode}
                    onChange={handleChange}
                    disabled
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">GL Category</h2>
                  <Select
                   
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="glCategoryId"
                    id="glCategoryId"
                    value={data?.glCategoryId}
                    defaultValue={"1"}
                    onChange={handleChange}
                 
                  >
                  
                    {glCategories?.map(v => <MenuItem value={v?.id}>{v?.glCategoryName}</MenuItem>)}
                  </Select>
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Branch Type</h2>
                  <Select
                   
                    size="small"
                    className="w-85"
                    name="branchType"
                    id="branchType"
                    value={data?.branchTypeName}
                    defaultValue={"1"}
                    onChange={handleChange}
                  >
                    
                    {branchType?.map((v: any) => <MenuItem value={v?.id}>{v?.branchTypeName}</MenuItem>)}
                  </Select>
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable required">Pin Code</h2>
                  <TextField
                    autoComplete="off"
                    name="pincode"
                    id="pincode"
                    type="number"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.pincode}
                    InputProps={{ inputProps: { min: 0, maxLength: 6 } }}  
                    onKeyDown={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}                                   
                    onChange={handleChange}
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">State</h2>
                  <TextField
                    name="state"
                    id="state"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.state}
                    onChange={handleChange}
                    disabled
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code ==="Space")
                     {
                       e.preventDefault(); 
                     }
                   }}
                  
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Region</h2>
                  <TextField
                    name="region"
                    id="region"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.region}
                    onChange={handleChange}
                    disabled
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code ==="Space")
                     {
                       e.preventDefault(); 
                     }
                   }}
                  
                  />
                
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">District</h2>
                  <TextField
                    name="district"
                    id="district"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.district}
                    onChange={handleChange}
                    
                    disabled
                    onKeyDown={(e: any) => {
                      if (e.target.selectionStart === 0 && e.code ==="Space")
                     {
                       e.preventDefault(); 
                     }
                   }}
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">City</h2>
                  <TextField
                    name="city"
                    id="city"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.city}
                    onChange={handleChange}
                    disabled
                  
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable ">Location Name</h2>
                  <TextField
                    autoComplete="off"
                    name="location"
                    id="location"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.location}
                    onChange={handleChange}
                 
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Tier Name</h2>
                  <TextField
                    autoComplete="off"
                    name="tierName"
                    id="tierName"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.tierName}
                    onChange={handleChange}
                  
                  />
                 
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Remarks</h2>
                  <TextField
                    autoComplete="off"
                    name="remark"
                    id="remark"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.remark}
                    onChange={handleChange}
                  
                  />
                
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Project Manager</h2>
                  <Select
                   
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="projectManagerId"
                    id="projectManagerId"
                    value={data?.projectManagerName}
                    defaultValue={"Admin"}
                    onChange={handleChange}
                  >
                   
                    {projectManager?.map(v => <MenuItem value={v?.userName}>{v?.userName}</MenuItem>)}
                  </Select>
                </div>
              </Grid>

              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Project Manager Remarks</h2>
                  <TextField
                    name="projectManagerRemarks"
                    id="projectManagerRemarks"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.projectManagerRemarks}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Branch Code</h2>
                  <TextField
                    name="branchCode"
                    id="branchCode"
                    variant="outlined"
                    size="small"
                    className="w-85"
                    value={data?.branchCode}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <div className="input-form">
                  <h2 className="phaseLable">Sourcing Associate</h2>
                  <Select
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                    size="small"
                    className="w-85"
                    name="sourcingAssociate"
                    id="sourcingAssociate"
                    value={data?.sourcingAssociate || ""}
                    onChange={handleChange}
                  >
                    <MenuItem value={"1"}>1</MenuItem>
                  </Select>
                </div>
              </Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}></Grid>
              <Grid item xs={6} md={3} sx={{ position: "relative" }}></Grid>
            </Grid>
          </div>

          <Stack
            display="flex"
            flexDirection="row"
            justifyContent="center"
            sx={{ margin: "10px" }}
          >

            <Button
              variant="contained"
              type="submit"
              size="small"
              style={submit}
            >
              SUBMIT
            </Button>
          </Stack>
        </form>
      </div>
    </div>
  );
};

export default UpdateMandate;
