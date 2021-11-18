import React, { useContext, useEffect, useState, Suspense } from 'react'
import {
  makeStyles,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  Link,
  Typography,
  IconButton,
  Avatar,
  InputAdornment,
  Grow,
  Fade,
} from '@material-ui/core'
import { IoIosArrowForward, IoIosSearch, IoMdClose } from 'react-icons/io'
import { IoChevronForward, IoChevronBack } from 'react-icons/io5'
import { AiOutlineSearch, AiOutlineDownload } from 'react-icons/ai'
import { saveAs } from 'file-saver'
import Spinner from '../../../../Components/Progress/Spinner'
import { BatchContext } from '../../../../Context/BatchContext'
import AttendanceNotFound from './AttendanceNotFound'
import profilePlaceholder from '../../../../Assets/Images/profilePlaceholder.svg'
import { ConvertTime, ReturnDay } from '../../../../Global/Functions'
import Controls from '../../../../Components/Controls/Controls'
import ConfirmDialog from '../../../../Components/Dialogs/ConfirmDialog'

const SearchArray = (key, arr) => {
  let result
  arr.forEach((element) => {
    if (element.id === key) {
      result = element
    }
  })
  return result
}

const LectureDate = (lectureId, lectures, classes) => {
  if (lectures.length !== 0 && lectureId.length !== 0) {
    const targetLecture = SearchArray(lectureId, lectures)
    const date = new Date(targetLecture.starts * 1000)

    return (
      <div className={classes.date_div}>
        <p className={classes.date}>{date.toLocaleDateString('it-IT')}</p>
        <p className={classes.date}>{ReturnDay(date.getDay())}</p>
      </div>
    )
  }
}

const LectureDuration = (lectureId, lectures) => {
  if (lectures.length !== 0 && lectureId.length !== 0) {
    const targetLecture = SearchArray(lectureId, lectures)

    const startTime = ConvertTime(targetLecture.starts)
    const endTime = ConvertTime(targetLecture.ends)

    return `${startTime.toLocaleTimeString('it-IT').slice(0, 5)} - ${endTime
      .toLocaleTimeString('it-IT')
      .slice(0, 5)}`
  }
}

const StudentDetails = (name, email, avatar, classes) => (
  <div className={classes.studentDetails}>
    <Avatar
      src={avatar === null ? profilePlaceholder : avatar}
      style={{ width: 40, height: 40 }}
    />
    <div className={classes.information}>
      <p className="bolder">{name}</p>
      <p className="finest-text">{email}</p>
    </div>
  </div>
)

const NameBar = (
  name,
  classes,
  showSearchBar,
  setShowSearchBar,
  searchQuery,
  setSearchQuery,
) => {
  const clearSearchBar = () => {
    setSearchQuery('')
    setShowSearchBar(false)
  }

  return (
    <>
      {showSearchBar ? (
        <Grow in={showSearchBar}>
          <Controls.Input
            placeholder="Search for student"
            fullWidth
            autoFocus
            onChange={(e) => setSearchQuery(e.target.value)}
            className={classes.searchBar}
            value={searchQuery}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoIosSearch />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment
                  position="end"
                  onClick={clearSearchBar}
                  className="cursor-pointer"
                >
                  <IoMdClose />
                </InputAdornment>
              ),
            }}
          />
        </Grow>
      ) : (
        <Fade in={!showSearchBar}>
          <div className={classes.nameBar}>
            <p>{name}</p>
            <AiOutlineSearch
              size={24}
              className={classes.search}
              onClick={() => setShowSearchBar(true)}
            />
          </div>
        </Fade>
      )}
    </>
  )
}

const useStyles = makeStyles({
  root: {
    width: '100%',
    borderRadius: '8px',
    boxShadow: '2px 4px 6px 2px rgba(0, 0, 0, 0.06)',
  },
  gridContainer: {
    padding: '20px',
  },
  tableContainer: {
    maxHeight: '75vh',
    borderRadius: '8px',
  },
  pageBtnDiv: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerCell: {
    backgroundColor: '#7d7d7d',
    color: '#fff',
    padding: '0px 16px',
  },
  studentDetails: {
    display: 'flex',
    alignItems: 'center',
  },
  information: {
    margin: '0px 0px 0px 10px',
  },
  rowStyle: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgba(100, 129, 228, 0.1)',
    },
    '&:first-child': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
  timeCellStyle: {
    padding: '5px 0px',
    color: 'rgba(51, 51, 51, 0.8)',
    fontSize: '0.7rem',
    fontWeight: '500',
  },
  date: {
    lineHeight: 1.5,
  },
  date_div: {
    padding: '10px 0px',
  },
  nameBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  search: {
    cursor: 'pointer',
  },
  searchBar: {
    marginLeft: 'auto',
    '@media(max-width: 1024px)': {
      width: '30%',
    },
    backgroundColor: '#fff',
    borderRadius: 15.5,

    '& .MuiInputBase-root': {
      borderRadius: 15.5,
      height: 34,
      margin: 'auto 0',
      '& .MuiInputBase-input': {
        fontSize: '0.9rem',
      },
    },
  },
})

