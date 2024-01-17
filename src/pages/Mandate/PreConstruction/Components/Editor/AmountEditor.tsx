import { TextField } from "@mui/material";
import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import blockInvalidChar from "pages/Mandate/Location/Components/blockInvalidChar ";
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
    if (props?.name == "amount" && e.target.value?.toString()?.length > 14) {
      return e.preventDefault();
    } else {
      setValue(e?.target?.value);
      const data = [...props?.rtgsData];
      data[props?.rowIndex].pM_remarks = e?.target?.value;
      props?.setRTGSData([...data]);
    }
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
        InputProps={{ inputProps: { maxLength: props?.maxLength || 14 } }}
        onChange={handleChange}
        onKeyDown={(e: any) => {
          blockInvalidChar(e);
          if (e.target.selectionStart === 0 && e.code === "Space") {
            e.preventDefault();
          }
        }}
        value={value}
        onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
        variant="outlined"
      />
    </div>
  );
});
