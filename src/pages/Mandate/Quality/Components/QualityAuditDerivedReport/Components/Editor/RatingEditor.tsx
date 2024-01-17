import { TextField } from "@mui/material";
import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";

const KEY_BACKSPACE = 'Backspace';
const KEY_DELETE = 'Delete';
const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';

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
    const [value, setValue] = useState(initialState.value);
    const refInput = useRef(null);

    useEffect(() => {
        const eInput = document.getElementById("textEditor");
        eInput?.focus();
    }, []);

    const cancelBeforeStart =
        props.charPress && '1234567890'.indexOf(props.charPress) < 0;

    const isLeftOrRight = (event) => {
        return ['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1;
    };

    const isCharNumeric = (charStr) => {
        return !!/\d/.test(charStr);
    };

    const isKeyPressedNumeric = (event) => {
        const charStr = event.key;
        return isCharNumeric(charStr);
    };

    const deleteOrBackspace = (event) => {
        return [KEY_DELETE, KEY_BACKSPACE].indexOf(event.key) > -1;
    };

    const finishedEditingPressed = (event) => {
        const key = event.key;
        return key === KEY_ENTER || key === KEY_TAB;
    };

    const onKeyDown = (event) => {
        if (event.key == "-") {
            event.preventDefault();
        }

    };


    useImperativeHandle(ref, () => {
        return {
            getValue() {
                return value;
            },
            isCancelBeforeStart() {
                return cancelBeforeStart;
            },

        };
    });
    const eventHandler = (e) => {
        if (e.target.value <= 5 && parseInt(e.target.value) !== 0)
            setValue(e?.target?.value ? e?.target?.value && parseInt(e.target.value) > 100 ? 0 : e?.target?.value : "")
    }

    return (
        <div style={{ marginTop: 0, marginBottom: 0 }}>
            <TextField
                ref={refInput}
                type={props?.type === 'number' ? "number" : "text"}
                sx={{
                    '.MuiInputBase-input': { height: '0px !important' },
                }}
                id="textEditor"
                label=""

                InputProps={{ inputProps: { maxLength: props?.maxLength || 50, pattern: "([^0-9]*)" } }}
                onChange={eventHandler}
                onKeyDown={onKeyDown}
                value={value}
                variant="outlined" />
        </div>
    )
});


