import React, { useCallback, useMemo, useState } from "react";
import {
  Button,
  Grid,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useUrlSearchParams } from "use-url-search-params";
import { useParams } from "react-router-dom";
import { accordionTitle, wishlistIcon } from "shared/constants/CustomColor";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import propertyImage from "../../assets/images/propertyImage.jpg";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import axios from "axios";
import AutoAwesomeMosaicIcon from "@mui/icons-material/AutoAwesomeMosaic";
import WindowIcon from "@mui/icons-material/Window";
import { useLocation, useNavigate } from "react-router-dom";
import DropdownMenu from "@uikit/common/DropdownMenu";
import { BiSearch } from "react-icons/bi";
import { FaSearch } from "react-icons/fa";
import { AiOutlineHome } from "react-icons/ai";
import { MdDeleteOutline } from "react-icons/md";
import { HiOutlineHome } from "react-icons/hi";
import { GrAdd } from "react-icons/gr";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { FiEdit2 } from "react-icons/fi";
import { RiShareForwardLine } from "react-icons/ri";
import { BsArrowRightShort } from "react-icons/bs";
import MandateInfo from "pages/common-components/MandateInformation";
import moment from "moment";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@auth0/auth0-react";
import { fetchError, showMessage } from "redux/actions";
import staticImage from "../../assets/images/noPropertyFound.jpeg"
import AddHomeIcon from '@mui/icons-material/AddHome';
import StarIcon from '@mui/icons-material/Star';
import regExpressionTextField, { regExpressionRemark, textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";

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

const PropertyView = (props: any) => {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const { id } = useParams()
  const [stat, setState] = useState("");
  const [propertyImages, setPropertyImages] = useState<any>([])
  const [city, setCity] = useState("");
  const [dist, setDist] = useState("");
  const [currentStatus, setCurrentStatus] = React.useState("")
  const [currentRemark, setCurrentRemark] = React.useState("");
  const [pincode, setpincode] = useState("");
  const [stateToggle, setToggle] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [propertyData, setPropertyData] = useState<any>([]);
  const [propertyImagesName, setPropertyImagesName] = useState<any>([]);
  const [images, setImages] = useState<any>([]);
  const [count, setCount] = useState<any>("");
  const [open, setOpen] = React.useState<any>(false);
  const [phase, setPhase] = React.useState<any>([]);
  const [mandate, setMandate] = React.useState<any>({});
  const [selectedPhase, setSelectedPhase] = useState("");
  const [selectedMandate, setSelectedMandate] = useState("");
  const [checkedMandate, setCheckedMandate] = useState(null)
  const [ids, setId] = useState("");
  const [mandateInfo, setMandateData] = React.useState(null);
  const [status, setStatus] = useState("");
  const [isDisable, setisDisable] = useState(true);
  const [assignModal, setAssignModal] = useState(false);
  const [removeModal, setRemoveModal] = useState(false);
  const [clickedData, setClickedData] = useState<any>({});
  const [dummyTest, setDummyTest] = useState("");
  const [params] = useUrlSearchParams({}, {});
  const [mandateCode, setMandateCode] = useState<any>(null)
  const [mandateList, setMandateList] = useState([])
  const [finalP, setFinalP] = useState<any>({})
  const [error, setError] = useState<any>({});
  const [fullFinal,setFullFinal]= useState<any>({});
  const dispatch = useDispatch()
  const [propertyStatus,setPropertyStatus] = useState(true);

  let path = window.location.pathname?.split("/");
  let module: any = window.location.pathname?.split("/")[path.length - 1];
  const { userActionList } = useSelector<AppState, AppState["userAction"]>(
    ({ userAction }) => userAction
  );

  const onValidation = () => {
    let regExp = new RegExp("^[1-9][0-9]*$");
    let temp = {};

    if (pincode == "" || pincode === null) {
      setError({ ...error, "pincode": "Please enter Pin Code" })
    }
    else if (!regExp.test(pincode)) {
      setError({ ...error, "pincode": "Pin Code should not start with 0" });
    }

    else if (pincode?.length < 6) {
      setError({ ...error, "pincode": "Pin Code must be 6 digit" })
    }
  }
  React.useEffect(() => {
    if (id && id !== 'noid') {
      setMandateCode(id)
    }
  }, [])


  const _getImage = async (id: number, type: string) => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/ImageStorage/RetriveImage?ImageId=${id || 0}&ImageType=${type}`
      )
      .then((response: any) => {
        if (response?.data?.base64String !== undefined) {
          var _obj = {
            "id": id,
            "image": `data:image/png;base64,${response?.data?.base64String}`
          }
          setPropertyImages(prevState => [...prevState, _obj]);
        } else {
          var _obj = {
            "id": id,
            "image": ""
          }
          setPropertyImages(prevState => [...prevState, _obj]);
        }
      })
      .catch((e: any) => {

      });

  }





  React.useEffect(() => {
    if (params?.source) {

    } else {
      setSelectedMandate("")
      setMandateCode(null)
      setpincode("")
      setMandateData(null)
      setMandateList([])
    }

  }, [module])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMandate("");
  };

  const getPhase = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=Phases`
      )
      .then((response: any) => {
        setPhase(response?.data?.data);
      })
      .catch((e: any) => {
      });
  };
  const getMandateList = () => {
    axios({
      method: "get",
      url: `${process.env.REACT_APP_BASEURL}/api/Mandates/DropDownMandetPhaseByRole?apiType=${""}`,
    })
      .then((res) => {
        if (res?.status === 200 && res?.data && res?.data?.length > 0) {
          setMandateList(res?.data);
        }
      })
      .catch((err) => { });
  };

  React.useEffect(() => {
    getMandateList()
  }, [])



  const getMandate = async () => {
    await axios
      .get(
        `${process.env.REACT_APP_BASEURL}/api/Common/GetAllPredicates?tablename=Mandates`
      )
      .then((response: any) => {
        setMandate(response?.data?.data);
      })
      .catch((e: any) => {
      });
  };

  React.useEffect(() => {
    getPhase();
    getMandate();

  }, []);

  const getData = async () => {

    if (mandateCode && mandateCode?.id !== undefined) {
      localStorage.setItem("mandateId", mandateCode?.id);
      await axios
        .get(
          `${process.env.REACT_APP_BASEURL
          }/api/PropertyPool/GetAllPropertyPools?pincode=${pincode || mandateInfo?.pincode || ""}&state=${stat || ""}&city=${city || ""}&district=${dist || ""}&mandateid=${mandateCode?.id ? mandateCode?.id : selectedMandate
          }`
        )
        .then((response: any) => {
          setPropertyData(response?.data?.List);

          response?.data?.List && response?.data?.List?.map((item) => {
            _getImage(item?.propertyImageDetailsId, "PropertyFrontView")
          })

          let finalP = response?.data?.List?.find((v: any) => v?.status == "Approve")
          setFinalP(finalP)
          setCount(
            response?.data?.List?.filter((v: any) => v?.status == "Assigned" && v?.saveAsDraft == false)
              ?.length
          );
          localStorage.removeItem("mandateId");

          axios
          .get(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/GetFinalProperty?mandateid=${mandateCode?.id ? mandateCode?.id : selectedMandate}`)
          .then((response:any)=>{
            if(!response) return;
            if(response && response?.data)
            {
              setFullFinal(response?.data[0]);
            }
          })
          .catch((e: any) => {
          });
        })
        .catch((e: any) => {
        });
    } else if (pincode && pincode !== undefined) {
      onValidation();
      if (`${error["pincode"]}` === "") {
        await axios
          .get(
            `${process.env.REACT_APP_BASEURL
            }/api/PropertyPool/GetAllPropertyPools?pincode=${pincode || mandateInfo?.pincode || ""}&state=${stat || ""}&city=${city || ""}&district=${dist || ""}&mandateid=${mandateCode?.id ? mandateCode?.id : selectedMandate
            }`
          )
          .then((response: any) => {
            setPropertyData(response?.data?.List);
            response?.data?.List && response?.data?.List.map((item) => {
              _getImage(item?.propertyImageDetailsId, "PropertyFrontView")
            })
            if (response?.data?.List?.length == 0) {
              dispatch(fetchError("Property not found!"))
            }
            let finalP = response?.data?.List?.find((v: any) => v?.status == "Approve")
            setFinalP(finalP)
            setCount(
              response?.data?.List?.filter((v: any) => v?.status == "Assigned" && v?.saveAsDraft == false)
                ?.length
            );
          })
          .catch((e: any) => {
          });
      }
    }
    else {
      await axios
        .get(
          `${process.env.REACT_APP_BASEURL
          }/api/PropertyPool/GetAllPropertyPools?pincode=${pincode || mandateInfo?.pincode || ""}&state=${stat || ""}&city=${city || ""}&district=${dist || ""}&mandateid=${mandateCode?.id ? mandateCode?.id : selectedMandate
          }`
        )
        .then((response: any) => {
          setPropertyData(response?.data?.List);
          if (response?.data?.List?.length == 0) {
            dispatch(fetchError("Property not found!"))
          }
          let finalP = response?.data?.List?.find((v: any) => v?.status == "Approve")
          setFinalP(finalP)
          setCount(
            response?.data?.List?.filter((v: any) => v?.status == "Assigned" && v?.saveAsDraft == false)
              ?.length
          );
        })
        .catch((e: any) => {
        });
    }

  };
  React.useEffect(() => {
    if (mandateCode && mandateCode?.id !== undefined && pincode) {
      getData();

    }
  }, [mandateCode, mandateInfo]);
  React.useEffect(() => {
    if (count == 3 || count == 5 || count == 4) {
      setisDisable(false);
    }
  }, [count]);


 


  const assignProperty = async () => {

    if (mandateCode?.id) {
      assignMandate(clickedData?.id, clickedData?.status);
      setAssignModal(false);
    } else if (clickedData?.status === "Assigned") {
      assignMandate(clickedData?.id, clickedData?.status);
      setAssignModal(false);
    } else {
      modalOpen(clickedData);
      setAssignModal(false);
    }
    await axios
            .post(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/UpdateIsRejectedEditInMappingHistory?PropertyId=${clickedData?.id}&MandateId=${mandateCode?.id}`)
            .then((response) => {
              if(!response){
                dispatch(fetchError("Error occurred"));
                return;
            }
            if(response && response?.data?.code === 200 && response?.data?.status === true) {
                // dispatch(showMessage(response?.data?.message));
                return;
            }
            else{
                // dispatch(fetchError(response?.data?.message));
                return;
            }

          })
          .catch((err) => {
          });
  };
  const removeProperty = () => {
    if (mandateCode?.id) {
      assignMandate(clickedData?.id, clickedData?.status);
      setRemoveModal(false);
    } else if (clickedData?.status === "Assigned") {
      assignMandate(clickedData?.id, clickedData?.status);
      setRemoveModal(false);
    } else {
      modalOpen(clickedData);
      setRemoveModal(false);
    }
  };

  const _getRuntimeId = (id) => {
    const userAction = userActionList && userActionList?.find(item => item?.mandateId === parseInt(id) && item?.module === module);
    return userAction?.runtimeId || 0;
  }



  const workflowAPICall = () => {

    const body = {
      runtimeId: _getRuntimeId(mandateCode?.id) || 0,
      mandateId: mandateCode?.id || 0, 
      tableId: mandateCode?.id || 0,
      remark: "Submitted" || "",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: "Created" || "" 
    };


    axios.post(`${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ""}`).then((response: any) => {
      if (!response) return;
      dispatch(showMessage("Submitted Successfully!"))
      navigate("/list/task")


    })
  }

  const workflowAPICallPNF = () => {

    const body = {
      runtimeId: _getRuntimeId(mandateCode?.id) || 0,
      mandateId: mandateCode?.id || 0, 
      tableId: mandateCode?.id || 0,
      remark: "Submitted" || "",
      createdBy: user?.UserName,
      createdOn: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
      action: "Property Not Found" || "" 
    };


    axios.post(`${process.env.REACT_APP_BASEURL}/api/Workflow/Workflow?runtimeId=${body?.runtimeId}&mandateId=${body?.mandateId}&tableId=${body?.mandateId}&createdBy=${body?.createdBy}&createdOn=${body.createdOn}&action=${body?.action}&remark=${body?.remark || ""}`).then((response: any) => {
      if (!response) return;
      dispatch(showMessage("Proceed Successfully!"))
      navigate("/list/task")
    })
  }

  const assignMandate = async (id: any, status: any) => {

    if (mandateCode?.id || selectedMandate) {

      await axios
        .post(
          `${process.env.REACT_APP_BASEURL
          }/api/PropertyPool/UpdatePropertyPoolStatus?id=${id}&status=${status == "Available" ? "Assigned" : "Available"
          }&MandateId=${mandateCode?.id ? mandateCode?.id : selectedMandate
          }`,
          {}
        )
        .then((response: any) => {
          if (!response) return

          getData();
          handleClose();
          setSelectedMandate("");
          setSelectedPhase("");

        })
        .catch((e: any) => {
        });
    } else {
      await axios
        .post(
          `${process.env.REACT_APP_BASEURL
          }/api/PropertyPool/UpdatePropertyPoolStatus?id=${id}&status=${status == "Available" ? "Assigned" : "Available"
          }`,
          {}
        )
        .then((response: any) => {
          getData();
          handleClose();
          setSelectedMandate("");
          setSelectedPhase("");

        })
        .catch((e: any) => {
        });
    }
  };

  const handleChangeDropdown = (event: any) => {
    setState(event.target.value);

  };
  const handleChangeDropdownCity = (event: any) => {
    setCity(event.target.value);
  };
  const handleChangeDropdownDist = (event: any) => {
    setDist(event.target.value);
  };

  const modalOpen = (v) => {
    handleClickOpen();
    setId(v?.id);
    setStatus(v?.status);
  };

  const asAssign = (v, status) => {

    if (status == "assign") {
      setAssignModal(true);
    } else {
      setRemoveModal(true);
    }
    setClickedData(v);
  };


  return (
    <>
      {window.location.pathname?.includes("property-tagging") && (
        <Grid
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <Box
            component="h2"
            className="page-title-heading my-6"
          >
            Property Tagging
          </Box>
        </Grid>
      )}
      {window.location.pathname?.includes("view") && (
        <Grid
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <Box
            component="h2"
            className="page-title-heading my-6"
          >
            View / Update property
          </Box>
        </Grid>
      )}

      <div
        style={{
          backgroundColor: "#fff",
          padding: "0px",
          border: "1px solid #0000001f",
          borderRadius: "5px",
        }}
      >
        <div className="property-view inside-scroll-180">
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>

          </div>

          <MandateInfo mandateCode={mandateCode}
            source=""
            pageType={props?.pageType || ""}
            setMandateData={setMandateData}
            redirectSource={`${params?.source}`}
            setMandateCode={setMandateCode}
            setpincode={setpincode}
            setCurrentStatus={setCurrentStatus}
            setCurrentRemark={setCurrentRemark}
          />

          <div style={{}}>
            <Grid
              marginBottom="15px"
              container
              item
              spacing={3}
              justifyContent="start"
              alignSelf="center"
              alignItems="center"
            >
              <Grid item xs={5} md={12}>
                <Grid
                  container
                  item
                  spacing={5}
                  justifyContent="start"
                  alignSelf="center"
                >
                  <Grid item xs={6} md={2}>
                    <TextField
                      type="text"
                      label="State"
                      id="state"

                      name="state"
                      style={{ marginTop: "4px" }}
                      
                      value={stat}
                      size="small"
                      placeholder="state"
                      onKeyDown={(e: any) => {
                        regExpressionTextField(e)
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                      onChange={(e: any) => setState(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      type="text"
                      label="City"
                      id="city"

                      name="city"
                      style={{ marginTop: "4px" }}
                      value={city}
                      size="small"
                      placeholder="city"
                      onChange={(e: any) => setCity(e.target.value)}
                      onKeyDown={(e: any) => {
                        regExpressionTextField(e)
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      type="text"
                      label="District"
                      id="district"

                      name="district"
                      style={{ marginTop: "4px" }}
                      
                      value={dist}
                      size="small"
                      placeholder="district"
                      onChange={(e: any) => setDist(e.target.value)}
                      onKeyDown={(e: any) => {
                        regExpressionTextField(e)
                      }}
                      onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                          dispatch(fetchError("You can not paste Spacial characters"))
                        }
                      }}
                    />

                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      type="text"
                      label="Pin Code"
                      id="Pincode"

                      name="pincode"
                      style={{ marginTop: "4px" }}
                      
                      value={pincode}
                      size="small"
                      placeholder="Pin Code"
                      onChange={(e: any) => {
                        setpincode(e.target.value)
                        if (e.target.value === null) {
                          delete error["pincode"];
                          setError({ ...error });
                        } else {
                          setError({
                            ...error,
                            ["pincode"]: "",
                          });
                        }
                      }}
                      onBlur={onValidation}
                      InputProps={{ inputProps: { min: 0, maxLength: 6 } }}
                      onKeyDown={(event) => {
                        if (!/[0-9]/.test(event.key) && event.key !== "Backspace") {
                          event.preventDefault();
                        }
                      }}
                    />
                    {error?.pincode &&
                      error?.pincode ? (
                      <p className="form-error">
                        {error?.pincode}
                      </p>
                    ) : null}
                  </Grid>
                  <Grid item xs={6} md={1}>
                    <div className="list-button search-btn" onClick={getData}>
                      Search
                    </div>
                  </Grid>
                  <Grid item xs={6} md={1}>
                    <div style={{ width: "40px" }}
                      className="list-button"
                      onClick={() => {
                        setToggle(!stateToggle);
                      }}
                    >
                      {" "}
                      {stateToggle ? (
                        <>
                          <AutoAwesomeMosaicIcon />
                        </>
                      ) : (
                        <>
                          <WindowIcon />
                        </>
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={6} md={1}>
                    <Button style={{ minWidth: "100px" }} className="list-button" onClick={() => mandateCode ?
                      navigate(`/property-pool/${mandateCode?.id}/add?source=${params?.source}`, { state: { addPropertySource: "propertyAddMandate" } })
                      : dispatch(fetchError("Please select mandate"))}>
                      <AddCircleIcon style={{ fontSize: "22px" }} />
                      Property
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

            
            </Grid>
          </div>

          <div>
            <Box
              component="h2"
              sx={{
                fontSize: 15,
                color: "text.primary",
                fontWeight: "600",
                marginBottom: "15px !important",
                mb: {
                  xs: 2,
                  lg: 4,
                },
              }}
            >
              Top Properties
            </Box>
            {stateToggle ? (
              <Grid
                container
                item
                spacing={5}
                justifyContent="start"
                alignSelf="center"
              >
                {propertyData?.length > 0 ? (
                  propertyData?.map((v: any) => (
                    <Grid item xs={6} md={3}>
                      <Card sx={{ maxWidth: 345, position: "relative", border: v?.status == "Approve" && "2px solid green" }}>
                        <CardMedia
                          onError={(e) => e.currentTarget.src = staticImage}
                          component="img"
                          alt="green iguana"
                          height="140"
                          style={{ height: "170px" }}
                          image={(propertyImages && propertyImages?.length > 0 && propertyImages?.find(item => item?.id === v?.propertyImageDetailsId)?.image) || staticImage}
                        />
                        {v?.id == fullFinal?.id ? (
                        <div
                          style={{
                            marginLeft: 10,
                            borderRadius: 50,
                            borderColor: "#00316a",
                            backgroundColor: "white",
                            position: "absolute",
                            top: "6px",
                            right: "280px",
                            width: "25px",
                            height: "25px",
                            // cursor: "pointer",
                          }}
                        >
                          <StarIcon/>
                        </div>) : null
                        }
                        <div
                          style={{
                            marginLeft: 10,
                            padding: "7px 7px",
                            borderRadius: 50,
                            color: "#fff",
                            borderColor: "#00316a",
                            backgroundColor: "#00316a",
                            position: "absolute",
                            top: "6px",
                            right: "40px",
                            width: "30px",
                            height: "30px",
                            cursor: "pointer",
                          }}
                          className="tooltip"
                          onClick={async () => {
                            if (mandateCode && mandateCode?.id === undefined) {
                              dispatch(fetchError("Please select mandate"))
                              return
                            }
                            // navigate(`/property-pool/${mandateCode?.id || v?.mandateId}/add?propertyId=${v?.id}&status=${v?.status}`)
                            await axios
                            .get(`${process.env.REACT_APP_BASEURL}/api/PropertyPool/GetPropertyStatus?PropertyId=${v?.id}&MandateId=${mandateCode?.id || v?.mandateId || ''}`)
                            .then((response: any) => {
                              if (!response) return;
                              if (response && response?.data?.status == false) {
                                navigate(`/property-pool/${mandateCode?.id || v?.mandateId}/add?propertyId=${v?.id}&status=Approve`)
                              }
                              else {
                                navigate(`/property-pool/${mandateCode?.id || v?.mandateId}/add?propertyId=${v?.id}&status=${v?.status}`)
                              }
                            })
                            .catch((e: any) => {
                              dispatch(fetchError("Error Occurred !"));
                            });
                          }}

                        >
                          <FiEdit2 />
                        </div>
                        {v?.status !== "Assigned" && v?.saveAsDraft === false ? (
                          <div
                            onClick={() => !finalP && asAssign(v, "assign")}
                            style={{
                              marginLeft: 10,
                              padding: "4px",
                              borderRadius: 50,
                              color: "#fff",
                              borderColor: "#00316a",
                              backgroundColor: finalP ? "gray" : "#00316a",
                              position: "absolute",
                              top: "6px",
                              right: "6px",
                              width: "30px",
                              height: "30px",
                              cursor: !finalP ? "pointer" : "auto",
                            }}
                            className="tooltip"
                            title={
                              v?.status === "Assigned" ? "Remove " : "Assign "
                            }
                          >
                            <AddHomeIcon sx={{ fontSize: 20 }} />
                          </div>
                        ) : (<>
                          {v?.saveAsDraft === false && <div
                            onClick={() => asAssign(v, "remove")}
                            style={{
                              marginLeft: 10,
                              padding: "7px 7px",
                              borderRadius: 50,
                              color: "#fff",
                              borderColor: "#00316a",
                              backgroundColor: "red",
                              position: "absolute",
                              top: "6px",
                              right: "6px",
                              width: "30px",
                              height: "30px",
                              cursor: "pointer",
                            }}
                            className="tooltip"
                            title={
                              v?.status === "Assigned" ? "Remove " : "Assign "
                            }
                          >
                            <MdDeleteOutline />
                          </div>}
                        </>
                        )}
                        <CardContent>
                          <Typography gutterBottom variant="h5" component="div">
                            {v?.nameOfTheBuilding}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {v?.floorNumberInBuilding} {v?.premisesAddress}
                            <br />
                            {v?.state} {v?.pinCode}.
                          </Typography>
                        </CardContent>
                        <Divider />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            Monthly Rental
                          </Typography>
                          <Typography gutterBottom variant="h4" component="div">
                            {v?.rpm}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <h3
                    style={{
                      display: "grid",
                      placeItems: "center",
                      height: "40vh",
                      width: "100vw",
                    }}
                  >
                    No Data Found
                  </h3>
                )}
              </Grid>
            ) : (
              <div className="grid-card">
                {propertyData?.length > 0 ? (
                  propertyData?.map((v: any) => (
                    <Card style={{ border: v?.id == finalP?.id && "2px solid green" }}>
                      <Grid
                        container
                        item
                        spacing={5}
                        justifyContent="start"
                        alignSelf="center"
                        position="relative"

                      >
                        <Grid item xs={6} md={4} >
                          <CardMedia
                            onError={(e) => e.currentTarget.src = staticImage}
                            component="img"
                            sx={{ width: "100%" }}
                            alt="Live from space album cover"
                            style={{ height: "250px" }}
                            image={(propertyImages && propertyImages?.length > 0 && propertyImages?.find(item => item?.id === v?.propertyImageDetailsId)?.image) || staticImage}
                          />
                        </Grid>
                        <Grid item xs={6} md={8}>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <CardContent>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  gutterBottom
                                  variant="h5"
                                  component="div"
                                >
                                  {v?.nameOfTheBuilding}
                                </Typography>
                                <div
                                style={{
                                    marginLeft: 10,
                                    padding: "7px 7px",
                                    borderRadius: 50,
                                    color: "#fff",
                                    borderColor: "#00316a",
                                    backgroundColor: "#00316a",
                                    position: "absolute",
                                    top: "30px",
                                    right: "40px",
                                    width: "30px",
                                    height: "30px",
                                    cursor: "pointer",
                                  }}
                                  className="tooltip"
                                  onClick={() => {
                                    if (mandateCode && mandateCode?.id === undefined) {
                                      dispatch(fetchError("Please select mandate"))
                                      return
                                    }
                                    navigate(`/property-pool/${mandateCode?.id}/add?propertyId=${v?.id}`)

                                  }}
                                >
                                  <FiEdit2 />
                                </div>
                                {v?.status !== "Assigned" && v?.saveAsDraft === false ? (
                                  <div
                                    onClick={() => !finalP && asAssign(v, "assign")}
                                    style={{
                                      marginLeft: 10,
                                      padding: "4px",
                                      borderRadius: 50,
                                      color: "#fff",
                                      borderColor: "#00316a",
                                      backgroundColor: finalP ? "gray" : "#00316a",
                                      position: "absolute",
                                      top: "30px",
                                      right: "6px",
                                      width: "30px",
                                      height: "30px",
                                      cursor: !finalP ? "pointer" : "auto",
                                    }}
                                    className="tooltip"
                                    title={
                                      v?.status === "Assigned"
                                        ? "Remove "
                                        : "Assign "
                                    }
                                  >
                                    <AddHomeIcon sx={{ fontSize: 20 }} />
                                  </div>) : (<>
                                    {v?.saveAsDraft === false &&
                                      <div
                                        onClick={() => asAssign(v, "remove")}
                                        style={{
                                          marginLeft: 10,
                                          padding: "7px 7px",
                                          borderRadius: 50,
                                          color: "#fff",
                                          borderColor: "#00316a",
                                          backgroundColor: "red",
                                          position: "absolute",
                                          top: "30px",
                                          right: "6px",
                                          width: "30px",
                                          height: "30px",
                                          cursor: "pointer",
                                        }}
                                        className="tooltip"
                                        title={
                                          v?.status === "Assigned"
                                            ? "Remove "
                                            : "Assign "
                                        }
                                      >
                                        <MdDeleteOutline />
                                      </div>}
                                  </>
                                )}
                              </div>
                              <Typography
                                sx={{ fontSize: "13px" }}
                                color="text.secondary"
                              >
                                {v?.floorNumberInBuilding} {v?.premisesAddress}
                                <br />
                                {v?.state} {v?.pinCode}.
                              </Typography>
                              <Typography
                                color="text.secondary"
                                sx={{ margin: "10px 0px", fontSize: "13px" }}
                              >
                                {v?.rccStrongRoomBuildComments}
                              </Typography>
                              <Grid
                                container
                                item
                                spacing={5}
                                justifyContent="start"
                                alignSelf="center"
                              >
                                <Grid item xs={6} md={3}>
                                  <Typography
                                    sx={{ fontSize: "13px" }}
                                    color="text.secondary"
                                  >
                                    Monthly Rental
                                  </Typography>
                                  <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                  >
                                    {v?.rpm}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography
                                    sx={{ fontSize: "13px" }}
                                    color="text.secondary"
                                  >
                                    Status
                                  </Typography>
                                  <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                  >
                                    {v?.propertyStatus == 1
                                      ? "Ready"
                                      : "Under Construction"}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography
                                    sx={{ fontSize: "13px" }}
                                    color="text.secondary"
                                  >
                                    Area
                                  </Typography>
                                  <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                  >
                                    {v?.totalCarpetAreaInSFT} sft.
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography
                                    sx={{ fontSize: "13px" }}
                                    color="text.secondary"
                                  >
                                    Country
                                  </Typography>
                                  <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                  >
                                    {v?.country}
                                  </Typography>
                                </Grid>
                              </Grid>
                              <Divider sx={{ margin: "5px 0px" }} />
                              <Grid
                                container
                                item
                                spacing={5}
                                justifyContent="start"
                                alignSelf="center"
                              >
                                <Grid item xs={6} md={3}>
                                  <Typography
                                    sx={{ fontSize: "13px" }}
                                    color="text.secondary"
                                  >
                                    State
                                  </Typography>
                                  <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                  >
                                    {v?.state}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography
                                    sx={{ fontSize: "13px" }}
                                    color="text.secondary"
                                  >
                                    City
                                  </Typography>
                                  <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                  >
                                    {v?.city}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography
                                    sx={{ fontSize: "13px" }}
                                    color="text.secondary"
                                  >
                                    District
                                  </Typography>
                                  <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                  >
                                    {v?.disctrict}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                  <Typography
                                    sx={{ fontSize: "13px" }}
                                    color="text.secondary"
                                  >
                                    Pin Code
                                  </Typography>
                                  <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                  >
                                    {v?.pinCode}
                                  </Typography>
                                </Grid>
                              </Grid>
                              <Divider sx={{ margin: "5px 0px" }} />
                            </CardContent>
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  ))
                ) : (
                  <h3
                    style={{
                      display: "grid",
                      placeItems: "center",
                      height: "40vh",
                      width: "80vw",
                    }}
                  >
                    No Data Found
                  </h3>
                )}
              </div>
            )}
          </div>
          {mandateCode?.id && !finalP && (
            <div className="bottom-fix-btn">

              {!(count == 3 || count == 5 || count == 4) ? (
                <Button
                  variant="outlined"
                  size="medium"
                  style={{
                    marginLeft: 10,
                    padding: "5px 20px",
                    borderRadius: 6,
                    color: "#fff",
                    borderColor: "gray",
                    backgroundColor: "gray",
                  }}

                >
                  <HiOutlineHome size={16} /> &nbsp; Proceed &nbsp;{" "}
                  {count && <span className="rounded">{count}</span>}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="medium"
                  style={{
                    marginLeft: 10,
                    padding: "5px 20px",
                    borderRadius: 6,
                    color: "#fff",
                    borderColor: "#00316a",
                    backgroundColor: "#00316a",
                  }}
                  onClick={(e) => { workflowAPICall() }}
                >
                  <HiOutlineHome size={16} /> &nbsp; Proceed &nbsp;{" "}
                  <span className="rounded">{count}</span>
                </Button>
              )}
              <Button
                variant="outlined"
                size="medium"
                style={{
                  marginLeft: "10px",
                  padding: "5px 20px",
                  borderRadius: 6,
                  color: "#fff",
                  borderColor: count === 0 ? "#00316a" : "gray",
                  backgroundColor: count === 0 ? "#00316a" : "gray",
                }}
                // onClick={() => {
                //   workflowAPICallPNF()
                // }}
                disabled={count > 0}
              >
                Property Not Found
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog className="dialog-wrap"
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent style={{ width: "400px" }}>
          <DialogContentText
            id="alert-dialog-description"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "50px",
            }}
          >

            <DropdownMenu
              state={selectedMandate}
              handleChange={(e: any) => setSelectedMandate(e.target.value)}
              title="Select Mandate"
              menu={mandateList?.map((v: any) => v?.mandatePhaseCode)}
              name="mandate"
              id="mandate"
              value="Maharastra"
              onBlur={() => { }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <div className="button-wrap">
            <Button className="no-btn"
              variant="outlined"
              size="medium"
              style={{
                padding: "5px 20px",
                borderRadius: 6,
                color: "#00316a",
                borderColor: "#00316a",
              }}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button className="yes-btn"
              variant="outlined"
              size="medium"
              style={{
                marginLeft: 10,
                padding: "5px 20px",
                borderRadius: 6,
                color: "#fff",
                borderColor: "#00316a",
                backgroundColor: "#00316a",
              }}
              onClick={() => assignMandate(ids, status)}
            >
              Proceed
            </Button>
          </div>
        </DialogActions>
      </Dialog>
      <Dialog className="dialog-wrap"
        open={assignModal}
        keepMounted
        onClose={() => setAssignModal(false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to assign this property?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button className="no-btn" onClick={() => setAssignModal(false)}>Cancel</Button>
          <Button className="yes-btn" onClick={() => assignProperty()}>Yes</Button>
        </DialogActions>
      </Dialog>

      <Dialog className="dialog-wrap"
        open={removeModal}
        keepMounted
        onClose={() => setRemoveModal(false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to remove this property?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="button-wrap">
          <Button className="no-btn" onClick={() => setRemoveModal(false)}>Cancel</Button>
          <Button className="yes-btn" onClick={() => removeProperty()}>Yes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PropertyView;