const Attendance = ({ id }) => {
  const classes = useStyles()
  const {
    FindBatchWithCode,
    batchByCode,
    GetAttendance,
    attendance,
    loading,
    GetEnrolledStudentsInBatch,
    allBatchStudents,
    GetLectures,
    lectures,
    setLoading,
    DownloadAttendance,
  } = useContext(BatchContext)

  const [columns, setColumns] = useState([])
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [classEntries, setClassEntries] = useState([])
  const [lastPage, setLastPage] = useState(0)
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchedData, setSearchedData] = useState([])
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [csvData, setCsvData] = useState({})

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true)
    handleDownloadAttendance()
  }

  const search = (searchToken) => {
    setSearchedData(
      allBatchStudents.filter((val) =>
        val.name.toLowerCase().includes(searchToken.toLowerCase()),
      ),
    )
  }

  const handleDownloadAttendance = async () => {
    const res = await DownloadAttendance({
      batch_id: id,
    })
    setCsvData(res.data)
  }

  const handleCsvDownload = () => {
    const dataForCsv = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })

    saveAs(dataForCsv, 'data.csv')
  }

  useEffect(() => {
    search(searchQuery)
  }, [searchQuery])

  const chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size),
    )

  const handleForward = () => {
    setPage(page + 1)
  }

  const handleBack = () => {
    setPage(page - 1)
  }

  const fetchData = async () => {
    setLoading(true)
    await FindBatchWithCode(id)
    await GetEnrolledStudentsInBatch(id)
    await GetLectures(id)
    await GetAttendance(id)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    return () => {
      setColumns([])
      setRows([])
      setPage(0)
      setClassEntries([])
      setLastPage(0)
    }
  }, [])

  useEffect(() => {
    if (Object.keys(attendance) !== 0) {
      setClassEntries(Object.keys(attendance))
    }
  }, [Object.keys(attendance).length])

  useEffect(() => {
    if (Object.keys(attendance).length !== 0) {
      if (classEntries.length !== 0) {
        const chunkArr = chunk(classEntries, 10)

        setLastPage(chunkArr.length)

        chunkArr.forEach((element, i) => {
          if (page === i) {
            const tempColumns = [
              {
                id: 'name',
                label: NameBar(
                  'Name',
                  classes,
                  showSearchBar,
                  setShowSearchBar,
                  searchQuery,
                  setSearchQuery,
                ),
                minWidth: 300,
                maxWidth: 300,
              },
            ]
            const tempRows = []
            const tempTimeRow = {}

            element.forEach((item) => {
              tempColumns.push({
                id: item,
                label: LectureDate(item, lectures, classes),
                align: 'center',
                minWidth: 103,
                maxWidth: 103,
              })

              tempTimeRow[item] = LectureDuration(item, lectures)
            })

            tempRows.push(tempTimeRow)

            let data = []

            if (searchQuery === '') {
              data = [...allBatchStudents]
            } else {
              data = [...searchedData]
            }

            data.sort((a, b) => a.name.localeCompare(b.name))

            data.forEach((student) => {
              const tempRowObject = {}

              element.forEach((item) => {
                if (Object.keys(tempRowObject).length === 0) {
                  tempRowObject.name = StudentDetails(
                    student.name,
                    student.email,
                    student.avatar,
                    classes,
                  )
                }

                tempRowObject[item] = attendance[item][student.id]
                  ? attendance[item][student.id].toFixed(0)
                  : 'AB'
              })

              tempRows.push(tempRowObject)
            })

            setColumns(tempColumns)
            setRows(tempRows)
          }
        })
      }
    }
  }, [page, classEntries, allBatchStudents, showSearchBar, searchQuery])

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Suspense fallback={<Spinner />}>
          <Grid container className={classes.gridContainer}>
            <Grid container>
              <Grid item xs={9}>
                <Grid container>
                  <Grid item xs={12}>
                    <p className="bolder route-heading">Attendance</p>
                  </Grid>
                  <Grid item xs={12}>
                    <Breadcrumbs
                      separator={<IoIosArrowForward />}
                      aria-label="breadcrumb"
                    >
                      <Link color="inherit" href="/dashboard">
                        Dashboard
                      </Link>
                      <Link color="inherit" href={`/dashboard/view/${id}`}>
                        {batchByCode.name || ''}
                      </Link>
                      <Typography color="textPrimary">Attendance</Typography>
                    </Breadcrumbs>
                  </Grid>
                </Grid>
              </Grid>

              {Object.keys(attendance).length !== 0 && (
                <Grid item xs={3}>
                  <Controls.Button
                    text="Download Report"
                    startIcon={<AiOutlineDownload />}
                    onClick={handleOpenConfirmDialog}
                  />
                </Grid>
              )}
            </Grid>
            {Object.keys(attendance).length !== 0 && (
              <>
                <div className={classes.pageBtnDiv}>
                  <IconButton onClick={handleBack} disabled={page === 0}>
                    <IoChevronBack />
                  </IconButton>
                  {page + 1} - {lastPage}
                  <IconButton
                    onClick={handleForward}
                    disabled={page === lastPage - 1}
                  >
                    <IoChevronForward />
                  </IconButton>
                </div>
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

                      <TableBody className={classes.tableBody}>
                        {rows.map((row, index) => (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            classes={{
                              root: classes.rowStyle,
                            }}
                            key={row.code}
                          >
                            {columns.map((column) => {
                              const value = row[column.id]
                              return (
                                <TableCell
                                  key={column.id}
                                  align={column.align}
                                  className={
                                    index === 0 && classes.timeCellStyle
                                  }
                                >
                                  {value >= 0 && value <= 100
                                    ? `${value}%`
                                    : value}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </>
            )}
          </Grid>
          {Object.keys(attendance).length === 0 && <AttendanceNotFound />}
        </Suspense>
      )}
      {openConfirmDialog && (
        <ConfirmDialog
          open={openConfirmDialog}
          setOpen={setOpenConfirmDialog}
          title="Download Report"
          content="Are you sure you want to download Attendance Report?"
          yesAction={handleCsvDownload}
          noAction={() => setOpenConfirmDialog(false)}
        />
      )}
    </>
  )
}

export default Attendance
