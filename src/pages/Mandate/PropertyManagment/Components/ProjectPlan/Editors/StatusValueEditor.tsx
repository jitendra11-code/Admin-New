import { TextField } from '@mui/material';
import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { regExpressionRemark, textFieldValidationOnPaste } from '@uikit/common/RegExpValidation/regForTextField';

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
            value: startValue || 0,
        };
    };

    const initialState = createInitialState();
    const [value, setValue] = useState(initialState.value || 0);
    const refInput = useRef(null);

    useEffect(() => {
        const eInput = document.getElementById('textEditor');
        eInput?.focus();
    }, []);

    const cancelBeforeStart = props.charPress && '1234567890'.indexOf(props.charPress) < 0;

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
    const eventHandler = (e) => {
        console.log('Props', e.target.value);
        if ((e?.target?.value && parseFloat(e.target.value) > 100.0) || (parseInt(e.target.value) === 0 && e.target.value?.length > 1)) {
            return;
        }
        // if (parseInt(e.target.value) == 100) {
        //     props.setProjectPlanData([...props?.projectPlanData]);
        // }
        setValue(e?.target?.value ? e?.target?.value : 0);
    };

    return (
        <div style={{ marginTop: 0, marginBottom: 0 }}>
            <TextField
                ref={refInput}
                type={props?.type === 'number' ? 'number' : 'text'}
                sx={{
                    '.MuiInputBase-input': { height: '0px !important' },
                }}
                id="textEditor"
                label=""
                InputProps={{ inputProps: { maxLength: props?.maxLength || 50 } }}
                onKeyDown={(event) => {
                    if (event?.key === '-' || event?.key === '+' || (event?.key === '.' && value >= 100)) {
                        event.preventDefault();
                    }
                }}
                onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
                onChange={eventHandler}
                value={value || 0}
                variant="outlined"
            />
        </div>
    );
});
