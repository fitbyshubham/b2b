import React, { useEffect, useContext, useState } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core'
import { GoCloudUpload } from 'react-icons/go'
import { BatchContext } from '../../../../Context/BatchContext'

const Placeholder = ({ classes }) => (
  <div className={classes.container}>
    <GoCloudUpload size={150} color="#6481e4" />
    <Typography variant="h4">Invite Students</Typography>
    <Typography variant="subtitle1">
      Upload all students in one go. Download template and Invite student
    </Typography>
  </div>
)

export default function InvitedStudents() {
  const classes = useStyles()

  const columns = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 250,
      maxWidth: 250,
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 300,
      maxWidth: 300,
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 200,
      maxWidth: 200,
      align: 'center',
    },
    // {
    //   id: 'upload_on',
    //   label: 'Upload On',
    //   minWidth: 250,
    //   maxWidth: 250,
    //   align: 'center',
    // },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      maxWidth: 100,
      align: 'center',
    },
  ]
  const [rows, setRows] = useState([])

  const [isTableEmpty, setIsTableEmpty] = useState(false)

  const { studentRequestByBatchId } = useContext(BatchContext)

  useEffect(() => {}, [studentRequestByBatchId])

  useEffect(() => {
    const tempRows = []
    const invited = studentRequestByBatchId.filter(
      (student) => student.status === 'I',
    )

    if (invited.length === 0) {
      setIsTableEmpty(true)
    }

    invited.forEach((student) => {
      const tempRowObject = {}
      tempRowObject.name = student.student_name
      tempRowObject.email = student.student_email
      tempRowObject.phone = student.student_phone_number || 'NA'
      // tempRowObject.upload_on = student.upload_on || 'NA'
      tempRowObject.status = student.has_joined ? 'Joined' : 'Invited'
      tempRows.push(tempRowObject)
    })

    setRows(tempRows)
  }, [])

  return (
    <div>
      {isTableEmpty ? (
        <Placeholder classes={classes} />
      ) : (
        <Paper className={classes.root}>
          <TableContainer className={classes.tableContainer}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                      className={classes.headerCell}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    classes={{
                      root: classes.rowStyle,
                    }}
                    key={row.code}
                  >
                    {columns.map((column) => (
                      <TableCell align={column.align} key={column.id}>
                        {row[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </div>
  )
}

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '80px 0px',
    },
    root: {
      width: '100%',
      borderRadius: '8px',
      boxShadow: '2px 4px 6px 2px rgba(0, 0, 0, 0.06)',
    },
    headerCell: {
      backgroundColor: '#7d7d7d',
      color: '#fff',
      padding: '10px 16px',
    },
    rowStyle: {
      '&:nth-of-type(odd)': {
        backgroundColor: 'rgba(100, 129, 228, 0.1)',
      },
    },
    tableContainer: {
      maxHeight: '75vh',
      borderRadius: '8px',
    },
  }),
)
