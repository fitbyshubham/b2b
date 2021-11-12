import React from 'react'
import CancelIcon from '@material-ui/icons/Cancel'
import { createStyles, makeStyles } from '@material-ui/core/styles'

const AssignmentFileCard = ({
  name,
  clearFiles,
  index,
  onNameClick,
  tabIndex,
}) => {
  const classes = useStyles()

  return (
    <div className={classes.card}>
      <div
        className={classes.files}
        onClick={onNameClick}
        onKeyDown={onNameClick}
        role="link"
        tabIndex={tabIndex}
      >
        <p className={`${classes.name} bold`}>{name}</p>
      </div>
      <CancelIcon
        className={classes.cancel}
        onClick={() => clearFiles(index)}
      />
    </div>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      border: '1px solid grey',
      borderRadius: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 8px',
    },
    files: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
    },
    name: {
      marginLeft: '5px',
    },
    cancel: {
      cursor: 'pointer',
    },
  }),
)

AssignmentFileCard.defaultProps = {
  onNameClick: () => {},
}

export default AssignmentFileCard
