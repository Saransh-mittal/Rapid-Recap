import { useMemo } from 'react'
import Card from './Card'
import { formatDate } from '../../utils/helper.utils'

const TimelineItem = ({ newsNumber, data }) => {
  // console.log(data);
  return (
    <>
      <Card
        newsNumber={newsNumber}
        data={data}
        title={data?.title}
        image={
          Array.isArray(data?.imgURL) && data?.imgURL.length > 0
            ? data.imgURL[0]
            : rrImage
        }
        category={data?.category}
        date={formatDate(data?.dateTime)}
        readTime={data.avgReadTime}
      />
    </>
  )
}

export default TimelineItem
