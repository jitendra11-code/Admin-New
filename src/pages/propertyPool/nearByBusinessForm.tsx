import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import Image from "./Image.png";
import { IoIosCloseCircleOutline } from "react-icons/io";
import {
    Grid,
    Box,
    Autocomplete,
} from "@mui/material";
import {
    toggleTitle,
    imageCard,
} from "shared/constants/CustomColor";
import React, { useCallback, useEffect } from "react"
import moment from "moment";
import regExpressionTextField, {regExpressionRemark, textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";
import axios from "axios";
import blockInvalidChar from "pages/Mandate/Location/Components/blockInvalidChar ";
import { useDispatch, useSelector } from "react-redux";
import { fetchError } from "redux/actions";

const YesNoOptions = [{
    key: "Yes",
    value: "Yes"
},
{
    key: "No",
    value: "No"
},
]

const BusinessTypeOptions = [{
    key: "Retail",
    value: "Retail"
}, {
    key: "Others",
    value: "Others"
}]

const NearbyBusinessForm = ({
    editNb,
    nearByError, setNearByError,
    nearByFormData, setNearByFormData, dropdownList,
    imagesNB, setImagesNB,
    imageErrorNB, setImageErrorNB,
    removeImagenNameNB, setRemoveImagenNameNB, deletedBusinessImageList, SetDeleteBusinessImageList, errorMsgNB, setErrorMsgNB, imagePreviewNB, setImagePreviewNB,statusP
}) => {

    const [floorOption, setFlorOption] = React.useState([]);
    const [bussinessTypeOption, setBusinessTypeOption] = React.useState([])
    const onImageChange = (e: any, imageKey) => {
        const MIN_FILE_SIZE = 1024;
        const { name, value } = e.target;
        const fileSizeKiloBytes = e.currentTarget.files[0].size / 1024;
        if (fileSizeKiloBytes > MIN_FILE_SIZE) {
            setErrorMsgNB({
                ...errorMsgNB,
                [name]: "Please upload less than 1mb file size",
            });
            e.target.value = null;
            return;
        } else {
            setImageErrorNB({ ...imageErrorNB, [name]: true });
            setImagesNB({ ...imagesNB, [name]: e.currentTarget.files[0] })
            setRemoveImagenNameNB(removeImagenNameNB?.filter((v) => v !== name));
            let file = e.currentTarget.files[0];
            let fileURL = URL.createObjectURL(file);
            file.fileURL = fileURL;
            setImagePreviewNB({ ...imagePreviewNB, [name]: file.fileURL });
            setErrorMsgNB({ ...errorMsgNB, [name]: "" });

        }


    };

    const removeImage = (v: any) => {
        let _imagePreview = { ...imagePreviewNB };
        setRemoveImagenNameNB([...removeImagenNameNB, v]);
        let _images = { ...imagesNB }
        delete _imagePreview[v];
        delete _images[v];
        setImagePreviewNB(_imagePreview);
        setImagesNB(_images)
    };

    const errorImage = useCallback(
        async (e, v: any) => {
            if (imagePreviewNB) var x = imageErrorNB;
            if (x.hasOwnProperty(v)) {
                x[v] = false;
            }
            e.currentTarget.src =
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cHJvcGVydHl8ZW58MHx8MHx8&w=1000&q=80";

            await setImageErrorNB(x);
        },
        [imagePreviewNB]
    );


    const getFloorCategory = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Floor Number`)
            .then((res) => {
                if (res && res?.data && res?.data?.length > 0) {
                    setFlorOption(res?.data)
                } else {
                    setFlorOption([])
                }

            })
            .catch((err) => {

            });
    }
    const getBusinessTypeCategory = () => {
        axios.get(`${process.env.REACT_APP_BASEURL}/api/FormMaster/GetFormMasterByMasterName?MasterName=Business Type`)
            .then((res) => {
                if (res && res?.data && res?.data?.length > 0) {
                    setBusinessTypeOption(res?.data)
                } else {
                    setBusinessTypeOption([])
                }

            })
            .catch((err) => {

            });
    }
    useEffect(() => {
        getFloorCategory();
        getBusinessTypeCategory()
    }, [])
    const dispatch = useDispatch();
    useEffect(() => {
        if (editNb === true && nearByFormData !== null && bussinessTypeOption?.length > 0 && floorOption?.length > 0) {
            var _data = nearByFormData;
            if (_data?.business_type !== undefined || _data?.floor !== undefined || _data?.nearby_outlet !== undefined || _data?.same_building !== undefined) {
                var nearby_outlet = YesNoOptions && YesNoOptions?.find(item => item?.value === _data?.nearby_outlet);
                var same_building = YesNoOptions && YesNoOptions?.find(item => item?.value === _data?.same_building);
                var business_type = bussinessTypeOption && bussinessTypeOption?.find(item => item?.formName === _data?.business_type);
                var floor = floorOption && floorOption?.find(item => item?.formName === _data?.floor);
                setNearByFormData(state => ({
                    ...state,
                    nearby_outlet_value: nearby_outlet || null,
                    same_building_value: same_building || null,
                    business_type_value: business_type || null,
                    floor_value: floor || null
                }))
            }
        }

    }, [editNb, bussinessTypeOption, floorOption])
    const handleChange = (e: any) => {
        var { name, value } = e?.target;
        if (nearByError[name]) {
            delete nearByError[name];
            setNearByError({ ...nearByError });
        }
        setNearByFormData({ ...nearByFormData, [name]: value });
    };
    const handleDateChange = (newValue: Dayjs | null, name) => {
        if (name === "inception_month_year") {
            let date = newValue?.toDate();
            nearByFormData[name] = moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS");
            if (moment(date)?.isValid()) {
                if (nearByError["inception_month_year"]) {
                    delete nearByError["inception_month_year"];
                    setNearByError({ ...nearByError });
                }
                setNearByFormData({ ...nearByFormData });
            }
        }

    };
    return (<div>
        <Grid
            marginBottom="30px"
            marginTop="5px"
            container
            item
            spacing={5}
            justifyContent="start"
            alignSelf="center"
        >
            <Grid item
                xs={6}
                md={4}
                lg={3}
                sx={{ position: "relative" }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Any Nearby Business Outlet
                </Typography>
                <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    getOptionLabel={(option) => {
                        return option?.value?.toString() || "";
                    }}
                    disableClearable
                    options={YesNoOptions || []}
                    placeholder="Business Type"
                    onChange={(e, value: any) => {
                        setNearByFormData((state) => ({
                            ...state,
                            "nearby_outlet_value": value,
                            "nearby_outlet": value?.value || ""
                        }))
                        setNearByError((state) => ({
                            ...state,
                            "nearby_outlet": "",
                        }))
                    }}
                    value={nearByFormData?.nearby_outlet_value || null}
                    disabled={statusP === "Approve"}
                    renderInput={(params) => (
                        <TextField
                            name="nearby_outlet"
                            id="nearby_outlet"
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

                {nearByError["nearby_outlet"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["nearby_outlet"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}
            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Are they in same building
                </Typography>
                <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    getOptionLabel={(option) => {
                        return option?.value?.toString() || "";
                    }}
                    disableClearable
                    options={YesNoOptions || []}
                    placeholder="Business Type"
                    onChange={(e, value: any) => {
                        setNearByFormData((state) => ({
                            ...state,
                            "same_building_value": value,
                            "same_building": value?.value || ""
                        }))
                        setNearByError((state) => ({
                            ...state,
                            "same_building": "",
                        }))
                    }}
                    value={nearByFormData?.same_building_value || null}
                    disabled={statusP === "Approve"}
                    renderInput={(params) => (
                        <TextField
                            name="same_building"
                            id="same_building"
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
                {nearByError["same_building"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["same_building"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}


            </Grid>

            <Grid
                item
                xs={6}
                md={4}
                lg={3}
                sx={{ position: "relative" }}
            >
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Business Full Name
                </Typography>
                <TextField
                    type="text"
                    onKeyDown={(e: any) => {
                        regExpressionTextField(e);                        
                        if (e.which === 32 && !e.target.value.length) {
                            e.preventDefault();
                        }
                        if (/[0-9]/.test(e.key)) {
                            e.preventDefault();
                        }
                    }}

                    onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                            dispatch(fetchError("You can not paste Spacial characters"))
                        }
                    }}
                    defaultValue="1800"
                    autoComplete="off"
                    size="small"
                    name="business_full_name"
                    id="business_full_name"
                    value={nearByFormData?.business_full_name || ""}
                    disabled={statusP === "Approve"}
                    onChange={(e) => {
                        handleChange(e);
                    }}
                />
                {nearByError["business_full_name"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["business_full_name"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}

            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative" }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Business Type
                </Typography>
                <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    getOptionLabel={(option) => {
                        return option?.formName?.toString() || "";
                    }}
                    disableClearable
                    options={bussinessTypeOption || []}
                    placeholder="Business Type"
                    onChange={(e, value: any) => {
                        setNearByFormData((state) => ({
                            ...state,
                            "business_type_value": value || "",
                            "business_type": value?.formName || ""
                        }))
                        setNearByError((state) => ({
                            ...state,
                            "business_type": "",
                        }))
                    }}
                    value={nearByFormData?.business_type_value || null}
                    disabled={statusP === "Approve"}
                    renderInput={(params) => (
                        <TextField
                            name="business_type"
                            id="business_type"
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
                {nearByError["business_type"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["business_type"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}

            </Grid>
            <Grid
                item
                xs={6}
                md={4}
                lg={3}
                sx={{ position: "relative", marginTop: "10px" }}
            >
                <Typography className={nearByFormData?.business_type === "Others" ? "required add-prop-bold" : "add-prop-bold"} sx={toggleTitle}>
                    Please Specify The Type Of Business
                </Typography>
                <TextField
                    type="text"
                    onKeyDown={(e: any) => {
                        regExpressionTextField(e);                        
                        if (e.which === 32 && !e.target.value.length)
                            e.preventDefault();
                    }}

                    onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                            dispatch(fetchError("You can not paste Spacial characters"))
                        }
                    }}
                    defaultValue="1800"
                    disabled={(nearByFormData?.business_type !== "Others") || (statusP === "Approve")}
                    autoComplete="off"
                    size="small"
                    name="others_business_type"
                    id="others_business_type"
                    value={nearByFormData?.others_business_type || ""}
                    onChange={(e) => {
                        handleChange(e);
                    }}
                />
                {nearByFormData?.business_type_value?.formName === "Others" && nearByError["others_business_type"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["others_business_type"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}

            </Grid>
            <Grid item xs={6} md={3} sx={{ position: "relative", marginTop: "10px" }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Floor
                </Typography>
                <Autocomplete
                    disablePortal={false}
                    style={{ zIndex: 9999999 }}
                    id="combo-box-demo"
                    getOptionLabel={(option) => {
                        return option?.formName?.toString() || "";
                    }}
                    disableClearable
                    options={floorOption || []}
                    placeholder="Business Type"
                    onChange={(e, value: any) => {
                        setNearByFormData((state) => ({
                            ...state,
                            "floor": value?.formName,
                            "floor_value": value || ""
                        }))
                        setNearByError((state) => ({
                            ...state,
                            "floor": "",
                        }))

                    }}
                    value={nearByFormData?.floor_value || null}
                    disabled={statusP === "Approve"}
                    renderInput={(params) => (
                        <TextField
                            name="floor"
                            id="floor"
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

                {nearByError["floor"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["floor"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}

            </Grid>
            <Grid
                item
                xs={6}
                md={4}
                lg={3}
                sx={{ position: "relative", marginTop: "10px" }}
            >
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Carpet Area
                </Typography>
                <TextField
                    type="number"
                    defaultValue="1800"
                    autoComplete="off"
                    size="small"
                    InputProps={{ inputProps: { min: 1, maxLength: 14 } }}
                    name="carpet_area"
                    id="carpet_area"
                    value={nearByFormData?.carpet_area || ""}
                    disabled={statusP === "Approve"}
                    onChange={(e) => {
                        e.target.value[0] == "0" ? e.preventDefault() : handleChange(e);
                    }}
                    onKeyDown={(e) => {
                        blockInvalidChar(e);                        
                    }}
                    onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                            dispatch(fetchError("You can not paste Spacial characters"))
                        }
                    }}
                />
                {nearByError["carpet_area"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["carpet_area"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}

            </Grid>
            <Grid
                item
                xs={6}
                md={4}
                lg={3}
                sx={{ position: "relative", marginTop: "10px" }}
            >
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Monthly Rent
                </Typography>
                <TextField
                    type="number"
                    defaultValue="1800"
                    autoComplete="off"
                    size="small"
                    InputProps={{ inputProps: { min: 0, maxLength: 14 } }}
                    name="monthly_rent"
                    id="monthly_rent"
                    value={nearByFormData?.monthly_rent || ""}
                    disabled={statusP === "Approve"}
                    onChange={(e) => {
                        handleChange(e);
                    }}
                    onKeyDown={(e) => {
                        blockInvalidChar(e);                        
                    }}
                    onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                            dispatch(fetchError("You can not paste Spacial characters"))
                        }
                    }}
                />
                {nearByError["monthly_rent"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["monthly_rent"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}

            </Grid>
        </Grid>
        <Grid
            marginBottom="30px"
            container
            item
            spacing={5}
            justifyContent="start"
            alignSelf="center"
        >
            <Grid
                item
                xs={6}
                md={4}
                lg={3}
                sx={{ position: "relative" }}
            >
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Monthly Maintenance Amount
                </Typography>
                <TextField
                    type="number"
                    InputProps={{ inputProps: { min: 0, maxLength: 14 } }}
                    defaultValue="1800"
                    autoComplete="off"
                    size="small"
                    name="maintenance_amount"
                    id="maintenance_amount"
                    value={nearByFormData?.maintenance_amount || ""}
                    disabled={statusP === "Approve"}
                    onChange={(e) => {
                        handleChange(e);
                    }}
                    onKeyDown={(e) => {
                        blockInvalidChar(e);                        
                    }}
                    onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                            dispatch(fetchError("You can not paste Spacial characters"))
                        }
                    }}
                />
                {nearByError["maintenance_amount"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["maintenance_amount"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}

            </Grid>
            <Grid
                item
                xs={6}
                md={4}
                lg={3}
                sx={{ position: "relative" }}
            >
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Lease Period(In Months)
                </Typography>
                <TextField
                    type="number"
                    defaultValue="1800"
                    autoComplete="off"
                    size="small"
                    InputProps={{ inputProps: { min: 0, maxLength: 4 } }}
                    name="lease_period"
                    id="lease_period"
                    value={nearByFormData?.lease_period || ""}
                    disabled={statusP === "Approve"}
                    onChange={(e) => {
                        handleChange(e);
                    }}
                    onKeyDown={(e) => {
                        blockInvalidChar(e);                        
                    }}
                    onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                            dispatch(fetchError("You can not paste Spacial characters"))
                        }
                    }}
                />
                {nearByError["lease_period"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["lease_period"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}

            </Grid>
            <Grid item xs={3} md={3} lg={3} sx={{ position: "relative" }}>
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Inception Month & Year
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                        className="w-85"
                        inputFormat="DD/MM/YYYY"
                        value={nearByFormData?.inception_month_year || null}
                        disabled={statusP === "Approve"}
                        onChange={(e) => handleDateChange(e, "inception_month_year")}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                onKeyDown={(e) => {                                    
                                    e.preventDefault();
                                }}
                            />
                        )}
                    />
                </LocalizationProvider>
                {nearByError["inception_month_year"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["inception_month_year"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}


            </Grid>
            <Grid
                item
                xs={6}
                md={4}
                lg={3}
                sx={{ position: "relative", }}
            >
                <Typography className="required add-prop-bold" sx={toggleTitle}>
                    Distance from proposed location(In meters)
                </Typography>
                <TextField
                    type="number"
                    defaultValue="1800"
                    InputProps={{ inputProps: { min: 0, maxLength: 14 } }}
                    autoComplete="off"
                    size="small"
                    name="distance"
                    id="distance"
                    value={nearByFormData?.distance || ""}
                    disabled={statusP === "Approve"}
                    onChange={(e) => {
                        handleChange(e);
                    }}
                    onKeyDown={(e) => {
                        blockInvalidChar(e);
                    }}
                    onPaste={(e: any) => {
                        if (!textFieldValidationOnPaste(e)) {
                            dispatch(fetchError("You can not paste Spacial characters"))
                        }
                    }}
                />
                {nearByError["distance"] !== undefined ? (
                    <p className="form-error">
                        {nearByError["distance"]?.replaceAll(
                            "_",
                            " "
                        )}
                    </p>
                ) : null}

            </Grid>
            <Grid
                marginBottom="30px"
                container
                item
                spacing={5}
                justifyContent="start"
                alignSelf="center"
            >
                <Grid
                    item
                    xs={12}
                    md={3}
                    style={{ position: "relative" }}
                >
                    <label htmlFor="CompetitorImage1" className="">
                        <Typography
                            className="add-prop-bold"
                            sx={{ fontSize: "13px" }}
                        >
                            Competitor Image 1
                        </Typography>
                        {(!imagePreviewNB?.CompetitorImage1 ||
                            !imageErrorNB?.CompetitorImage1) && (
                                <>
                                    <Box
                                        display="flex"
                                        flexDirection="row"
                                        justifyContent="center"
                                        style={imageCard}
                                    >
                                        <span>
                                            <img
                                                onError={(e) =>
                                                    errorImage(e, "CompetitorImage1")
                                                }
                                                src={Image}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    marginLeft: 45,
                                                    marginTop: 10,
                                                }}
                                            />
                                            <br />
                                            <p style={{ marginTop: 10 }}>
                                                {" "}
                                                Drag your image here,{" "}
                                            </p>
                                            <p style={{ marginLeft: 35 }}>or Browse</p>
                                            <p
                                                style={{
                                                    marginTop: 10,
                                                    fontSize: 10,
                                                    marginLeft: 20,
                                                    color: "#848181",
                                                }}
                                            >
                                                Supports: JPG or PNG
                                            </p>
                                        </span>
                                    </Box>
                                    <input
                                        type="file"
                                        id="CompetitorImage1"
                                        name="CompetitorImage1"
                                        accept=".png, .jpg, .jpeg"
                                        hidden
                                        onChange={(e) => onImageChange(e, "CompetitorImage1")}
                                        disabled={statusP === "Approve"}
                                    />
                                </>
                            )}
                    </label>
                    {imagePreviewNB?.CompetitorImage1 &&
                        imageErrorNB?.CompetitorImage1 && (
                            <>
                                <img
                                    onError={(e) =>
                                        errorImage(e, "CompetitorImage1")
                                    }
                                    id="CompetitorImage1"
                                    src={imagePreviewNB?.CompetitorImage1}
                                    style={{
                                        width: "100%",
                                        height: 150,
                                        borderRadius: "4px",
                                    }}
                                />
                                {statusP!=="Approve" ? (
                                <IoIosCloseCircleOutline
                                    onClick={() => removeImage("CompetitorImage1")}
                                    className="closeIocns"
                                /> ) : (
                                    <IoIosCloseCircleOutline
                                    className="closeIocns"
                                />
                                )}
                            </>
                        )}
                    {errorMsgNB?.CompetitorImage1 && (
                        <p className="form-error">
                            {errorMsgNB?.CompetitorImage1}
                        </p>
                    )}
                </Grid>
                <Grid
                    item
                    xs={12}
                    md={3}
                    style={{ position: "relative" }}
                >
                    <label htmlFor="CompetitorImage2" className="">
                        <Typography
                            className="add-prop-bold"
                            sx={{ fontSize: "13px" }}
                        >
                            Competitor Image 2
                        </Typography>
                        {(!imagePreviewNB?.CompetitorImage2 ||
                            !imageErrorNB?.CompetitorImage2) && (
                                <>
                                    {" "}
                                    <Box
                                        display="flex"
                                        flexDirection="row"
                                        justifyContent="center"
                                        style={imageCard}
                                    >
                                        <span>
                                            <img
                                                onError={(e) =>
                                                    errorImage(e, "CompetitorImage2")
                                                }
                                                src={Image}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    marginLeft: 45,
                                                    marginTop: 10,
                                                }}
                                            />
                                            <br />
                                            <p style={{ marginTop: 10 }}>
                                                {" "}
                                                Drag your image here,{" "}
                                            </p>
                                            <p style={{ marginLeft: 35 }}>or Browse</p>
                                            <p
                                                style={{
                                                    marginTop: 10,
                                                    fontSize: 10,
                                                    marginLeft: 20,
                                                    color: "#848181",
                                                }}
                                            >
                                                Supports: JPG or PNG
                                            </p>
                                        </span>
                                    </Box>
                                    <input
                                        type="file"
                                        id="CompetitorImage2"
                                        name="CompetitorImage2"
                                        accept=".png, .jpg, .jpeg"
                                        hidden
                                        onChange={(e) => onImageChange(e, "CompetitorImage2")}
                                        disabled={statusP === "Approve"}
                                    />
                                </>
                            )}
                    </label>
                    {imagePreviewNB?.CompetitorImage2 &&
                        imageErrorNB?.CompetitorImage2 && (
                            <>
                                <img
                                    onError={(e) =>
                                        errorImage(e, "CompetitorImage2")
                                    }
                                    src={imagePreviewNB?.CompetitorImage2}
                                    style={{
                                        width: "100%",
                                        height: 150,
                                        borderRadius: "4px",
                                    }}
                                />
                                {statusP!=="Approve" ? (
                                <IoIosCloseCircleOutline
                                    onClick={() => removeImage("CompetitorImage2")}
                                    className="closeIocns"
                                /> ) : (
                                    <IoIosCloseCircleOutline
                                    className="closeIocns"
                                />
                                )}
                            </>
                        )}
                    {errorMsgNB?.CompetitorImage2 && (
                        <p className="form-error">
                            {errorMsgNB?.CompetitorImage2}
                        </p>
                    )}
                </Grid>
                <Grid
                    item
                    xs={12}
                    md={3}
                    style={{ position: "relative" }}
                >
                    <label htmlFor="CompetitorImage3" className="">
                        <Typography
                            className="add-prop-bold"
                            sx={{ fontSize: "13px" }}
                        >
                            Competitor Image 3
                        </Typography>
                        {(!imagePreviewNB?.CompetitorImage3 ||
                            !imageErrorNB?.CompetitorImage3) && (
                                <>
                                    <Box
                                        display="flex"
                                        flexDirection="row"
                                        justifyContent="center"
                                        style={imageCard}
                                    >
                                        <span>
                                            <img
                                                onError={(e) =>
                                                    errorImage(e, "CompetitorImage3")
                                                }
                                                src={Image}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    marginLeft: 45,
                                                    marginTop: 10,
                                                }}
                                            />
                                            <br />
                                            <p style={{ marginTop: 10 }}>
                                                {" "}
                                                Drag your image here,{" "}
                                            </p>
                                            <p style={{ marginLeft: 35 }}>or Browse</p>
                                            <p
                                                style={{
                                                    marginTop: 10,
                                                    fontSize: 10,
                                                    marginLeft: 20,
                                                    color: "#848181",
                                                }}
                                            >
                                                Supports: JPG or PNG
                                            </p>
                                        </span>
                                    </Box>
                                    <input
                                        type="file"
                                        id="CompetitorImage3"
                                        name="CompetitorImage3"
                                        accept=".png, .jpg, .jpeg"
                                        hidden
                                        onChange={(e) => onImageChange(e, "CompetitorImage3")}
                                        disabled={statusP === "Approve"}
                                    />
                                </>
                            )}
                    </label>
                    {imagePreviewNB?.CompetitorImage3 &&
                        imageErrorNB?.CompetitorImage3 && (
                            <>
                                <img
                                    onError={(e) =>
                                        errorImage(e, "CompetitorImage3")
                                    }
                                    src={imagePreviewNB?.CompetitorImage3}
                                    style={{
                                        width: "100%",
                                        height: 150,
                                        borderRadius: "4px",
                                    }}
                                />
                                {statusP!=="Approve" ? (
                                <IoIosCloseCircleOutline
                                    onClick={() => removeImage("CompetitorImage3")}
                                    className="closeIocns"
                                /> ) : (
                                    <IoIosCloseCircleOutline
                                    className="closeIocns"
                                />
                                )}
                            </>
                        )}
                    {errorMsgNB?.CompetitorImage3 && (
                        <p className="form-error">
                            {errorMsgNB?.CompetitorImage3}
                        </p>
                    )}
                </Grid>
                <Grid
                    item
                    xs={12}
                    md={3}
                    style={{ position: "relative" }}
                >
                    <label htmlFor="CompetitorImage4" className="">
                        <Typography
                            className="add-prop-bold"
                            sx={{ fontSize: "13px" }}
                        >
                            Competitor Image 4
                        </Typography>
                        {(!imagePreviewNB?.CompetitorImage4 ||
                            !imageErrorNB?.CompetitorImage4) && (
                                <>
                                    <Box
                                        display="flex"
                                        flexDirection="row"
                                        justifyContent="center"
                                        style={imageCard}
                                    >
                                        <span>
                                            <img
                                                onError={(e) =>
                                                    errorImage(e, "CompetitorImage4")
                                                }
                                                src={Image}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    marginLeft: 45,
                                                    marginTop: 10,
                                                }}
                                            />
                                            <br />
                                            <p style={{ marginTop: 10 }}>
                                                {" "}
                                                Drag your image here,{" "}
                                            </p>
                                            <p style={{ marginLeft: 35 }}>or Browse</p>
                                            <p
                                                style={{
                                                    marginTop: 10,
                                                    fontSize: 10,
                                                    marginLeft: 20,
                                                    color: "#848181",
                                                }}
                                            >
                                                Supports: JPG or PNG
                                            </p>
                                        </span>
                                    </Box>
                                    <input
                                        type="file"
                                        id="CompetitorImage4"
                                        name="CompetitorImage4"
                                        accept=".png, .jpg, .jpeg"
                                        hidden
                                        onChange={(e) => onImageChange(e, "CompetitorImage4")}
                                        disabled={statusP === "Approve"}
                                    />
                                </>
                            )}
                    </label>
                    {imagePreviewNB?.CompetitorImage4 &&
                        imageErrorNB?.CompetitorImage4 && (
                            <>
                                <img
                                    onError={(e) =>
                                        errorImage(e, "CompetitorImage4")
                                    }
                                    src={imagePreviewNB?.CompetitorImage4}
                                    style={{
                                        width: "100%",
                                        height: 150,
                                        borderRadius: "4px",
                                    }}
                                />
                                {statusP!=="Approve" ? (
                                <IoIosCloseCircleOutline
                                    onClick={() => removeImage("CompetitorImage4")}
                                    className="closeIocns"
                                /> ) : (
                                    <IoIosCloseCircleOutline
                                    className="closeIocns"
                                />
                                )}
                            </>
                        )}
                    {errorMsgNB?.CompetitorImage4 && (
                        <p className="form-error">
                            {errorMsgNB?.CompetitorImage4}
                        </p>
                    )}
                </Grid>
            </Grid>
        </Grid>


    </div>)
}
export default NearbyBusinessForm