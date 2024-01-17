import React, { useEffect } from "react"
import axios from 'axios';
import { fetchError } from "redux/actions";
import { useDispatch } from "react-redux";
import { useAuthUser } from "@uikit/utility/AuthHooks";
import { Grid, TextField, Autocomplete } from "@mui/material";
import { textFieldValidationOnPaste, regExpressionRemark } from "@uikit/common/RegExpValidation/regForTextField";
const VendorInformation = ({ mandateId, vendor, setVendor, contactError, setContactError }) => {
    const dispatch = useDispatch()
    const { user } = useAuthUser()
    const [vendorInformation, setVendorInformation] = React.useState([]);
    const [vendorCatInformation, setVendorCatInformation] = React.useState([]);
    const [boqNo, setBOQNo] = React.useState("");

    useEffect(() => {
        if (vendorInformation && vendorInformation?.length > 0) {
            // if (vendorInformation?.length === 1) {
                let vendor = vendorInformation?.[0];
                setVendor((state) => ({
                    ...state,
                    "vendorname": vendor?.vendorname || "",
                    "vendorcategory": vendor?.vendorcategory || "",
                    "vendorId": vendor?.id || "",
                    "id": vendor?.id || "",
                }))
            // }
        }

    }, [vendorInformation, setVendorInformation])
    useEffect(() => {
        if (mandateId) {
            let boqNo = `BOQ/${mandateId?.mandatePhaseCode || ""}`;
            setBOQNo(boqNo)
            setVendor((state) => ({
                ...state,
                "boqNO": boqNo || "",
            }))
        }
    }, [mandateId])

    useEffect(() => {
        if (user?.vendorType) {
            const data = [{
                categoryKey: user?.vendorType || "",
                categoryName: user?.vendorType || ""
            }]
            setVendorCatInformation(data)
        }

    }, [user?.vendorType])

    function isValidContactNo(contactno) {
        let regExp = new RegExp("^[9,8,7,6][0-9]*$");
        return regExp.test(contactno);
    }

    const _getVendorInformation = () => {
        axios
            .get(`${process.env.REACT_APP_BASEURL}/api/BOQ/GetVendorAllocationForBOQ?mandateid=${mandateId?.id || 0}&vendorType=${user?.vendorType || ""}`)
            .then((response: any) => {
                if (!response) return
                if (response && response?.data && response?.data?.length > 0) {
                    setVendorInformation(response?.data)
                } else {
                    setVendorInformation([])
                }
            })
            .catch((e: any) => {
                dispatch(fetchError("Error Occurred !"));
            });
    }

    useEffect(() => {
        if (mandateId && mandateId?.id !== undefined && mandateId?.id !== "noid") {
            _getVendorInformation()
        }
    }, [mandateId])
    return (
        <div>
            <Grid
                container
                item
                spacing={5}
                justifyContent="start"
                alignSelf="center"
                sx={{ paddingTop: "0px!important" }}
            >
                <Grid item xs={6} md={2} sx={{ position: "relative" }}>
                    <div>
                        <h2 className="phaseLable">BOQ No</h2>
                        <TextField
                            autoComplete="off"
                            name="boq_no"
                            id="boq_no"
                            style={{ marginRight: "10px" }}
                            variant="outlined"
                            size="small"
                            value={boqNo || ""}
                            placeholder="BOQ No"
                            disabled
                        />
                    </div>
                </Grid>

                <Grid item xs={6} md={2} sx={{ position: "relative" }}>
                    <div>
                        <h2 className="phaseLable">Vendor Category</h2>

                        <Autocomplete
                            disablePortal
                            sx={{ backgroundColor: "#f3f3f3", borderRadius: "6px" }}
                            id="combo-box-demo"
                            getOptionLabel={(option) => {
                                return option?.categoryName?.toString() || ""
                            }}
                            disableClearable
                            disabled
                            value={vendorCatInformation?.[0] || null}
                            defaultValue={vendorCatInformation?.[0] || null}
                            options={vendorCatInformation || []}
                            placeholder="Vendor Category"
                            renderInput={(params) => (
                                <TextField
                                    name="vendor_category"
                                    id="vendor_category"
                                    {...params}
                                    InputProps={{
                                        ...params.InputProps,
                                        style: { height: `35 !important` },
                                    }}
                                    variant="outlined"
                                    size="small"
                                />
                            )}

                        />
                    </div>
                </Grid>
                <Grid item xs={6} md={2} sx={{ position: "relative" }}>
                    <div>
                        <h2 className="phaseLable">Vendor Name</h2>
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            getOptionLabel={(option) => {
                                return option?.vendorname?.toString() || ""
                            }}
                            disableClearable
                            options={vendorInformation || []}
                            onChange={(e, value: any) => {
                                setVendor((state) => ({
                                    ...state,
                                    "vendorname": value?.vendorname || "",
                                    "vendorId": value?.id || "",
                                    "id": value?.id || "",
                                    "vendorcategory": value?.vendorcategory || ""

                                }))
                            }}
                            value={vendor || null}
                            placeholder="Vendor Name"
                            renderInput={(params) => (
                                <TextField
                                    name="vendor_name"
                                    id="vendor_name"
                                    {...params}
                                    InputProps={{
                                        ...params.InputProps,
                                        style: { height: `35 !important` },
                                    }}
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                        />
                    </div>
                </Grid>
                <Grid item xs={6} md={2} sx={{ position: "relative" }}>
                    <div>
                        <h2 className="phaseLable">Contact Number</h2>
                        <TextField
                            autoComplete="off"
                            name="contact_number"
                            id="contact_number"
                            type="text"
                            InputProps={{ inputProps: { min: 0, maxLength: 10 } }}
                            onKeyDown={(event) => {
                                
                                if (event.key === "Backspace" || event.key ==="ArrowLeft" || event.key ==="ArrowRight") {
                                    return;
                                }
                                
                                if (/^[0-9]$/.test(event.key)) {
                                    return;
                                    
                                }
                                event.preventDefault();
                            }}
                            value={vendor?.contact_number || ""}
                            onChange={e => {
                                
                                setVendor((state) => ({
                                    ...state,
                                    "contact_number": e?.target?.value || "",
                                }))
                                if (!isValidContactNo(e.target.value) && e.target.value.trim() !== "") {
                                    setContactError("Contact number must be start with 9,8,7 or 6");
                                } else if (e.target.value?.length < 10 && e.target.value.trim() !== "") {
                                    setContactError("Contact number must be 10 digit");
                                } else {
                                    setContactError(null);
                                }
                            }}

                            style={{ marginRight: "10px" }}
                            variant="outlined"
                            size="small"
                            placeholder="Contact Number"
                        />
                        {contactError ? (
                            <h6 style={{ color: "red" }}>{contactError}</h6>
                        ) : (
                            ""
                        )}
                    </div>
                </Grid>
                <Grid item xs={6} md={4} sx={{ position: "relative" }}>
                    <div>
                        <h2 className="phaseLable">Remark</h2>
                        <TextField
                            autoComplete="off"
                            name="Remark"
                            id="Remark"
                            style={{ marginRight: "10px" }}
                            variant="outlined"
                            size="small"
                            multiline
                            value={vendor?.remarks || ""}
                            onKeyDown={(e: any) => {
                                regExpressionRemark(e);
                            }}
                            onPaste={(e: any) => {
                                if (!textFieldValidationOnPaste(e)) {
                                    dispatch(fetchError("You can not paste Spacial characters"))
                                }
                            }}
                            InputProps={{ inputProps: { maxLength: 50 } }}
                            type="text"
                            onChange={e => {
                                if (e?.target?.value == " ") {
                                    e.preventDefault();
                                } else {

                                    setVendor((state) => ({
                                        ...state,
                                        "remarks": e?.target?.value || "",
                                    }))
                                }
                            }}
                            placeholder="Remark"

                        />
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}

export default VendorInformation;
