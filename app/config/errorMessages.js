/** This file exports an object with properties with string values used as
 *  errorMessages messages. This is used to make easy changes in errorMessages messages.
 */

const errorMessages = {
    emailRequired: 'Email is required',
    mobileRequired: 'Mobile is required',
    passwordRequired: 'Password is required',

    emailUnique: 'This email is already registered with us',
    mobileUnique: 'This mobile is already registered with us',

    emailInvalid: 'Invalid email adress',
    mobileInvalid: 'Invalid mobile'

}

module.exports = {
    errorMessages
}