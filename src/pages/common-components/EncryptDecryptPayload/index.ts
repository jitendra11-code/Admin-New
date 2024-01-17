import * as CryptoJS from "crypto-js";
const AesKey = process.env.REACT_APP_AESKEY
const AesIV = process.env.REACT_APP_AESIV

async function readFile(file) {
    return new Promise((resolve, reject) => {
        const CHUNK_SIZE = 1024*1024*10;
        let currentPosition = 0;
        let totalSize = file.size;
        let chunks = [];
        const fileReader: any = new FileReader();
        fileReader.onerror = () => {
            reject(fileReader.error);
        };

        fileReader.onload = () => {
            let chunk = fileReader.result.substr(fileReader.result.indexOf(',') + 1);
            chunks.push(chunk);
            currentPosition += CHUNK_SIZE;
            if (currentPosition < totalSize) {
                readNextChunk();
            } else {
                resolve(chunks.join(''));
            }
        };

        function readNextChunk() {
            const blob = file.slice(currentPosition, currentPosition + CHUNK_SIZE);
            fileReader.readAsDataURL(blob);
        }
        readNextChunk();
    });

}

export const encryptPayload = async (url, originalurl, config) => {
    if (config?.data !== undefined && url !== undefined) {
        try {
            var urlParam = url;
            var data = JSON.stringify(config?.data)
            var key = CryptoJS.enc.Base64.parse(AesKey);
            var iv = CryptoJS.enc.Base64.parse(AesIV);
            var encryptedUrl = CryptoJS.AES.encrypt(
                urlParam, key,
                {
                    keySize: 128 / 8,
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            ).toString();

            var encryptedData = CryptoJS.AES.encrypt(
                data, key,
                {
                    keySize: 128 / 8,
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            ).toString();
            config.url = `${originalurl}?${encryptedUrl}`
            config.data = encryptedData;

            return config;

        }
        catch (err) {
        }
    }
    if (config?.data === undefined && url !== undefined) {
        try {
            var urlParam = url;
            var key = CryptoJS.enc.Base64.parse(AesKey);
            var iv = CryptoJS.enc.Base64.parse(AesIV);
            var encryptedUrl = CryptoJS.AES.encrypt(
                urlParam, key,
                {
                    keySize: 128 / 8,
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            ).toString()
            config.url = `${originalurl}?${encryptedUrl}`
            return config;
        } catch (err) {

        }
    }
    if (config?.data !== undefined && url === undefined) {
        var key = CryptoJS.enc.Base64.parse(AesKey);
        var iv = CryptoJS.enc.Base64.parse(AesIV);
        if (config?.data instanceof FormData) {
            try {
                var formData = config.data;
                var _formData: any = new FormData();
                const files = formData.getAll('file');
                const containsMultipleFiles = files.length > 1;
                var _multipleFileList = [];
                if (containsMultipleFiles === true) {
                    for (let i = 0; i < files.length; i++) {
                        const content = await readFile(files[i]);
                        var _encryptedDataWithFileName = {
                            encryptedData: content,
                            fileName: files[i].name,
                            filekey: "file"
                        };
                        _multipleFileList.push(_encryptedDataWithFileName)
                    }
                    const encryptedChunk = CryptoJS.AES.encrypt(JSON.stringify(_multipleFileList), key, {
                        keySize: 128 / 8,
                        iv: iv,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    }).toString();
                    _formData.append("file", encryptedChunk)

                }
                var _fileList = [];
                for (const [index1, value1] of formData.entries()) {
                    if (value1 instanceof File) {
                        var _encryptedDataWithFileName1;
                        if (containsMultipleFiles === false) {
                            var content1 = await readFile(value1);
                            _encryptedDataWithFileName1 = {
                                encryptedData: content1,
                                fileName: value1.name,
                                filekey: index1
                            };
                            _fileList.push(_encryptedDataWithFileName1)

                        }
                    } else {

                    }
                }

                if (containsMultipleFiles === false) {
                    var encryptedChunk1 = CryptoJS.AES.encrypt(JSON.stringify(_fileList), key, {
                        keySize: 128 / 8,
                        iv: iv,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    }).toString();

                    _formData.append("file", encryptedChunk1)
                }

                var serializedFormData: any;
                serializedFormData = Array.from(formData.entries())
                    .map(entry => {
                        if (entry[1] instanceof File) {
                        } else {
                            return `${entry[0]}=${encodeURIComponent(entry[1])}`;
                        }
                    })
                serializedFormData = serializedFormData?.filter(item => item !== undefined)
                serializedFormData = serializedFormData && serializedFormData.join('&');

                var encryptedFormData = CryptoJS.AES.encrypt(
                    serializedFormData, key,
                    {
                        keySize: 128 / 8,
                        iv: iv,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    }
                ).toString()
                _formData.append('encryptedFormData', encryptedFormData);
                config.data = _formData
                return config
            } catch (err) {

            }
        }

        try {
            var urlParam = url;
            var data = JSON.stringify(config?.data)
            var key = CryptoJS.enc.Base64.parse(AesKey);
            var iv = CryptoJS.enc.Base64.parse(AesIV);

            var encryptedData = CryptoJS.AES.encrypt(
                data, key,
                {
                    keySize: 128 / 8,
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            ).toString();
            config.data = encryptedData;
            return config;
        }
        catch (err) {
        }
    }
    if (url === undefined) {
        if (config?.data === undefined) {

            try {
                var urlParam = url;
                var key = CryptoJS.enc.Base64.parse(AesKey);
                var iv = CryptoJS.enc.Base64.parse(AesIV);
                var encryptedUrl = CryptoJS.AES.encrypt(
                    urlParam, key,
                    {
                        keySize: 128 / 8,
                        iv: iv,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    }
                ).toString()
                config.url = originalurl;
                return config;
            } catch (err) {

            }
        } else {

        }
    }

}
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
export const decryptPayload = (response) => {
    try {
        var key = CryptoJS.enc.Base64.parse(AesKey);
        var iv = CryptoJS.enc.Base64.parse(AesIV);
        var data = CryptoJS.AES.decrypt(response?.data, key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8);
        var test = isJsonString(data)
        if (test) {
            var _json = JSON.parse(data);
            response.data = _json
            return response;
        }
        response.data = data;
        return response;

    } catch (err) {
    }
}

export const decryptPayloadDownload = (response) => {
    try {

        var key = CryptoJS.enc.Base64.parse(AesKey);
        var iv = CryptoJS.enc.Base64.parse(AesIV);
        var data = CryptoJS.AES.decrypt(response?.data, key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8);
        var test = isJsonString(data)
        if (test) {
            var _json = JSON.parse(data);

            response.data = _json
            return response;
        }
        response.data = data;
        return response;
    } catch (err) {
    }
}

