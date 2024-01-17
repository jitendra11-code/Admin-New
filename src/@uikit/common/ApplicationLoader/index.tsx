import React, { useEffect, useState } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/store';
const Loader = () => {
    const { loaderState } = useSelector<AppState, AppState['appLoader']>(({ appLoader }) => appLoader);
    const [flag, setflag] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setflag(loaderState);
        }, 1000);
    }, [loaderState]);

    return (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={flag} onClick={null}>
            <CircularProgress color="inherit" />
        </Backdrop>
    );
};
export default Loader;
