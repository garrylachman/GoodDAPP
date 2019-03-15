// @flow
import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import type { Store } from 'undux'

import GDStore from '../../lib/undux/GDStore'
import { createStackNavigator, PushButton } from '../appNavigation/stackNavigation'
import TabsView from '../appNavigation/TabsView'
import { Avatar, BigGoodDollar, Section, Wrapper } from '../common'
import Amount from './Amount'
import Claim from './Claim'
import FaceRecognition from './FaceRecognition'
import Reason from './Reason'
import Receive from './Receive'
import ReceiveAmount from './ReceiveAmount'
import ScanQR from './ScanQR'
import Send from './Send'
import SendConfirmation from './SendConfirmation'
import SendLinkSummary from './SendLinkSummary'
import SendQRSummary from './SendQRSummary'
import { weiToMask } from '../../lib/wallet/utils'
export type DashboardProps = {
  screenProps: any,
  navigation: any,
  store: Store
}

class Dashboard extends Component<DashboardProps, {}> {
  render() {
    const { screenProps, navigation, store }: DashboardProps = this.props
    const { balance, entitlement } = store.get('account')

    return (
      <View>
        <TabsView goTo={navigation.navigate} routes={screenProps.routes} />
        <Wrapper>
          <Section>
            <Section.Row style={styles.centered}>
              <Avatar size={80} />
            </Section.Row>
            <Section.Row style={styles.centered}>
              <Section.Title>John Doe</Section.Title>
            </Section.Row>
            <Section.Row style={styles.centered}>
              <BigGoodDollar number={balance} />
            </Section.Row>
            <Section.Row style={styles.buttonRow}>
              <PushButton routeName={'Send'} screenProps={screenProps} style={styles.leftButton}>
                Send
              </PushButton>
              <PushButton routeName={'Claim'} screenProps={screenProps}>
                <Text style={[styles.buttonText]}>Claim</Text>
                <br />
                <Text style={[styles.buttonText, styles.grayedOutText]}>
                  {weiToMask(entitlement, { showUnits: true })}
                </Text>
              </PushButton>
              <PushButton routeName={'Receive'} screenProps={screenProps} style={styles.rightButton}>
                Receive
              </PushButton>
            </Section.Row>
          </Section>
        </Wrapper>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  buttonRow: {
    alignItems: 'stretch',
    marginTop: normalize(10)
  },
  grayedOutText: {
    color: '#d5d5d5',
    fontSize: normalize(10)
  },
  leftButton: {
    flex: 1,
    marginRight: normalize(10)
  },
  rightButton: {
    flex: 1,
    marginLeft: normalize(10)
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  }
})

const dashboard = GDStore.withStore(Dashboard)

dashboard.navigationOptions = {
  navigationBarHidden: true
}

export default createStackNavigator({
  Dashboard: dashboard,
  Claim,
  Receive,
  Amount,
  Reason,
  ReceiveAmount,
  Send,
  SendLinkSummary,
  SendConfirmation,
  FaceRecognition,
  ScanQR,
  SendQRSummary
})
