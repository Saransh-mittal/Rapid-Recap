import { useLocation, useNavigate } from 'react-router-dom'
import Contact from '../screens/Contact'
import FeedbackModal from './getStartedComponents/modals/FeedbackModal'

const ContactLayout = () => {
  const location = useLocation()
  const isFeedbackRoute = location.pathname === '/contact/feedback'
  const navigate = useNavigate()

  return (
    <>
      <Contact />
      <FeedbackModal
        isOpen={isFeedbackRoute}
        onClose={() => navigate('/contact')}
      />
    </>
  )
}

export default ContactLayout
