import Gun from '@gooddollar/gun-appendonly'
import SEA from 'gun/sea'
import load from 'gun/lib/load'
/**
 * extend gundb SEA with decrypt to match ".secret"
 */
export default (() => {
  Gun.chain.putAck = function(data, cb) {
    var gun = this,
      callback =
        cb ||
        function(ctx) {
          return ctx
        }
    let promise = new Promise((res, rej) => gun.put(data, ack => (ack.err ? rej(ack) : res(ack))))
    return promise.then(callback)
  }
  Gun.User.prototype.secretAck = function(data, cb) {
    var gun = this,
      callback =
        cb ||
        function(ctx) {
          return ctx
        }
    let promise = new Promise((res, rej) => gun.secret(data, ack => (ack.err ? rej(ack) : res(ack))))
    return promise.then(callback)
  }

  Gun.User.prototype.decrypt = function(cb) {
    var gun = this,
      user = gun.back(-1).user(),
      pair = user.pair(),
      path = ''
    gun.back(function(at) {
      if (at.is) {
        return
      }
      path += at.get || ''
    })
    return (async () => {
      let sec = await user
        .get('trust')
        .get(pair.pub)
        .get(path)
        .then()
      sec = await SEA.decrypt(sec, pair)
      if (!sec) {
        return gun.then(cb)
      }
      return gun
        .then(async data => {
          let decrypted = await SEA.decrypt(data, sec)
          return decrypted
        })
        .then(cb)
    })()
  }
})()
