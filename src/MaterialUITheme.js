import { createTheme } from '@material-ui/core'
const MaterialUITheme = createTheme({
  palette: {
    primary: {
      main: '#5f80eb',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ffb031',
      contrastText: '#fff',
    },
    success: {
      main: '#32bea6',
    },
    error: {
      main: '#ff4c04',
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  overrides: {
    MuiTooltip: {
      tooltip: {
        backgroundColor: '#606060',
        lineHeight: '1.8em',
      },
      tooltipArrow: {
        backgroundColor: '#606060',
      },
    },
  },
})

export default MaterialUITheme
