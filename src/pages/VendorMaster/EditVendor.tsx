import { Autocomplete, Box, Button, Grid, TextField } from "@mui/material";
import regExpressionTextField from "@uikit/common/RegExpValidation/regForTextField";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import axios from "axios";
import { useFormik } from "formik";
import moment from "moment";
import React, { useEffect, useState } from "react"; 
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchError, showMessage } from "redux/actions";
import { primaryButtonSm } from "shared/constants/CustomColor";
import * as Yup from "yup";

export default function EditVendor() {
    const {id}=useParams();
    const { user } = useAuthUser();
    const [VendorListByID,setVendorListByID] = useState([]);
    const [PartnerCategory,setPartnerCategory] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const getPartnerCategory = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/InitiateLOI/GetPartnerCategory`)
            .then((response : any)=>{
                setPartnerCategory(response?.data || []);
            })
            .catch((e:any) => {});
    }

    const getVendorListByID = async () => {
        await axios
            .get(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/GetVendorListByID?id=${id}`)
            .then((response : any)=>{
                setVendorListByID(response?.data[0] || []);
                setFieldValue("partnerCategory",response?.data[0]?.partnerCategory);
                setFieldValue("agencyName",response?.data[0]?.agencyName);
                setFieldValue("agencyContactNo",response?.data[0]?.agencyContactNo);
                setFieldValue("agencyEmail",response?.data[0]?.agencyEmail);
                setFieldValue("agencyAddress",response?.data[0]?.agencyAddress);
                setFieldValue("dutyHour",response?.data[0]?.dutyHour);
                setFieldValue("spoC1Name",response?.data[0]?.spoC1Name);
                setFieldValue("spoC1ContactNo",response?.data[0]?.spoC1ContactNo);
                setFieldValue("spoC1AltContactNo",response?.data[0]?.spoC1AltContactNo);
                setFieldValue("spoC1Email",response?.data[0]?.spoC1Email);
                setFieldValue("spoC2Name",response?.data[0]?.spoC2Name);
                setFieldValue("spoC2ContactNo",response?.data[0]?.spoC2ContactNo);
                setFieldValue("spoC2AltContactNo",response?.data[0]?.spoC2AltContactNo);
                setFieldValue("escalationL1Name",response?.data[0]?.escalationL1Name);
                setFieldValue("escalationL1ContactNo",response?.data[0]?.escalationL1ContactNo);
                setFieldValue("escalationL1Email",response?.data[0]?.escalationL1Email);
                setFieldValue("l1EscalationTAT",response?.data[0]?.l1EscalationTAT);
                setFieldValue("l1EscalationPenalty",response?.data[0]?.l1EscalationPenalty);
                setFieldValue("escalationL2Name",response?.data[0]?.escalationL2Name);
                setFieldValue("escalationL2ContactNo",response?.data[0]?.escalationL2ContactNo);
                setFieldValue("escalationL2Email",response?.data[0]?.escalationL2Email);
                setFieldValue("l2EscalationTAT",response?.data[0]?.l2EscalationTAT);
                setFieldValue("l2EscalationPenalty",response?.data[0]?.l2EscalationPenalty);
                setFieldValue("escalationL3Name",response?.data[0]?.escalationL3Name);
                setFieldValue("escalationL3ContactNo",response?.data[0]?.escalationL3ContactNo);
                setFieldValue("escalationL3Email",response?.data[0]?.escalationL3Email);
                setFieldValue("l3EscalationTAT",response?.data[0]?.l3EscalationTAT);
                setFieldValue("l3EscalationPenalty",response?.data[0]?.l3EscalationPenalty);
                setFieldValue("blfPurchaseEscalationName",response?.data[0]?.blfPurchaseEscalationName);
                setFieldValue("blfPurchaseEscalationContactNo",response?.data[0]?.blfPurchaseEscalationContactNo);
                setFieldValue("blfPurchaseEscalationEmail",response?.data[0]?.blfPurchaseEscalationEmail);
                setFieldValue("blfPurchaseEscalationTAT",response?.data[0]?.blfPurchaseEscalationTAT);
                setFieldValue("blfPurchaseEscalationPenalty",response?.data[0]?.blfPurchaseEscalationPenalty);
            })
            .catch((e:any) => {});
    };

    useEffect(() =>{
        getVendorListByID();
        getPartnerCategory();
    },[]);

    const validateSchema = Yup.object({
        partnerCategory: Yup.string().nullable().required("Please select Partner Category"),
        agencyName: Yup.string().nullable().required("Please enter Agency Name"),
        spoC1Name: Yup.string().nullable().required("Please enter SPOC1 Name"),
        spoC1ContactNo: Yup.string().nullable().required("Please enter SPOC1 ContactNo"),
        spoC1Email: Yup.string().nullable().required("Please enter SPOC1 Email"),
      });

    const {
        values,
        handleBlur,
        setFieldValue,
        handleChange,
        handleSubmit,
        errors,
        touched,
        resetForm,
      } = useFormik({
        initialValues: {
            partnerCategory: '',
            agencyName: '',
            agencyContactNo: '',
            agencyEmail: '',
            agencyAddress: '',
            dutyHour:'',
            spoC1Name:'',
            spoC1ContactNo:'',
            spoC1AltContactNo:'',
            spoC1Email:'',
            spoC2Name:'',
            spoC2ContactNo:'',
            spoC2AltContactNo:'',
            escalationL1Name:'',
            escalationL1ContactNo:'',
            escalationL1Email:'',
            l1EscalationTAT:'',
            l1EscalationPenalty:'',
            escalationL2Name:'',
            escalationL2ContactNo:'',
            escalationL2Email:'',
            l2EscalationTAT:'',
            l2EscalationPenalty:'',
            escalationL3Name:'',
            escalationL3ContactNo:'',
            escalationL3Email:'',
            l3EscalationTAT:'',
            l3EscalationPenalty:'',
            blfPurchaseEscalationName:'',
            blfPurchaseEscalationContactNo:'',
            blfPurchaseEscalationEmail:'',
            blfPurchaseEscalationTAT:'',
            blfPurchaseEscalationPenalty:'',
          },
          validationSchema: validateSchema,
          validateOnChange: true,
          validateOnBlur: true,
          onSubmit: (values, action) =>{
            const body = {
                partnerCategory: values?.partnerCategory,
                agencyName: values?.agencyName,
                agencyContactNo: values?.agencyContactNo || null,
                agencyEmail: values?.agencyEmail || null,
                agencyAddress: values?.agencyAddress || null,
                dutyHour:values?.dutyHour || null,
                spoC1Name:values?.spoC1Name,
                spoC1ContactNo:values?.spoC1ContactNo,
                spoC1AltContactNo:values?.spoC1AltContactNo || null,
                spoC1Email:values?.spoC1Email,
                spoC2Name:values?.spoC2Name || null,
                spoC2ContactNo:values?.spoC2ContactNo || null,
                spoC2AltContactNo:values?.spoC2AltContactNo || null,
                escalationL1Name:values?.escalationL1Name || null,
                escalationL1ContactNo:values?.escalationL1ContactNo || null,
                escalationL1Email:values?.escalationL1Email || null,
                l1EscalationTAT:values?.l1EscalationTAT || null,
                l1EscalationPenalty:values?.l1EscalationPenalty || null,
                escalationL2Name:values?.escalationL2Name || null,
                escalationL2ContactNo:values?.escalationL2ContactNo || null,
                escalationL2Email:values?.escalationL2Email || null,
                l2EscalationTAT:values?.l2EscalationTAT || null,
                l2EscalationPenalty:values?.l2EscalationPenalty || null,
                escalationL3Name:values?.escalationL3Name || null,
                escalationL3ContactNo:values?.escalationL3ContactNo || null,
                escalationL3Email:values?.escalationL3Email || null,
                l3EscalationTAT:values?.l3EscalationTAT || null,
                l3EscalationPenalty:values?.l3EscalationPenalty || null,
                blfPurchaseEscalationName:values?.blfPurchaseEscalationName || null,
                blfPurchaseEscalationContactNo:values?.blfPurchaseEscalationContactNo || null,
                blfPurchaseEscalationEmail:values?.blfPurchaseEscalationEmail || null,
                blfPurchaseEscalationTAT:values?.blfPurchaseEscalationTAT || null,
                blfPurchaseEscalationPenalty:values?.blfPurchaseEscalationPenalty || null,
                uid : "uid",
                createdBy : user?.UserName,
                createdDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
                modifiedBy: user?.UserName,
                modifiedDate : moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
                id : id,
                mandateId : VendorListByID["mandateId"],
                partnerId : VendorListByID["partnerId"],
                agreementId : VendorListByID["agreementId"],
                status : VendorListByID["status"],
            }

            axios
                .post(`${process.env.REACT_APP_BASEURL}/api/VendorAllocation/UpdateVendorPartnerMaster`, body)
                .then((response : any )=>{
                    if(!response)
                    {
                        dispatch(fetchError("Vendor Master details not updated successfully"));
                        navigate(`/vendor-master`);
                        return;
                    }
                    if(response && response?.data?.code === 200 && response?.data?.status === true)
                    {
                        dispatch(showMessage("Vendor Master details updated successfully"));
                        navigate(`/vendor-master`);
                        return;
                    }
                    else
                    {
                        dispatch(fetchError("Vendor Master details not updated successfully"));
                        navigate(`/vendor-master`);
                        return;
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError("Error Occurred !"));
                    navigate(`/vendor-master`);
                  });
          },
      })
      
    return(
        <>
            <Box component="h2" className="page-title-heading my-6">
                 Update Vendor Master
            </Box>
            <div className="card-panal inside-scroll-185" style={{
            border: "1px solid rgba(0, 0, 0, 0.12)",
            //height: "85vh",
            padding: "10px",
            }}>
               <form>
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
                            <h2 className="phaseLable required">Partner Category</h2>
                            <Autocomplete
                                sx={{
                                borderRadius: "6px",
                                }}
                                id="combo-box-demo"
                                getOptionLabel={(option) =>
                                option?.toString() || ""
                                }
                                options={PartnerCategory}
                                onChange={(e, value) => {
                                setFieldValue("partnerCategory", value);
                                }}
                                placeholder="partnerCategory"
                                value={values?.partnerCategory}
                                renderInput={(params) => (
                                <TextField
                                    name="partnerCategory"
                                    id="partnerCategory"
                                    {...params}
                                    InputProps={{
                                    ...params.InputProps,
                                    style: { height: `35 !important` },
                                    }}
                                    variant="outlined"
                                    size="small"
                                    onBlur={handleBlur}
                                />
                                )}
                            />
                            {touched.partnerCategory && errors.partnerCategory ? (<p className="form-error">{errors.partnerCategory}</p>) : null}
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable required">Agency Name</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="agencyName"
                                id="agencyName"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.agencyName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            {touched.agencyName && errors.agencyName ? (
                                <p className="form-error">{errors.agencyName}</p>
                            ) : null}
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Agency ContactNo</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="agencyContactNo"
                                id="agencyContactNo"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.agencyContactNo}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Agency Email</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="agencyEmail"
                                id="agencyEmail"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.agencyEmail}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Agency Address</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="agencyAddress"
                                id="agencyAddress"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.agencyAddress}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Duty Hour</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="dutyHour"
                                id="dutyHour"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.dutyHour}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable required">SPOC1 Name</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="spoC1Name"
                                id="spoC1Name"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.spoC1Name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            {touched.spoC1Name && errors.spoC1Name ? (
                                <p className="form-error">{errors.spoC1Name}</p>
                            ) : null}
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable required">SPOC1 ContactNo</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="spoC1ContactNo"
                                id="spoC1ContactNo"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.spoC1ContactNo}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            {touched.spoC1ContactNo && errors.spoC1ContactNo ? (
                                <p className="form-error">{errors.spoC1ContactNo}</p>
                            ) : null}
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">SPOC1 Alternate ContactNo</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="spoC1AltContactNo"
                                id="spoC1AltContactNo"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.spoC1AltContactNo}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable required">SPOC1 Email</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="spoC1Email"
                                id="spoC1Email"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.spoC1Email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            {touched.spoC1Email && errors.spoC1Email ? (
                                <p className="form-error">{errors.spoC1Email}</p>
                            ) : null}
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">SPOC2 Name</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="spoC2Name"
                                id="spoC2Name"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.spoC2Name}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">SPOC2 ContactNo</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="spoC2ContactNo"
                                id="spoC2ContactNo"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.spoC2ContactNo}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">SPOC2 Alternate ContactNo</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="spoC2AltContactNo"
                                id="spoC2AltContactNo"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.spoC2AltContactNo}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Escalation L1 Name</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="escalationL1Name"
                                id="escalationL1Name"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.escalationL1Name}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Escalation L1 ContactNo</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="escalationL1ContactNo"
                                id="escalationL1ContactNo"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.escalationL1ContactNo}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Escalation L1 Email</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="escalationL1Email"
                                id="escalationL1Email"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.escalationL1Email}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">L1 Escalation TAT</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="l1EscalationTAT"
                                id="l1EscalationTAT"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.l1EscalationTAT}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">L1 Escalation Penalty</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="l1EscalationPenalty"
                                id="l1EscalationPenalty"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.l1EscalationPenalty}
                                onChange={handleChange}
                                ///onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Escalation L2 Name</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="escalationL2Name"
                                id="escalationL2Name"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.escalationL2Name}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Escalation L2 ContactNo</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="escalationL2ContactNo"
                                id="escalationL2ContactNo"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.escalationL2ContactNo}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Escalation L2 Email</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="escalationL2Email"
                                id="escalationL2Email"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.escalationL2Email}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">L2 Escalation TAT</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="l2EscalationTAT"
                                id="l2EscalationTAT"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.l2EscalationTAT}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">L2 Escalation Penalty</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="l2EscalationPenalty"
                                id="l2EscalationPenalty"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.l2EscalationPenalty}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Escalation L3 Name</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="escalationL3Name"
                                id="escalationL3Name"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.escalationL3Name}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Escalation L3 ContactNo</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="escalationL3ContactNo"
                                id="escalationL3ContactNo"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.escalationL3ContactNo}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">Escalation L3 Email</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="escalationL3Email"
                                id="escalationL3Email"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.escalationL3Email}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">L3 Escalation TAT</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="l3EscalationTAT"
                                id="l3EscalationTAT"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.l3EscalationTAT}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">L3 Escalation Penalty</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="l3EscalationPenalty"
                                id="l3EscalationPenalty"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.l3EscalationPenalty}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">BLF Purchase Escalation Name</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="blfPurchaseEscalationName"
                                id="blfPurchaseEscalationName"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.blfPurchaseEscalationName}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">BLF Purchase Escalation ContactNo</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="blfPurchaseEscalationContactNo"
                                id="blfPurchaseEscalationContactNo"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.blfPurchaseEscalationContactNo}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">BLF Purchase Escalation Email</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="blfPurchaseEscalationEmail"
                                id="blfPurchaseEscalationEmail"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.blfPurchaseEscalationEmail}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">BLF Purchase Escalation TAT</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="blfPurchaseEscalationTAT"
                                id="blfPurchaseEscalationTAT"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.blfPurchaseEscalationTAT}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                            <div className="input-form">
                            <h2 className="phaseLable">BLF Purchase Escalation Penalty</h2>
                            <TextField
                                autoComplete="off"
                                type="text"
                                name="blfPurchaseEscalationPenalty"
                                id="blfPurchaseEscalationPenalty"
                                variant="outlined"
                                size="small"
                                className="w-85"
                                value={values?.blfPurchaseEscalationPenalty}
                                onChange={handleChange}
                                //onBlur={handleBlur}
                                onKeyDown={(e: any) => {
                                regExpressionTextField(e);
                                }}
                            />
                            </div>
                        </Grid>
                    </Grid>    
                </div>
                <div className="bottom-fix-btn" style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                    style={primaryButtonSm}
                    sx={{ height: "30px", marginLeft: "5px" }}
                    onClick={() => handleSubmit()}
                    >
                        Update
                    </Button>
                </div>
               </form> 
            </div>
        </>
    )
}