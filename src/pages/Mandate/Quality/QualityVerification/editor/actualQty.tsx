import { TextField } from "@mui/material";
import blockInvalidChar from "pages/Mandate/Location/Components/blockInvalidChar ";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";

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
  const [value, setValue] = useState(initialState.value || 0);
  const [prevDiff, setPrevDiff] = useState(props?.data?.differenceQty);
  const refInput = useRef(null);
  const [keyCount, setKeyCount] = React.useState(0);
  const [count, setCount] = React.useState(0);

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
    const data = [...props?.mileStoneData];
    // props.setDiffQty(
    //   props?.diffQty - (prevDiff + e?.target?.value) - props?.data?.quantity
    // );
    props.setDiffQty(
      props?.data?.quantity - e?.target?.value +(props?.diffQty-prevDiff)
    );
    setValue(e?.target?.value || 0);

    data[props?.rowIndex].actual_Qty = e?.target?.value || 0;
    data[props?.rowIndex].differenceQty =
      e?.target?.value - props?.data?.quantity
    props?.setMileStoneData([...data]);
  };
  return (
    <div style={{ marginTop: 2 }} className="padd-right">
      <TextField
        ref={refInput}
        sx={{
          ".MuiInputBase-input": { height: "0px !important" },
        }}
        id="textEditor"
        label=""
        InputProps={{ inputProps: { maxLength: props?.maxLength || 14 } }}
        disabled={props?.role !== "Quality Auditor"}
        onChange={handleChange}
        onBlur={handleChange}
        defaultValue={value || 0}
        value={value || 0}
        variant="outlined"        
        onKeyDown={(e: any) => {
          blockInvalidChar(e);
          if (e?.key === "Backspace" && keyCount > 0) {
            setKeyCount(keyCount - 1);

            if (keyCount === 1) setCount(0);
          }
          if (
            e.target.selectionStart === 0 &&
            e.code === "Space"
          ) {
            e.preventDefault();
          }

          if (!(count > 0 && e?.key === "."))
            setKeyCount(keyCount + 1);
          if (e?.key === ".") {
            setCount(count + 1);
          }
          if (
            (!/[0-9.]/.test(e.key) ||
            (count > 0 && e?.key === ".")) && (e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight")
          ) {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
});
