import React, { useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import { IoIosArrowBack } from 'react-icons/io'
import SideNavOptions from '../sideNavOptions'
import { AuthContext } from '../../../../Context/AuthContext'
import { BatchContext } from '../../../../Context/BatchContext'

const drawerWidth = 70

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundImage: 'linear-gradient(127deg, #638ee4 29%, #6480e4 68%)',
    color: '#fff',
  },
  toolbar: {
    padding: '10%',
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  link: {
    textDecoration: 'none',
  },
  activeListItem: {
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    backgroundColor: '#ffffff33',
  },
  listItemIcon: {
    marginLeft: '7%',
    color: '#fff',
  },
}))

const MiniSideNav = ({ batchId, route }) => {
  const classes = useStyles()

  const history = useHistory()
  const { authState } = useContext(AuthContext)
  const { getAllReqAndBatches, GetTeacherBatches } = useContext(BatchContext)

  return (
    <div className="tablets">
      <Drawer
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.toolbar}>
          <IconButton
            color="inherit"
            onClick={() => {
              history.push('/dashboard')
              if (authState.role === 'T') {
                GetTeacherBatches()
              }
              if (authState.role === 'S') {
                getAllReqAndBatches()
              }
            }}
          >
            <IoIosArrowBack />
          </IconButton>
        </div>
        <Divider className={classes.divider} />
        <List>
          {SideNavOptions.map((option) => (
            <div key={option.route}>
              {option.role === 'A' ? (
                <Link
                  to={`/dashboard/${option.route}/${batchId}`}
                  className={classes.link}
                >
                  <ListItem
                    button
                    className={
                      route === option.route ? classes.activeListItem : null
                    }
                  >
                    <ListItemIcon className={classes.listItemIcon}>
                      {option.icon}
                    </ListItemIcon>
                  </ListItem>
                </Link>
              ) : option.role === 'T' && authState.role === 'T' ? (
                <Link
                  to={`/dashboard/${option.route}/${batchId}`}
                  className={classes.link}
                >
                  <ListItem
                    button
                    className={
                      route === option.route ? classes.activeListItem : null
                    }
                  >
                    <ListItemIcon className={classes.listItemIcon}>
                      {option.icon}
                    </ListItemIcon>
                  </ListItem>
                </Link>
              ) : option.role === 'S' && authState.role === 'S' ? (
                <Link
                  to={`/dashboard/${option.route}/${batchId}`}
                  className={classes.link}
                >
                  <ListItem
                    button
                    className={
                      route === option.route ? classes.activeListItem : null
                    }
                  >
                    <ListItemIcon className={classes.listItemIcon}>
                      {option.icon}
                    </ListItemIcon>
                  </ListItem>
                </Link>
              ) : null}
            </div>
          ))}
        </List>
      </Drawer>
    </div>
  )
}

export default MiniSideNav
