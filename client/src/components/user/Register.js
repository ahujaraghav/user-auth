import React from 'react'
import axios from 'axios'

class UserRegister extends React.Component {

    constructor() {
        super()
        this.state = {
            email: '',
            mobile: '',
            password: ''
        }
    }

    handleChange = (e) => {
        e.persist()
        this.setState(() => ({ [e.target.name]: e.target.value }))
    }

    handleSubmit = (e) => {
        e.preventDefault()
        axios.post('/users', { email: this.state.email, mobile: this.state.mobile, password: this.state.password })
            .then((response) => {
                if (response.data.token) {
                    localStorage.setItem('qr', response.data.mfa)
                    localStorage.setItem('x-auth', response.data.token)
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
                <h2 className='text-center'>Welcome</h2>
                    <div className="form-group">
                        <input
                            value={this.state.user}
                            name="email"
                            onChange={this.handleChange}
                            type='text'
                            placeholder='Email'
                            className='form-control input-margin-custom border-bottom-custom'
                        />
                        <input
                            value={this.state.mobile}
                            name="mobile"
                            onChange={this.handleChange}
                            type='text'
                            placeholder='Mobile'
                            className='form-control input-margin-custom border-bottom-custom'
                        />

                        <input
                            value={this.state.password}
                            name="password"
                            onChange={this.handleChange}
                            type='password'
                            placeholder='Password'
                            className='form-control input-margin-custom border-bottom-custom'
                        />

                        <div className="d-flex justify-content-center">
                            <button className='btn btn-success rounded-pill custom-submit'>Register</button>
                        </div>
                    </div>
                </div>
            </form>
        )
    }
}

export default UserRegister