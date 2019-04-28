import React from 'react'
import axios from 'axios'

import { BrowserRouter, Route, Link } from 'react-router-dom'


import UserLogin from './components/user/Login'
import UserRegister from './components/user/Register'
import User from './components/user/User'
import UserLoginMultiAuth from './components/user/LoginMultiAuth'

class App extends React.Component {

  constructor() {
    super()
    this.state = {
      isAuthenticated: undefined,
      mfaStatus: undefined,
      email: undefined
    }
  }

  handleMfaChange = (isChecked) => {
    axios.put('/users/mfa', { mfa: isChecked }, { headers: { 'x-auth': localStorage.getItem('x-auth') } })
      .then((response) => {
        this.setState(() => ({
          mfaStatus: response.data.mfa.on
        }))
      })
  }

  updateUser = () => {
    if (localStorage.getItem('x-auth')) {
      axios.get('/users', { headers: { 'x-auth': localStorage.getItem('x-auth') } })
        .then((response) => {
          this.setState(() => ({ mfaStatus: response.data.mfa, email: response.data.email, isAuthenticated: true }))
        })
        .catch(() => {
          this.setState(() => ({ isAuthenticated: false }))
        })
    } else {
      this.setState(() => ({ isAuthenticated: false }))
    }
  }

  render() {
    return (
      <BrowserRouter>

        {this.state.isAuthenticated !== undefined &&
          <React.Fragment>

            <nav class="navbar navbar-dark bg-dark mb-3">
              <div className="d-flex w-100 li-parent justify-content-end" style={{ listStyleType: 'none' }}>
                <li className="mr-auto"><Link to="/">Home</Link></li>
                {this.state.isAuthenticated ?
                  <React.Fragment>
                    <li><Link className="nav-item" to="/users">Settings</Link></li>
                    <li><Link className="nav-item" to="/logout">Logout</Link></li>
                  </React.Fragment>
                  :
                  <React.Fragment>
                    <li><Link to="/register">Register</Link></li>
                    <li><Link to="/login">Login</Link></li>
                  </React.Fragment>
                }
              </div>
            </nav>

            {this.state.isAuthenticated ?
              <React.Fragment>
                <Route path="/users" component={(props) => {
                  return <User
                    {...props}
                    mfaStatus={this.state.mfaStatus}
                    email={this.state.email}
                    handleMfaChange={this.handleMfaChange} />
                }} />
                <Route path="/logout" component={(props) => {
                  localStorage.clear()
                  this.updateUser()
                  props.history.push("/")
                  return <></>
                }} />
              </React.Fragment>
              :
              <React.Fragment>
                <Route path="/login" render={(props)=>{
                  return <UserLogin {...props} updateUser={this.updateUser} />
                }} exact={true} />
                <Route path="/register" render={(props)=>{
                  return <UserRegister {...props} updateUser={this.updateUser} />}}
                  />
                <Route path="/login/multi-auth" render={(props)=>{
                  return <UserLoginMultiAuth {...props} updateUser={this.updateUser} />
                }} exact={true} />
              </React.Fragment>
            }

            <Route path="/" exact={true} render={() => {
              return (
                <div className="border p-2 mt-5 mx-auto rounded shadow text-center" style={{ 'max-width': '480px' }}>
                  <h3 className="">About this Application</h3>
                  <ol>
                    <li>This app demonstrates Multi-Factor User Authentication.</li>
                    <li>You will need Google Authenticator App to test this.</li>
                    <li>Multi-Factor Authentication is turned off by default.</li>
                    <li>This app saves your browser fingerprint, once logged in MFA wont be required again for that browser.</li>
                  </ol>
                </div>
              )
            }} />
          </React.Fragment>
        }
      </BrowserRouter>
    )
  }

  componentDidMount() {
    this.updateUser()
  }
}
export default App