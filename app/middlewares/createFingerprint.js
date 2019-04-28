const useragent = require('useragent')

function createFingerprint(req, res, next){
    const ua = useragent.parse(req.headers['user-agent']).toJSON()
    const fingerprint = {
        ip: req.ip,
        os: ua.os.family,
        'os-version': ua.os.major,
        agent: ua.family,
        'agent-version': ua.major,
        device: ua.device.family
    }

    req.fingerprint = fingerprint
    next()
}

module.exports = {
    createFingerprint
}