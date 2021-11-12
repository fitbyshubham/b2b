import React, { useContext } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { RiRefreshLine } from 'react-icons/ri'
import Controls from '../Controls/Controls'
import { AuthContext } from '../../Context/AuthContext'

const RefreshCard = ({ onRefresh, msg }) => {
  const classes = useStyles()
  const { authState } = useContext(AuthContext)

  const handleRefresh = () => {
    onRefresh()
  }

  return (
    <>
      {authState.is_email_verified && (
        <div className="refresh">
          <div className="refresh__container">
            <div>
              <RiRefreshLine size={30} color="#fff" />
            </div>
            <div className="refresh__container__text">
              <p>{msg}</p>
            </div>
            <div className={classes.btn}>
              <Controls.Button text="Refresh Now" onClick={handleRefresh} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    btn: {
      width: '60%',
    },
  }),
)

export default RefreshCard
