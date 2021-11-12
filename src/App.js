import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import AuthContextProvider from './Context/AuthContext'
import AppEntry from './AppEntry/AppEntry'

const App = () => {
  const classes = useStyles()

  return (
    <>
      <AuthContextProvider>
        <Router>
          <div className={classes.app}>
            <AppEntry />
          </div>
        </Router>
      </AuthContextProvider>
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    app: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      height: '100%',
      overflowY: 'auto',
    },
    '@global': {
      '*::-webkit-scrollbar': {
        width: '0.5em',
      },
      '*::-webkit-scrollbar-track': {
        '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
      },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: '#6481e4',
      },
    },
  }),
)

export default App
