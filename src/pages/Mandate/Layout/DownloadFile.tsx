import axios from "axios";
import { fetchError, showMessage } from "redux/actions";

declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean;
    }
}

export const downloadFileLayout = (value, mandateId, dispatch, recordId = 0) => {

    if (value && value?.fileList?.length === 1) {
        if (value && value?.filename !== "") {
            axios
                .get(
                    `${process.env.REACT_APP_BASEURL}/api/ImageStorage/DownloadFile?mandateId=${mandateId?.id}&filename=${value?.filename}&recordId=${value?.RecordId || recordId}`,

                )
                .then((response: any) => {
                    if (!response) {
                        dispatch(fetchError("Error occurred in downloading file !!!"));
                        return;
                    }
                    if (response?.data) {
                        var filename = response.data.filename;
                        if (filename && filename === "") {
                            dispatch(fetchError("Error Occurred !"));
                            return;
                        }
                        if (response?.data?.base64String == undefined) {
                            dispatch(fetchError("Error Occurred !"));
                            return;
                        }
                        const binaryStr = atob(response?.data?.base64String);
                        const byteArray = new Uint8Array(binaryStr.length);
                        for (let i = 0; i < binaryStr.length; i++) {
                            byteArray[i] = binaryStr.charCodeAt(i);
                        }
                        var blob = new Blob([byteArray], { type: "application/octet-stream" });
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

                            dispatch(showMessage("Document is downloaded successfully!"));
                        }
                    }
                })
                .catch((e: any) => {
                    dispatch(fetchError("Error Occurred !"));
                });
        }
    } else {
        var fileList = value && value?.fileList;
        var list: any = [];
        fileList &&
            fileList?.length > 0 &&
            fileList.map((item) => {
                list?.push(item?.filename);
            });
        if (list && list.length === 0) {
            dispatch(fetchError("No files available to download"));
            return;
        }

        axios
            .post(
                `${process.env.REACT_APP_BASEURL}/api/ImageStorage/DownloadZipFile?mandateid=${mandateId?.id || 0}&recordId=${value?.RecordId || 0}`,
                list,
            )
            .then((response: any) => {
                if (!response) {
                    dispatch(fetchError("Error occurred in downloading file !!!"));
                    return;
                }
                if (response?.data) {
                    var filename = response.data.filename;
                    if (filename && filename === "") {
                        dispatch(fetchError("Error Occurred !"));
                        return;
                    }
                    if (response?.data?.base64String == undefined) {
                        dispatch(fetchError("Error Occurred !"));
                        return;
                    }
                    const binaryStr = atob(response?.data?.base64String);
                    const byteArray = new Uint8Array(binaryStr.length);
                    for (let i = 0; i < binaryStr.length; i++) {
                        byteArray[i] = binaryStr.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray], { type: "application/zip" }); if (typeof window.navigator.msSaveBlob !== "undefined") {
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

                        dispatch(showMessage("Document is downloaded successfully!"));
                    }
                }
            })
            .catch((e: any) => {
                dispatch(fetchError("Error Occurred !"));
            });
    }
};