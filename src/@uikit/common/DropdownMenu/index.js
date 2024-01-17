import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import './style.css';


export default function DropdownMenu({ state, handleChange, disabled = false, title, menu, name, id, value, onBlur }) {
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel style={{ fontSize: '14px', fontWeight: '900' }} id="demo-select-small">{title}</InputLabel>
      <Select
        labelId="demo-select-small"
        value={state}
        label={title}
        disabled={disabled}
        onChange={handleChange}
        name={name}
        id={id}
        sx={disabled === true && { backgroundColor: "#f3f3f3" }}
        onBlur={onBlur}

      >
        {menu?.map((item, i) => {
          return (
            <MenuItem value={i + 1}>{item}</MenuItem>
          )
        })}
      </Select>
    </FormControl>
  );
}
