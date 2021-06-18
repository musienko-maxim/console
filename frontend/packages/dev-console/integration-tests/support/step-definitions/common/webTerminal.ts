import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps';
import { webTerminalPage } from '../../pages/web-terminal/webTerminal-page';
import { switchPerspective } from '../../constants';
import { perspective } from '../../pages';
import { guidedTour } from '../../../../../integration-tests-cypress/views/guided-tour';

const username = Cypress.env('BASIC_USER_NAME') || 'consoledeveloper';
const password = Cypress.env('BASIC_USER_PASSSWORD') || 'developer';
const kubeAdmUserName = Cypress.env('KUBEADMIN_NAME') || 'kubeadmin';
const kubeAdmUserPass = Cypress.env('BRIDGE_KUBEADMIN_PASSWORD');

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

//check  existing of web terminal in the dedicated project. Create it for the correct checling if a webterminal instance is not existed.
// It nedds the web-teminal-basic.feature
Given('user has installed webTerminal in namespace {string}', (namespace: string) => {
  let devWsExistingOutput: string = '';
  cy.exec(`oc get DevWorkspace -n ${namespace}`, { failOnNonZeroExit: false })
    .then((result) => {
      devWsExistingOutput = result.stderr;
    })
    .then(() => {
      if (
        devWsExistingOutput.startsWith('No resources found') ||
        devWsExistingOutput.includes('Forbidden')
      ) {
        installDevWs(namespace);
      }
    });
});

And('user has logged in as basic user', () => {
  cy.logout();
  cy.login(
    Cypress.env('BASIC_USER_IDP'),
    Cypress.env('BASIC_USER_NAME'),
    Cypress.env('BASIC_USER_PASSSWORD'),
  );
  perspective.switchTo(switchPerspective.Developer);
  guidedTour.close();
});

//create web terminal instance in dedicated namespace  under basic user and relogin as admin with oc client
function installDevWs(dedicatedNamespace: string) {
  cy.exec(`oc login -u ${username}  -p ${password} --insecure-skip-tls-verify`)
  cy.exec(`oc new-project  ${dedicatedNamespace}`);
  cy.exec(`oc apply -f testData/yamls/web-terminal/web-terminal.yaml -n ${dedicatedNamespace}`);
  cy.exec(`oc login -u ${kubeAdmUserName}  -p ${kubeAdmUserPass} --insecure-skip-tls-verify`);
}
