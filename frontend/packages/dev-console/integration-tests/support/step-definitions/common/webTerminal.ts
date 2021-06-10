import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import { webTerminalPage } from '../../pages/web-terminal/webTerminal-page';
import { switchPerspective } from '../../constants';
import { perspective } from '../../pages';
import { guidedTour } from '../../../../../integration-tests-cypress/views/guided-tour';

Given('user can see terminal icon on masthead', () => {
  webTerminalPage.verifyCloudShellBtn();
});
Given('user has logged in as admin user', () => {});

When('user clicks on the Web Terminal icon on the Masthead', () => {
  webTerminalPage.clickOpenCloudShellBtn();
});

Then('user will see the terminal window', () => {
  webTerminalPage.verifyConnectionRediness();
});

Given('user has logged in as basic user', () => {
  // temporary solution for login as developer user
  cy.logout();
  cy.login('htpasswd', Cypress.env('BASIC_USER_NAME'), Cypress.env('BASIC_USER_PASSSWORD'));
  perspective.switchTo(switchPerspective.Developer);
  guidedTour.close();
});
