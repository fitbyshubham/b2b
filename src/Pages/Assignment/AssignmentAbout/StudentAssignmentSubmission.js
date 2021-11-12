import React from 'react'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import FileInfoCard from '../../../Components/Cards/FileInfoCard'
import { DisplayDate, ConvertTime } from '../../../Global/Functions'

export default function StudentAssignmentSubmission({ data }) {
  const classes = useStyles()

  return (
    <>
      {Object.keys(data).length !== 0 && (
        <>
          <Grid container className={classes.gridContainer}>
            <div className={classes.header}>
              <h2 className={`${classes.submitHeading} bolder`}>
                My Submissions
              </h2>
              <Divider orientation="horizontal" variant="fullWidth" />
            </div>
            <div className={classes.documents}>
              {data.attachments.length !== 0 && (
                <div className={classes.document}>
                  <p className="finer-text margin-bottom-smallest">Files</p>
                  <Grid spacing={1} container>
                    {data.attachments.map((item, i) => (
                      <Grid item md={4} lg={3}>
                        <FileInfoCard
                          type="file"
                          fileName={`File ${i + 1}`}
                          index={i}
                          data={item}
                          key={item.id}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </div>
              )}

              {data.links.length !== 0 && (
                <div className={classes.document}>
                  <p className="finer-text margin-bottom-smallest">Links</p>
                  <Grid spacing={1} container>
                    {data.links.map((item) => (
                      <Grid item md={4} lg={3}>
                        <FileInfoCard type="link" link={item.link} />
                      </Grid>
                    ))}
                  </Grid>
                </div>
              )}
            </div>
          </Grid>

          <div className={classes.comment}>
            {data.teacher_comment !== null && (
              <div className={classes.subStatus}>
                <p className={classes.heading}>Teacher&apos;s Comment</p>
                <p className={classes.statusContent}>{data.teacher_comment}</p>
              </div>
            )}
          </div>

          <div className={classes.status}>
            <div className={classes.subStatus}>
              <p className={classes.heading}>Submitted On</p>
              <p className={classes.statusContent}>
                {DisplayDate(ConvertTime(data.created_at))}
              </p>
            </div>
            <div className={classes.subStatus}>
              <p className={classes.heading}>Evaluation</p>
              <p className={classes.statusContent}>
                {data.status === 'E' && 'Evaluated'}
                {data.status === 'S' && 'Pending'}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    gridContainer: {
      padding: '15px 30px',
    },
    documents: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    status: {
      display: 'flex',
      margin: '0px 0px',
      padding: '0px 30px 40px 30px',
    },
    subStatus: {
      margin: '0px 60px 0px 0px',
    },
    statusContent: {
      fontSize: '14px',
      color: '#666666',
    },
    heading: {
      fontSize: '14px',
      color: '#333333',
    },
    document: {
      margin: '10px 0px',
    },
    comment: {
      padding: '0px 30px 20px 30px',
    },
    submitHeading: {
      fontSize: '24px',
      margin: '10px 0px',
    },
    header: {
      width: '100%',
    },
  }),
)
