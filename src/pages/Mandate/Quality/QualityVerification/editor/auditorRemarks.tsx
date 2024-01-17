import { TextField } from "@mui/material";
import { textFieldValidationOnPaste, regExpressionRemark } from "@uikit/common/RegExpValidation/regForTextField";
import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchError } from "redux/actions";

const KEY_BACKSPACE = "Backspace";
const KEY_DELETE = "Delete";
const KEY_ENTER = "Enter";
const KEY_TAB = "Tab";

export default forwardRef((props: any, ref) => {
  const createInitialState = () => {
    let startValue;

    if (props.eventKey === KEY_BACKSPACE || props.eventKey === KEY_DELETE) {
      startValue = "";
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
  const dispatch = useDispatch();
  useEffect(() => {
    const eInput = document.getElementById("textEditor");
    eInput?.focus();
  }, []);

  const cancelBeforeStart =
    props.charPress && "1234567890".indexOf(props.charPress) < 0;

  const isLeftOrRight = (event) => {
    return ["ArrowLeft", "ArrowRight"].indexOf(event.key) > -1;
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
      isCancelAfterEnd() {
        return false;
      },
    };
  });
  const handleChange = (e) => {
    setValue(e?.target?.value);
    const data = [...props?.mileStoneData];
    data[props?.rowIndex].auditor_remarks = e?.target?.value;
    props?.setMileStoneData([...data]);
  };
  return (
    <div style={{ marginTop: 2 }} className="padd-right">
      <TextField
        ref={refInput}
        type={props?.type === "number" ? "number" : "text"}
        sx={{
          ".MuiInputBase-input": { height: "0px !important" },
        }}
        id="textEditor"
        label=""
        InputProps={{ inputProps: { maxLength: props?.maxLength || 50 } }}
        disabled={props?.role !== "Quality Auditor"}
        onChange={handleChange}
        value={value}
        variant="outlined"        
        onKeyDown={(e: any) => {
          regExpressionRemark(e);
        }}
        onPaste={(e: any) => {
          if (!textFieldValidationOnPaste(e)) {
            dispatch(fetchError("You can not paste Spacial characters"))
          }
        }}
      />
    </div>
  );
});
