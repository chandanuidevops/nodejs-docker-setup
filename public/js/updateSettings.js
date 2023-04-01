import axios from 'axios'
import { showAlert, hideAlert } from './alerts';
export const updateSettings=async (data,type)=>{
    try {
        
        const res = await axios({
            method:'PATCH',
            url:type==='password'
            ?'/api/v1/users/updatePassword'
            :'/api/v1/users/updateMe',
            data:
                data
            
        })
        if(res.data.status==='success'){
            showAlert('success','Data updated successfully!')
        }
    } catch (error) {
        showAlert('error',error.response.data.message)
    }
}