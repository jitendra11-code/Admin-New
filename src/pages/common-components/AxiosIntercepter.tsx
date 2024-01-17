import { useAuthMethod } from '@uikit/utility/AuthHooks';
import axios from 'axios';
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const instance = axios.create({
    baseURL:  process.env.REACT_APP_BASEURL
})

const AxiosInterceptor = ({ children }) => {

    const navigate = useNavigate();
    const { logout } = useAuthMethod();
    useEffect(() => {
        const resInterceptor = response => {
            return response;
        }

        const errInterceptor = error => {

            if (error?.response?.status === 401) {
                //logout();
                //navigate('/signin');
            }

            return Promise.reject(error);
        }


        const interceptor = instance.interceptors.response.use(resInterceptor, errInterceptor);

        return () => instance.interceptors.response.eject(interceptor);

    }, [navigate])

    return children;
}


export default instance;
export { AxiosInterceptor }