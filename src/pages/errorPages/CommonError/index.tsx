import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import ErrorIcon from "@uikit/core/AppErrorBoundary/ErrorIcon";

const ErrorPage = () => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
                flex: 1,
                textAlign: "center",
                "& svg": {
                    width: "100%",
                    maxWidth: 400,
                    color: (theme) => theme.palette.primary.main,
                },
            }}
        >
            <ErrorIcon />
            <Typography
                variant="h2"
                component="h2"
                style={{ fontSize: 30, marginTop: 16 }}
            >
                Ah! Something went wrong.
            </Typography>
            <Typography style={{ fontSize: 18, marginTop: 12 }}>
                Brace yourself till we get the error fixed.
            </Typography>
            <Typography style={{ fontSize: 18 }}>
                You may also refresh the page or try again latter
            </Typography>
        </Box>
    );


}

export default ErrorPage;
