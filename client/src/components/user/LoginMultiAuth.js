import React from 'react'
import axios from 'axios';
import User from './User';

class UserLoginMultiAuth extends React.Component {

    constructor() {
        super()
        this.state = {
            mfa: ''
        }
    }

    handleSubmit = (e) => {
        e.preventDefault()
        console.log(localStorage.getItem('otp-auth'))
        axios.post('/users/login/multi-auth', { otp: this.state.mfa }, { headers: { 'otp-auth': localStorage.getItem('otp-auth') } })
            .then((response) => {
                localStorage.setItem('x-auth', response.data.token)
                localStorage.setItem('qr', response.data.mfa)
                this.props.updateUser()
                this.props.history.push('/users')
            })
    }

    handleChange = (e) => {
        e.persist()
        this.setState(() => ({ mfa: e.target.value }))
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="border p-5 m-auto rounded shadow" style={{ 'max-width': '380px' }}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="MFA Token"
                            onChange={this.handleChange}
                            value={this.state.mfa}
                            className='form-control input-margin-custom border-bottom-custom'
                        />
                    </div>
                    <div className="d-flex justify-content-center">
                        <button className='btn btn-success rounded-pill custom-submit'>Login</button>
                    </div>
                </div>
            </form>
        )
    }
}

export default UserLoginMultiAuth