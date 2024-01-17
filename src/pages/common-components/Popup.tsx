import React from "react";
function Popup({ setResult }) {
  return (
    <div className="modal">
      <div className="modal_box">
        <p>are you sure?</p>
        <button className="modal_buttonCancel" onClick={() => setResult(false)}>
          Cancel
        </button>
        <button className="modal_buttoDelete" onClick={() => setResult(true)}>
          Confirm
        </button>
      </div>
    </div>
  );
}

export default Popup;
