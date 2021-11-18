import React, { useState } from 'react'
import {
  CardContent,
  Divider,
  Grid,
  makeStyles,
  Avatar,
} from '@material-ui/core'
import Controls from '../Controls/Controls'
import Card from './Card'
import AssignmentResponseDialog from '../Dialogs/AssignmentResponseDialog'
import { DisplayDate, ConvertTime } from '../../Global/Functions'
import profilePlaceholder from '../../Assets/Images/profilePlaceholder.svg'

const AssignmentSubmitCard = ({ data, refresh, status }) => {
  const classes = useStyles()
  const [openResponseDialog, setResponseDialog] = useState(false)
  const handleClick = async () => {
    setResponseDialog(true)
  }

  return (
    <>
      <Card>
        <CardContent>
          <Grid container className={classes.gridContainer}>
            <Grid item xs={9}>
              <div className={classes.user}>
                <Avatar
                  src={data.avatar === null ? profilePlaceholder : data.avatar}
                  style={{ width: 40, height: 40 }}
                />
                <div className={classes.userData}>
                  <p className={classes.userName}>{data.student}</p>
                  {data.created_at ? (
                    <>
                      <p className={classes.submitted}>
                        Submitted on:{' '}
                        {DisplayDate(ConvertTime(data.created_at), true)}
                      </p>
                    </>
                  ) : (
                    <p className={classes.submitted}>Status: Pending</p>
                  )}
                </div>
              </div>
            </Grid>
            {data.id && (
              <>
                {data.status !== 'E' && (
                  <>
                    {status === 'D' ? (
                      <Grid item xs={3}>
                        <Controls.Button
                          onClick={handleClick}
                          text="Evaluate"
                        />
                      </Grid>
                    ) : null}
                  </>
                )}
              </>
            )}
          </Grid>
          {data.status && (
            <Divider orientation="horizontal" variant="fullWidth" />
          )}
          {data.status && (
            <Grid container className={classes.gridContainer}>
              <Grid item xs={12}>
                <p className={classes.submitted}>
                  Status: {data.status === 'E' ? 'Evaluated' : 'Not Evaluated'}
                </p>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
      {openResponseDialog && (
        <AssignmentResponseDialog
          open={openResponseDialog}
          setOpen={setResponseDialog}
          data={data}
          submission_id={data.id}
          name={data.student}
          submitted_on={data.created_at}
          refresh={refresh}
        />
      )}
    </>
  )
}

const useStyles = makeStyles(() => ({
  gridContainer: {
    padding: '10px 18px',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
  },
  userName: {
    fontSize: '20px',
    color: '#000',
    fontWeight: '500',
  },
  userData: {
    margin: '0px 0px 0px 10px',
  },
  submitted: {
    fontSize: '13.5px',
    color: '#333333',
  },
  btnText: {
    fontWeight: 'bold',
  },
}))

export default AssignmentSubmitCard
