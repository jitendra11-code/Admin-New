import { TextField } from "@mui/material";
import { KeyboardEvent } from 'react';
import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";

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

    const _regexForDigits = (e) => {
        var reg = /^\d+$/
        if ((reg.test(e.key) === false) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
            e.preventDefault()
        }
    }

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
        if (isLeftOrRight(event) || deleteOrBackspace(event)) {
            event.stopPropagation();
            return;
        }

        if (!finishedEditingPressed(event) && !isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
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

    return (
        <div style={{ marginTop: 0, marginBottom: 0 }}>
            <TextField
                ref={refInput}
                sx={{
                    '.MuiInputBase-input': { height: '0px !important' },
                }}
                id="textEditor"
                label=""
                onKeyDown={(e: any) => {
                    if (
                      e.target.selectionStart === 0 && e.code === "Space" &&
                      !(e.code === "Numpad9" || e.code === "Digit9" ||
                        e.code === "Numpad8" || e.code === "Digit8" ||
                        e.code === "Numpad7" || e.code === "Digit7" ||
                        e.code === "Numpad6" || e.code === "Digit6")
                    ) {
                      e.preventDefault();
                    }
                    _regexForDigits(e)
                  }}
                InputProps={{ inputProps: { maxLength: 10 || props?.maxLength} }}
                onChange={(event) => setValue(event.target.value)}
                value={value}
                variant="outlined" />
        </div>
    )
});
