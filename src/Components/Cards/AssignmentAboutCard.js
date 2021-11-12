import React, { useContext } from 'react'
import { Divider } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Card from './Card'
import { AuthContext } from '../../Context/AuthContext'
import { DisplayDate, ConvertTime } from '../../Global/Functions'
import FileInfoCard from './FileInfoCard'

const AssignmentAboutCard = ({
  due_date,
  instructions,
  links,
  files,
  created_at,
  stats,
}) => {
  const classes = useStyles()
  const { authState } = useContext(AuthContext)
  const { role } = authState

  return (
    <>
      <div className={classes.container}>
        <Card className={classes.card} shadow={false}>
          <div
            className={
              role === 'T' ? classes.contentWrapperT : classes.contentWrapperS
            }
          >
            <div className={classes.content}>
              <div>
                <p className={classes.heading}>Created on</p>
                <p className={classes.info}>
                  {DisplayDate(ConvertTime(created_at), true)}
                </p>
              </div>
            </div>

            <div className={classes.content}>
              <Divider
                orientation="vertical"
                variant="fullWidth"
                className={classes.divider}
              />
              <div>
                <p className={classes.heading}>Due On</p>
                <p className={classes.info}>
                  {DisplayDate(ConvertTime(due_date))}
                </p>
              </div>
            </div>

            {role === 'T' && (
              <div className={classes.content}>
                <Divider
                  orientation="vertical"
                  variant="fullWidth"
                  className={classes.divider}
                />
                <div>
                  <p className={classes.heading}>Responses</p>
                  {Object.keys(stats).length === 0 ? (
                    <p className={classes.info}>No Responses Yet</p>
                  ) : (
                    <p className={classes.info}>
                      {stats.completed} / {stats.total}
                    </p>
                  )}
                </div>
              </div>
            )}

            {role === 'T' && (
              <div className={classes.content}>
                <Divider
                  orientation="vertical"
                  variant="fullWidth"
                  className={classes.divider}
                />
                <div>
                  <p className={classes.heading}>Evaluated</p>
                  {Object.keys(stats).length === 0 ? (
                    <p className={classes.info}>No Responses Yet</p>
                  ) : (
                    <p className={classes.info}>
                      {stats.evaluated} / {stats.completed}
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* {role === 'T' && (
              <div className={classes.icon}>
                <IconButton aria-label="settings">
                  <FiMoreHorizontal />
                </IconButton>
              </div>
            )} */}
          </div>
          <div className={classes.instructions}>
            <p className={classes.heading}>Instructions</p>
            <p className={classes.instructionsContent}>{instructions}</p>
          </div>
          <div className={classes.documentWrapper}>
            <p className={classes.heading}>Documents</p>
            <div className={classes.documents}>
              {files.length !== 0 && (
                <div className={classes.document}>
                  <p className="finer-text margin-bottom-smallest">Files</p>
                  <Grid spacing={1} container>
                    {files.map((item, i) => (
                      <Grid item md={4} lg={3} key={item.id}>
                        <FileInfoCard
                          type="file"
                          fileName={`File ${i + 1}`}
                          data={item}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </div>
              )}

              {links.length !== 0 && (
                <div className={classes.document}>
                  <p className="finer-text margin-bottom-smallest">Links</p>
                  <Grid spacing={1} container>
                    {links.map((item) => (
                      <Grid item md={4} lg={3} key={item.id}>
                        <FileInfoCard type="link" link={item.link} />
                      </Grid>
                    ))}
                  </Grid>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

AssignmentAboutCard.defaultProps = {
  links: [],
  files: [],
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      width: '100%',
      margin: '0 auto',
    },
    card: {
      padding: '20px 30px',
    },
    contentWrapperT: {
      display: 'flex',
      justifyContent: 'flex-start',
      position: 'relative',
    },
    contentWrapperS: {
      display: 'flex',
      justifyContent: 'flex-start',
      position: 'relative',
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '6rem',
    },
    icon: {
      position: 'absolute',
      right: 10,
    },
    heading: {
      fontSize: '14px',
      color: '#333333',
      fontWeight: '500',
    },
    info: {
      fontSize: '18px',
      fontWeight: 500,
      color: '#333333',
      marginTop: '10px',
    },
    divider: {
      marginRight: 20,
    },
    instructions: {
      margin: '2% 0 0 0',
    },
    instructionsContent: {
      fontSize: '14px',
      color: '#666666',
    },
    documentWrapper: {
      marginTop: '16.7px',
    },
    documents: {
      display: 'flex',
      flexDirection: 'column',
    },
    document: {
      margin: '10px 0px',
    },
    assignmentName: {
      fontSize: '14px',
      marginLeft: '3px',
    },
    files_container: {
      display: 'flex',
    },
    disable_styling: {
      textDecoration: 'none',
    },
  }),
)

export default AssignmentAboutCard
