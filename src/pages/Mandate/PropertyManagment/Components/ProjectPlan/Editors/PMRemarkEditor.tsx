import { TextField } from "@mui/material";
import { regExpressionRemark, textFieldValidationOnPaste } from "@uikit/common/RegExpValidation/regForTextField";
import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { fetchError, showMessage } from "redux/actions";
import { useDispatch } from "react-redux";

const KEY_BACKSPACE = 'Backspace';
const KEY_DELETE = 'Delete';

export default forwardRef((props: any, ref) => {
    const createInitialState = () => {
        let startValue;

        if (props.eventKey === KEY_BACKSPACE || props.eventKey === KEY_DELETE) {
            startValue = '';
        } else if (props.charPress) {
            startValue = props.charPress;
        } else {
            startValue = props.value;
        }

        return {
            value: startValue,
        };
    };

    const initialState = createInitialState();
    const inputRef = useRef(null);
    const [value, setValue] = useState(initialState.value);


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
    const eventHandler = (e:any) => {
        let value = e?.target?.value;

        setValue(e?.target?.value)
    }
    const dispatch = useDispatch();

    return (
        <div style={{ marginTop: 0, marginBottom: 0 }}>
            <TextField
                ref={inputRef}
                sx={{
                    '.MuiInputBase-input': { height: '0px !important' },
                }}
                id="outlined-basic"
                label=""               
                onPaste={(e: any) => {
                    if (!textFieldValidationOnPaste(e)) {
                        dispatch(fetchError("You can not paste Spacial characters"))
                    }
                }}
                InputProps={{ inputProps: { maxLength: 250 } }}
                onChange={(e)=>eventHandler(e)}
                value={value}
                variant="outlined"
                onKeyDown={(e: any) => {
                    if (e.target.selectionStart === 0 && e.code === "Space") {
                        e.preventDefault();
                    }
                    regExpressionRemark(e);
                }} />
        </div>
    )
})
