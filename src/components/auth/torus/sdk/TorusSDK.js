import { first, omit } from 'lodash'

import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'
import Torus from './torus'

import {
  Auth0Strategy,
  FacebookStrategy,
  GoogleLegacyStrategy,
  GoogleStrategy,
  PaswordlessEmailStrategy,
  PaswordlessSMSStrategy,
} from './strategies'

class TorusSDK {
  strategies = {}

  static factory() {
    const sdk = new TorusSDK(Config, logger.child({ from: 'TorusSDK' }))

    sdk.addStrategy('facebook', FacebookStrategy)
    sdk.addStrategy('google-old', GoogleLegacyStrategy)
    sdk.addStrategy('google', GoogleStrategy)
    sdk.addStrategy('auth0', Auth0Strategy)
    sdk.addStrategy('auth0-pwdless-email', PaswordlessEmailStrategy)
    sdk.addStrategy('auth0-pwdless-sms', PaswordlessSMSStrategy)

    return sdk
  }

  constructor(config, logger) {
    const { env, torusProxyContract, torusNetwork } = config

    this.torus = new Torus(config, {
      proxyContractAddress: torusProxyContract, // details for test net
      network: torusNetwork, // details for test net
      enableLogging: env === 'development',
    })

    this.config = config
    this.logger = logger
  }

  // eslint-disable-next-line require-await
  async initialize() {
    const { torus } = this

    return torus.init()
  }

  async triggerLogin(verifier, customLogger = null) {
    const { logger, strategies } = this
    const log = customLogger || logger
    let withVerifier = verifier

    log.debug('triggerLogin', { verifier })

    if (!verifier || !(verifier in strategies)) {
      withVerifier = 'facebook'
    }

    const response = await strategies[withVerifier].triggerLogin()

    return this.fetchTorusUser(response, customLogger)
  }

  addStrategy(verifier, strategyClass) {
    const { config, torus, strategies } = this

    strategies[verifier] = new strategyClass(torus, config)
  }

  fetchTorusUser(response, customLogger = null) {
    const { logger, config } = this
    const log = customLogger || logger

    let torusUser = response
    let { userInfo, ...otherResponse } = torusUser

    if (userInfo) {
      // aggregate login returns an array with user info
      userInfo = first(userInfo) || userInfo
      torusUser = { ...otherResponse, ...userInfo }
    }

    const { name, email } = torusUser
    const isLoginPhoneNumber = /\+[0-9]+$/.test(name)

    if (isLoginPhoneNumber) {
      torusUser = { ...torusUser, mobile: name }
    }

    if (isLoginPhoneNumber || name === email) {
      torusUser = omit(torusUser, 'name')
    }

    if ('production' !== config.env) {
      log.debug('Received torusUser:', torusUser)
    }

    return torusUser
  }
}

export default TorusSDK.factory()
