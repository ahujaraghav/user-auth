import React from 'react'
import axios from 'axios'

class UserLogin extends React.Component {

    constructor() {
        super()
        this.state = {
            user: '',
            password: ''
        }
    }

    handleChange = (e) => {
        e.persist()
        this.setState(() => ({ [e.target.name]: e.target.value }))
    }

    handleSubmit = (e) => {
        e.preventDefault()
        axios.post('/users/login', { user: this.state.user, password: this.state.password })
            .then((response) => {
                // console.log(response.data)
                if (response.data.mfaRequired) {
                    localStorage.setItem('otp-auth', response.data.token)
                    this.props.history.push('/login/multi-auth')
                }
                else if (response.data.token) {
                    localStorage.setItem('x-auth', response.data.token)
                    localStorage.setItem('qr', response.data.mfa)
                    this.props.updateUser()
                    this.props.history.push('/users')
                }
            })
            .catch((err) => {
                console.log(err.response.data.error)
            })
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="border p-5 m-auto rounded shadow" style={{ 'max-width': '380px' }}>
                    <div className="form-group">
                        <input
                            value={this.state.user}
                            name="user"
                            onChange={this.handleChange}
                            type='text'
                            placeholder='Email or Mobile'
                            className='form-control input-margin-custom border-bottom-custom' />
                    </div>
                    <div className="form-group">
                        <input
                            value={this.state.password}
                            name="password"
                            onChange={this.handleChange}
                            type='password'
                            placeholder='Password'
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

export default UserLogin