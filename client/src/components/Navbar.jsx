import {assets} from '../assets/assets.js'
const Navbar = () => {
  return (
    <div className='w-full flex justify-between p-4 sm:p-6 sm:px-24 items-center absolute top-0'>
        <img src={assets.logo} alt="Logo" className='w-28 sm:w-32' />
        <button className='border border-gray-500 px-6 py-2 text-gray-800 rounded-full flex justify-center items-center gap-2 hover:bg-gray-100 transition-all'>Login <img src={assets.arrow_icon} alt="login button" /></button>
    </div>
  )
}
export default Navbar