import React, { useContext } from 'react'
import { Breadcrumbs, Link, Typography } from '@material-ui/core'
import { IoIosArrowForward } from 'react-icons/io'
import { BatchContext } from '../../Context/BatchContext'
import ComingSoon from '../../Components/ComingSoon/ComingSoon'
import ComingSoonImage from '../../Assets/Images/EbooksComingSoon.png'

const Ebooks = ({ id }) => {
  const { batchByCode } = useContext(BatchContext)

  return (
    <div>
      <div className="ebook-title">
        <div className="ebook-title__title">e-Books</div>
        <Breadcrumbs separator={<IoIosArrowForward />} aria-label="breadcrumb">
          <Link color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Link color="inherit" href={`/dashboard/view/${id}`}>
            {batchByCode.name}
          </Link>
          <Typography color="textPrimary">e-books</Typography>
        </Breadcrumbs>
      </div>
      <ComingSoon
        src={ComingSoonImage}
        content="e-books coming Soon. You will be able to download and save books."
      />
    </div>
  )
}

export default Ebooks
