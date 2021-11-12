import { makeStyles, createStyles } from '@material-ui/core/styles'
import { AiOutlineFolderOpen } from 'react-icons/ai'
import React from 'react'

const ArchiveBatchMessage = ({ role }) => {
  const classes = useStyles()
  return (
    <>
      <div className={classes.container}>
        <div>
          <AiOutlineFolderOpen size={100} className={classes.document_icon} />
        </div>
        <div>
          <p className="sub-text bold text-align-center" id="greeting-text">
            Archived Batches stay here
          </p>
        </div>
        {role === 'T' ? (
          <div>
            <p className="bold text-align-center" id="helper-text">
              You can archive any batch which is not in use or classes are
              already done for it.
            </p>
          </div>
        ) : null}
      </div>
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    verify_email: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      backgroundColor: '#3f3f3f',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    document_icon: {
      marginTop: '5rem',
      color: 'rgba(0,0,0,0.1)',
    },
    arrow_icon: {
      position: 'absolute',
      right: '5rem',
      top: '2rem',
    },
  }),
)

export default ArchiveBatchMessage
