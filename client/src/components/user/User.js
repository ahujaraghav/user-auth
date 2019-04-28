import React from 'react'
import axios from 'axios';
var QRCode = require('qrcode.react');

class User extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mfaStatus: props.mfaStatus,
            email: props.email
        }
    }

    handleChange = (e) => {
        const isChecked = e.target.checked
        this.props.handleMfaChange(isChecked)
    }

    render() {
        return (
            <form>
                <div className="border p-5 m-auto rounded shadow text-center" style={{ 'max-width': '380px' }}>
                    <h2 className="mb-2">Settings</h2>
                    <QRCode className="mt-5 mb-5" value={localStorage.getItem('qr')} /> <br />
                        <h5 className="">{this.state.email}</h5>
                        <label><input type="checkbox" checked={this.state.mfaStatus} onChange={this.handleChange} />  Multi-Factor Authentication </label>
                </div>
            </form>
                )
            }
        
        }
export default User