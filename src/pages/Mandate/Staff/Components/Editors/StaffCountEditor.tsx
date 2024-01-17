import { TextField } from "@mui/material";
import  { useState, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
export default forwardRef((props: any, ref) => {
    const inputRef = useRef(null);
    const [value, setValue] = useState('');
    useImperativeHandle(ref, () => {
        return {
            getValue: () => {
                return value;
            },
            afterGuiAttached: () => {
                setValue(props.value);
                inputRef.current.focus();
                inputRef.current.select();
            }
        };
    });
    const eventHandler = useCallback((e) => {
        setValue(e?.target?.value)
        var currentIndex = props?.rowIndex
        var data = [...props?.staffInformation];
        data[currentIndex].status_percentage = e?.target?.value ? e?.target?.value : "";
        props?.setStaffInformation(data)
    }, [])

    return (
        <div style={{ marginTop: 5, marginBottom: 5 }}>
            <TextField
                ref={inputRef}
                id="outlined-basic"
                label=""
                sx={{
                    '.MuiInputBase-input': { height: '0px !important', fontSize: '12px', padding: '14.5px 14px' },
                }}
                type={"number"}
                InputProps={{ inputProps: { maxLength: 8 } }}
                onChange={eventHandler}
                value={value}
                variant="outlined" />
        </div>
    )
})
