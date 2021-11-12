import React from 'react'
import ViewListIcon from '@material-ui/icons/ViewList'
import DescriptionIcon from '@material-ui/icons/Description'
// import MenuBookIcon from '@material-ui/icons/MenuBook'
import PeopleAltIcon from '@material-ui/icons/PeopleAlt'
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm'
import AssignmentIcon from '@material-ui/icons/Assignment'
import EventNoteIcon from '@material-ui/icons/Event'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import { HiOutlineSpeakerphone } from 'react-icons/hi'
import { AiOutlineVideoCamera } from 'react-icons/ai'

// A=all - renders for all
// T=Teacher - renders only for T
// S=Student - renders only for S
export const SideNavOptions = [
  {
    title: 'Batch Details',
    icon: <ViewListIcon />,
    route: 'view',
    role: 'A',
  },
  {
    title: 'Attendance',
    icon: <EventNoteIcon />,
    route: 'attendance',
    role: 'A',
  },
  {
    title: 'Notice Board',
    icon: <HiOutlineSpeakerphone fontSize="1.5rem" />,
    route: 'notice',
    role: 'T',
  },
  {
    title: 'Notes',
    icon: <DescriptionIcon />,
    route: 'notes',
    role: 'A',
  },
  // {
  //   title: 'e-Books',
  //   icon: <MenuBookIcon />,
  //   route: 'ebooks',
  //   role: 'A',
  // },
  {
    title: 'Class Recordings',
    icon: <AiOutlineVideoCamera fontSize="1.45rem" style={{ marginLeft: 2 }} />,
    route: 'recordings',
    role: 'A',
  },
  {
    title: 'Assignments',
    icon: <AssignmentIcon />,
    route: 'assignment',
    role: 'A',
  },
  {
    title: 'Manage Students',
    icon: <PeopleAltIcon />,
    route: 'students',
    role: 'T',
  },
  {
    title: 'Class Timings',
    icon: <AccessAlarmIcon />,
    route: 'timings',
    role: 'T',
  },
  {
    title: 'Doubt Corner',
    icon: <HelpOutlineIcon />,
    route: 'doubt-corner',
    role: 'T',
  },
]

export default SideNavOptions
