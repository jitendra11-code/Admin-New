import { TextField } from '@mui/material';
import { useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
const NumberFormatAmount = (props) => {
    const { type, name, inputValue, state, setState, setFieldValue, onChange, ...other } = props;

    useEffect(() => {
        if (inputValue === undefined) {
            var _state = state;
            _state[name] = '';
            setState(_state);
        }
    }, [inputValue]);

    return (
        <>
            <NumericFormat
                {...other}
                value={inputValue || ''}
                type={type}
                customInput={TextField}
                onValueChange={(values) => {
                    const { floatValue, formattedValue } = values;

                    var _state = state;
                    _state[name] = parseFloat(formattedValue);
                    setState(_state);
                }}
                thousandSeparator=","
                decimalSeparator="."
            />
        </>
    );
};

export default NumberFormatAmount;
