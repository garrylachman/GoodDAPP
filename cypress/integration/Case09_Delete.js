/* eslint-disable no-undef */
import StartPage from '../PageObjects/StartPage'
import HomePage from '../PageObjects/HomePage'
import LoginPage from '../PageObjects/LoginPage'

describe('Test case 9: Delete temporary user', () => {
  it('User to sign up and delete', () => {
    StartPage.open()
    StartPage.signInButton.click()
    LoginPage.recoverFromPassPhraseLink.click()
    LoginPage.pageHeader.should('contain', 'Recover')
    cy.readFile('cypress/fixtures/userMnemonicSave.txt', { timeout: 10000 }).then(mnemonic => {
      LoginPage.mnemonicsInput.type(mnemonic)
      LoginPage.recoverWalletButton.click()
      LoginPage.yayButton.click()
      HomePage.waitForHomePageDisplayed()
    })
    HomePage.optionsButton.click({ force: true })
    HomePage.deleteAccountButton.click()
    HomePage.confirmDeletionButton.click()
    StartPage.createWalletButton.should('be.visible')
  })
})
